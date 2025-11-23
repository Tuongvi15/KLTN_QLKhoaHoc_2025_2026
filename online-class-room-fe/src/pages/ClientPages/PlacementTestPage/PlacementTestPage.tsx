import { useState } from "react";
import { Card, Button, Skeleton, Tag, Badge, Modal, Empty, Drawer } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
    useGetAllCategoriesQuery,
    useGetTestsByCategoryQuery,
} from "../../../services/placementtest.services";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    BookOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    PlayCircleOutlined,
    HistoryOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    CloseOutlined
} from "@ant-design/icons";

const PlacementTestPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { data: categories, isLoading: loadingCategories } = useGetAllCategoriesQuery();
    const userId = useSelector((state: RootState) => state.user.id);

    const { data: tests, isLoading: loadingTests } = useGetTestsByCategoryQuery(
        selectedCategory
            ? { categoryId: selectedCategory, accountId: userId }
            : { categoryId: 0, accountId: userId },
        { skip: !selectedCategory }
    );

    const navigate = useNavigate();
    const location = useLocation();

    const requireLogin = (callback: Function) => {
        if (!userId) {
            setShowLoginModal(true);
            return false;
        }
        callback();
        return true;
    };

    const handleCategoryClick = (categoryId: number) => {
        requireLogin(() => {
            setSelectedCategory(categoryId);
            setCategoryModalOpen(true);
        });
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "3": return "#faad14";
            case "2": return "#1890ff";
            default: return "#8c8c8c";
        }
    };

    const getLevelText = (level: string) => {
        switch (level) {
            case "3": return "Nâng cao";
            case "2": return "Trung cấp";
            default: return "Cơ bản";
        }
    };

    const selectedCategoryName = categories?.find(c => c.catgoryId === selectedCategory)?.name;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Bài test đầu vào
                            </h1>
                            <p className="text-gray-600">
                                Đánh giá năng lực và xác định cấp độ phù hợp với bạn
                            </p>
                        </div>
                        <Button
                            icon={<HistoryOutlined />}
                            size="large"
                            onClick={() => requireLogin(() => navigate("/placement-test/history"))}
                        >
                            Lịch sử
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Categories */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOutlined className="text-blue-500" />
                        Chọn danh mục
                    </h2>

                    {loadingCategories ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton.Button key={i} active block style={{ height: 80 }} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {categories?.map((c: any) => (
                                <div
                                    key={c.catgoryId}
                                    onClick={() => handleCategoryClick(c.catgoryId)}
                                    className="cursor-pointer rounded-lg p-6 border-2 border-gray-200 bg-white transition-all hover:shadow-lg hover:border-blue-500 hover:-translate-y-1"
                                >
                                    <div className="text-center">
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <BookOutlined className="text-3xl text-blue-500" />
                                        </div>
                                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[40px]">
                                            {c.name}
                                        </h3>
                                        {c.description && (
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                {c.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tests Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <BookOutlined className="text-blue-500" />
                        <span>{selectedCategoryName}</span>
                    </div>
                }
                open={categoryModalOpen}
                onCancel={() => setCategoryModalOpen(false)}
                footer={null}
                width={1000}
                closeIcon={<CloseOutlined />}
            >
                {loadingTests ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} active />
                        ))}
                    </div>
                ) : tests?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {tests.map((t: any) => {
                            const score = t.latestResult?.score || 0;
                            const level = t.latestResult?.level || "1";
                            const hasResult = !!t.latestResult;

                            return (
                                <Card
                                    key={t.placementTestId}
                                    className="hover:shadow-md transition-shadow"
                                    bodyStyle={{ padding: "16px" }}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2">
                                            {t.title}
                                        </h3>
                                        <Tag color={t.isActive ? "success" : "default"} className="ml-2">
                                            {t.isActive ? "Hoạt động" : "Tạm dừng"}
                                        </Tag>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {t.description || "Không có mô tả"}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FileTextOutlined />
                                            {t.questionCount} câu
                                        </span>
                                        {hasResult && (
                                            <span className="flex items-center gap-1">
                                                <ClockCircleOutlined />
                                                {new Date(t.latestResult.completedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Result Badge */}
                                    {hasResult ? (
                                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrophyOutlined
                                                        style={{
                                                            fontSize: 20,
                                                            color: getLevelColor(level)
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {score.toFixed(0)}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {getLevelText(level)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    count={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-3 p-3 bg-blue-50 rounded-lg text-center">
                                            <p className="text-sm text-blue-600">
                                                Chưa có kết quả
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <Button
                                        icon={<PlayCircleOutlined />}
                                        block
                                        onClick={() => {
                                            setCategoryModalOpen(false);
                                            navigate(`/placement-test/start/${t.placementTestId}`);
                                        }}
                                        className="h-11 rounded-xl text-white font-semibold 
               bg-gradient-to-r from-purple-600 to-pink-600 
               hover:opacity-90 transition-all"
                                    >
                                        {hasResult ? "Làm lại" : "Bắt đầu"}
                                    </Button>

                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Empty description="Không có bài test nào trong danh mục này" />
                )}
            </Modal>

            {/* Login Modal */}
            <Modal
                open={showLoginModal}
                onCancel={() => setShowLoginModal(false)}
                footer={null}
                centered
                width={400}
            >
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOutlined className="text-3xl text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900">
                        Yêu cầu đăng nhập
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Vui lòng đăng nhập để làm bài test đầu vào
                    </p>
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => {
                            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                        }}
                    >
                        Đăng nhập ngay
                    </Button>
                </div>
            </Modal>

            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default PlacementTestPage;