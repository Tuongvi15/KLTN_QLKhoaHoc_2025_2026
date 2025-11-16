import { useState, useEffect } from "react";
import { Card, Button, Skeleton, Tag, Progress, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {
    useGetAllFieldsQuery,
    useGetTestsByFieldQuery,
} from "../../../services/placementtest.services";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import { useLocation } from "react-router-dom";

const PlacementTestPage = () => {
    const [selectedField, setSelectedField] = useState<number | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { data: fields, isLoading: loadingFields } = useGetAllFieldsQuery();
    const userId = useSelector((state: RootState) => state.user.id);

    const { data: tests, isLoading: loadingTests } = useGetTestsByFieldQuery(
        { fieldId: selectedField!, accountId: userId },
        { skip: !selectedField }
    );

    useEffect(() => {
        console.log("Fields data:", fields);
    }, [fields]);

    const navigate = useNavigate();
    const location = useLocation();

    // Hàm check đăng nhập
    const requireLogin = (callback: Function) => {
        if (!userId) {
            setShowLoginModal(true);
            return false;
        }
        callback();
        return true;
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50 py-10"
            style={{
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            {/* 🌟 HERO */}
            <div className="text-center mb-16">
                <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-4">
                    Bài test đầu vào
                </h1>

                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
                    Đánh giá năng lực học tập, xác định cấp độ phù hợp và gợi ý khóa học thích hợp 🎓
                </p>
            </div>

            {/* 🎓 LĨNH VỰC */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {loadingFields ? (
                    <Skeleton active />
                ) : (
                    fields?.map((f: any) => (
                        <div
                            key={f.fieldId}
                            onClick={() =>
                                requireLogin(() => setSelectedField(f.fieldId))
                            }
                            className={`cursor-pointer rounded-3xl shadow-lg p-8 border-2 transition-all duration-300 backdrop-blur-md ${selectedField === f.fieldId
                                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-105"
                                : "border-gray-200 bg-white hover:scale-105 hover:border-purple-400"
                                }`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
                                    <SchoolIcon className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">{f.name}</h3>
                                    <p className="text-gray-500 text-sm">
                                        {f.description || "Chưa có mô tả cho lĩnh vực này"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🧩 DANH SÁCH BÀI TEST */}
            {selectedField && (
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
                        <QuizIcon className="text-purple-600" /> Bài test thuộc lĩnh vực đã chọn
                    </h2>

                    {loadingTests ? (
                        <Skeleton active />
                    ) : tests?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tests.map((t: any) => {
                                const score = t.latestResult?.score || 0;
                                const level = t.latestResult?.level || "1";
                                const color =
                                    level === "3" ? "gold" : level === "2" ? "blue" : "gray";

                                return (
                                    <Card
                                        key={t.placementTestId}
                                        className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-none bg-white/90 backdrop-blur"
                                        title={
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-800">
                                                    {t.title}
                                                </span>
                                                <Tag color={t.isActive ? "green" : "red"}>
                                                    {t.isActive ? "Đang hoạt động" : "Tạm dừng"}
                                                </Tag>
                                            </div>
                                        }
                                    >
                                        <p className="text-gray-600 mb-4 min-h-[60px]">
                                            {t.description || "Không có mô tả cho bài test này."}
                                        </p>

                                        {/* 🧮 Thông tin phụ */}
                                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <QuizIcon fontSize="small" className="text-purple-500" />
                                                {t.placementQuestions?.length ?? ""} câu hỏi
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <AccessTimeIcon fontSize="small" className="text-pink-500" />
                                                {t.latestResult
                                                    ? new Date(t.latestResult.completedAt).toLocaleDateString()
                                                    : "Chưa làm"}
                                            </div>
                                        </div>

                                        {/* 🏆 Điểm và cấp độ */}
                                        {t.latestResult ? (
                                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <EmojiEventsIcon className="text-yellow-500" />
                                                    <span className="font-semibold text-gray-800">
                                                        {score.toFixed(0)}% – Level {level}
                                                    </span>
                                                </div>
                                                <Progress
                                                    percent={Math.min(score, 100)}
                                                    size="small"
                                                    showInfo={false}
                                                    strokeColor={color}
                                                    style={{ width: 100 }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-sm italic mb-4">
                                                Chưa có kết quả nào
                                            </div>
                                        )}

                                        {/* 🔘 Nút hành động */}
                                        <Button
                                            type="primary"
                                            onClick={() =>
                                                requireLogin(() =>
                                                    navigate(`/placement-test/start/${t.placementTestId}`)
                                                )
                                            }
                                            className="w-full h-11 rounded-full text-lg font-semibold border-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                                        >
                                            {t.latestResult ? "Làm lại bài test" : "Bắt đầu làm bài"}
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">
                            Không có bài test nào trong lĩnh vực này.
                        </p>
                    )}
                </div>
            )}

            {/* 🌈 Nút nổi xem lịch sử */}
            <button
                onClick={() =>
                    requireLogin(() => navigate("/placement-test/history"))
                }
                className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
            >
                <HistoryIcon />
                <span className="hidden sm:inline">Xem lịch sử</span>
            </button>

            {/* 🔒 MODAL LOGIN */}
            <Modal
                open={showLoginModal}
                onCancel={() => setShowLoginModal(false)}
                footer={null}
                centered
            >
                <div className="text-center py-6">
                    <h2 className="text-xl font-bold mb-2 text-purple-600">
                        Bạn chưa đăng nhập
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vui lòng đăng nhập để làm bài test đầu vào.
                    </p>

                    <button
                        onClick={() => {
                            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90"
                    >
                        Đăng nhập ngay
                    </button>

                </div>
            </Modal>
        </div>
    );
};

export default PlacementTestPage;
