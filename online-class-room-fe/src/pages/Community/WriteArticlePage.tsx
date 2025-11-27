import React, { useState } from "react";
import { Input, Button, Upload, message } from "antd";
import { useNavigate } from "react-router-dom";
import ArticleEditor from "../../components/Community/ArticleEditor";
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

    const handleSaveDraft = async () => {
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
        <div className="max-w-3xl mx-auto mt-10 pb-8">
            <h1 className="text-3xl font-bold mb-4">Viết bài mới</h1>

            <Input
                placeholder="Tiêu đề bài viết..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold mb-4"
            />

            <div className="mb-4">
                <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                        handleCoverChange(file as File);
                        return false;
                    }}
                >
                    <Button>Tải ảnh bìa</Button>
                </Upload>

                {cover && (
                    <img
                        src={cover}
                        className="mt-3 w-full h-44 object-cover rounded-lg"
                    />
                )}
            </div>

            <ArticleEditor
                content={contentHtml}
                onChange={setContentHtml}
                uploadImage={(file) =>
                    uploadImageCustom(file, "community/contentImages")
                }
            />

            <div className="flex gap-3 mt-6">
                <Button loading={creating} onClick={handleSaveDraft}>
                    Lưu nháp
                </Button>

                <Button
                    type="primary"
                    loading={publishing}
                    onClick={handlePublish}
                >
                    Đăng bài
                </Button>
            </div>
        </div>
    );
}
