import { useState, useEffect } from "react";
import { Input, Button, Upload, message } from "antd";
import { useNavigate } from "react-router-dom";
import CkEditorCustom from "../../components/Community/CkEditorCustom";
import { uploadImageCustom } from "../../utils/uploadImageCustom";
import {
    useCreateArticleMutation,
    usePublishArticleMutation,
} from "../../services/community.services";

export default function WriteArticlePage() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [cover, setCover] = useState<string>();
    const [contentHtml, setContentHtml] = useState("");

    const [createArticle, { isLoading: creating }] = useCreateArticleMutation();
    const [publishArticle, { isLoading: publishing }] = usePublishArticleMutation();

    // Upload cover bằng Firebase
    const handleCoverChange = async (file: File) => {
        try {
            const url = await uploadImageCustom(file, "community/covers");
            setCover(url);
            message.success("Tải ảnh bìa thành công!");
        } catch (e) {
            console.error(e);
            message.error("Upload ảnh bìa thất bại");
        }
    };
    function getAuth() {
        try {
            const json = sessionStorage.getItem("persist:root");
            if (!json) return null;

            const root = JSON.parse(json);
            const auth = JSON.parse(root.auth || "{}");

            return auth?.isLogin ? auth : null;
        } catch {
            return null;
        }
    }
useEffect(() => {
    if (!getAuth()) {
        navigate(`/login?redirect=/community/write`, { replace: true });
    }
}, []);

    const handleSaveDraft = async () => {
        if (!getAuth()) return navigate(`/login?redirect=/community/write`);
        if (!title.trim()) return message.warning("Tiêu đề không được để trống");

        try {
            await createArticle({
                title,
                contentHtml,
                coverImageUrl: cover,
            }).unwrap();

            message.success("Lưu nháp thành công");
            navigate("/community/my-drafts");
        } catch (e) {
            message.error("Lưu nháp thất bại");
        }
    };

    const handlePublish = async () => {
            if (!getAuth()) return navigate(`/login?redirect=/community/write`);

        if (!title.trim()) return message.warning("Tiêu đề không được để trống");

        try {
            const created = await createArticle({
                title,
                contentHtml,
                coverImageUrl: cover,
            }).unwrap();

            const articleId =
                created?.data?.articleId ||
                created?.articleId ||
                created?.ArticleId;

            await publishArticle(articleId).unwrap();

            message.success("Đã đăng bài");
            navigate(`/community/article/${articleId}`);
        } catch (e) {
            message.error("Đăng bài thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f7fb] pb-28">
            {/* HEADER */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <h1 className="text-xl font-semibold">✍️ Viết bài mới</h1>

                <div className="flex gap-2">
                    <Button onClick={handleSaveDraft} loading={creating}>
                        Lưu nháp
                    </Button>

                    <Button
                        loading={publishing}
                        onClick={handlePublish}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                    >
                        Xuất bản
                    </Button>

                </div>
            </div>

            {/* FORM BODY */}
            <div className="max-w-3xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                {/* TITLE */}
                <Input
                    placeholder="Tiêu đề bài viết..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl font-bold mb-6 border-none shadow-none px-0"
                />

                {/* COVER */}
                <div className="mb-6">
                    <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => {
                            handleCoverChange(file as File);
                            return false;
                        }}
                    >
                        <div className="w-full h-56 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
                            {cover ? (
                                <img
                                    src={cover}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <p className="text-gray-500">Tải ảnh bìa</p>
                            )}
                        </div>
                    </Upload>
                </div>

                {/* EDITOR */}
                <CkEditorCustom
                    value={contentHtml}
                    onChange={setContentHtml}
                    uploadImage={(file) =>
                        uploadImageCustom(file, "community/contentImages")
                    }
                />

            </div>

            {/* FLOATING ACTION BAR (F8 STYLE)
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg flex justify-end gap-3">
                <Button onClick={handleSaveDraft} loading={creating}>
                    Lưu nháp
                </Button>

                <Button
    loading={publishing}
    onClick={handlePublish}
    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
>
    Xuất bản
</Button>

            </div> */}
        </div>
    );
}
