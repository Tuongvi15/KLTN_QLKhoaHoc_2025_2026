import { useGetMyDraftsQuery } from "../../services/community.services";
import { Link } from "react-router-dom";

export default function MyDraftsPage() {
    const { data, isLoading } = useGetMyDraftsQuery({ page: 1, pageSize: 20 });

    if (isLoading) return <div>Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-6">Bản nháp của tôi</h1>

            {data.items.length === 0 && <div>Không có bài nháp nào.</div>}

            <div className="space-y-4">
                {data.items.map((draft: any) => (
                    <div
                        key={draft.articleId}
                        className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">{draft.title}</h2>
                            <div className="text-gray-500 text-sm">
                                Cập nhật: {new Date(draft.updatedAt || draft.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <Link
                            to={`/community/edit/${draft.articleId}`}
                            className="text-blue-600 hover:underline"
                        >
                            Chỉnh sửa →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
