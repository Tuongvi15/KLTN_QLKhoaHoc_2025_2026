import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArticleEditor from "../../components/Community/ArticleEditor";
import {
    useGetArticleDetailQuery,
    useUploadImageMutation,
    useUpdateDraftMutation,
    usePublishArticleMutation
} from "../../services/community.services";
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EditDraftPage() {
    const { id } = useParams();
    const articleId = Number(id);
    const navigate = useNavigate();

    const { data: articleResp, isLoading } = useGetArticleDetailQuery(articleId);
    const [updateDraft, { isLoading: updating }] = useUpdateDraftMutation();
    const [publishArticle, { isLoading: publishing }] = usePublishArticleMutation();
    const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

    const [title, setTitle] = useState("");
    const [cover, setCover] = useState<string>();
    const [contentHtml, setContentHtml] = useState("");

    const article = articleResp?.data || articleResp;

    useEffect(() => {
        if (article) {
            setTitle(article.title || "");
            setCover(article.coverImageUrl);
            setContentHtml(article.contentHtml || "");
        }
    }, [article]);

    const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("file", file);

        try {
            const res = await uploadImage(fd).unwrap();
            setCover(res.url);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleSave = async () => {
        try {
            await updateDraft({
                id: articleId,
                data: {
                    title,
                    contentHtml,
                    coverImageUrl: cover,
                },
            }).unwrap();

            alert("Đã lưu bản nháp");
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const handlePublish = async () => {
        try {
            await updateDraft({
                id: articleId,
                data: {
                    title,
                    contentHtml,
                    coverImageUrl: cover,
                },
            }).unwrap();

            await publishArticle(articleId).unwrap();
            navigate(`/community/article/${articleId}`);
        } catch (error) {
            console.error('Publish failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/community/my-drafts')}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại bản nháp</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa bài nháp</h1>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            <span>●</span>
                            <span>Bản nháp</span>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="Tiêu đề bài viết..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-3xl font-bold mb-6 focus:outline-none placeholder-gray-300"
                    />

                    {/* Cover Upload */}
                    <div className="mb-6">
                        <label className="block mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <ImageIcon />
                                <span>Ảnh bìa</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadCover}
                                className="hidden"
                                id="cover-upload"
                            />
                            <label
                                htmlFor="cover-upload"
                                className="flex items-center justify-center gap-2 w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer group"
                            >
                                {uploading ? (
                                    <div className="text-gray-400">Đang tải...</div>
                                ) : cover ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={cover}
                                            alt="Cover"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                                Thay đổi ảnh
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="text-4xl text-gray-300 group-hover:text-purple-400 transition-colors mb-2" />
                                        <p className="text-gray-500 group-hover:text-purple-600 transition-colors">
                                            Nhấn để tải ảnh bìa
                                        </p>
                                    </div>
                                )}
                            </label>
                        </label>
                    </div>

                    {/* Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung
                        </label>
                        <ArticleEditor
                            content={contentHtml}
                            onChange={(html: string) => setContentHtml(html)}
                            uploadImage={async (file: File) => {
                                const fd = new FormData();
                                fd.append("file", file);
                                const res = await uploadImage(fd).unwrap();
                                return res.url;
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end sticky bottom-6">
                    <button
                        onClick={handleSave}
                        disabled={updating}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <SaveIcon />
                        <span>{updating ? 'Đang lưu...' : 'Lưu nháp'}</span>
                    </button>
                    
                    <button
                        onClick={handlePublish}
                        disabled={publishing || updating}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <PublishIcon />
                        <span>{publishing ? 'Đang đăng...' : 'Đăng bài'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}