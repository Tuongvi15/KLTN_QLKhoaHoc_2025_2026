import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Button, Radio, Card, Progress, message, Modal } from "antd";
import {
    useGetQuestionsByTestIdQuery,
    useSavePlacementResultMutation,
} from "../../../services/placementtest.services";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { ClockCircleOutlined } from "@ant-design/icons";
import CourseSuggestCard from "../../../components/CourseSuggestCard/CourseSuggestCard";

const TEST_DURATION = 15 * 60; // 15 phút

const PlacementTestStartPage = () => {
    const { id } = useParams();
    const accId = useSelector((state: RootState) => state.user.id);
    const { data: questions, isLoading } = useGetQuestionsByTestIdQuery(Number(id));
    const [saveResult] = useSavePlacementResultMutation();
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [latestResult, setLatestResult] = useState<any>(null);

    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0); // đảm bảo cuộn về đầu trang
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formattedTime = useMemo(() => {
        const min = Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0");
        const sec = (timeLeft % 60).toString().padStart(2, "0");
        return `${min}:${sec}`;
    }, [timeLeft]);

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!accId) {
            message.error("Bạn cần đăng nhập để làm bài test");
            return;
        }

        if (!questions?.length) {
            message.error("Không tìm thấy câu hỏi");
            return;
        }

        const total = questions.length;
        let correct = 0;

        const answerList = questions.map((q: any) => {
            const selected = answers[q.questionId];
            const isCorrect = selected === q.correctAnswer;
            if (isCorrect) correct++;
            return {
                questionId: q.questionId,
                selectedAnswer: selected,
                isCorrect,
            };
        });

        const score = (correct / total) * 100;
        let level = "1";
        if (score >= 80) level = "3";
        else if (score >= 50) level = "2";

        const resultData = {
            accountId: accId,
            placementTestId: Number(id),
            score,
            level,
            answers: answerList,
        };

        // try {
        //     await saveResult(resultData).unwrap();
        //     message.success(`Hoàn thành bài test! Điểm của bạn: ${score.toFixed(0)}%`);
        //     navigate("/placement-test/history");
        // } catch {
        //     message.error("Lỗi khi lưu kết quả!");
        // }
        try {
            const saved = await saveResult(resultData).unwrap();

            // lấy resultId từ backend trả về
            const resultId = saved.dataObject?.resultId;

            const res = await fetch(
                `https://localhost:7005/api/PlacementTest/results/suggestion-by-result/${resultId}`
            ).then(r => r.json());

            setLatestResult(res);
            setShowResultPopup(true);

        } catch {
            message.error("Lỗi khi lưu kết quả!");
        }


    };

    // Tính % tiến độ
    const progress = useMemo(() => {
        if (!questions?.length) return 0;
        return (Object.keys(answers).length / questions.length) * 100;
    }, [answers, questions]);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Thanh trên cùng */}
            <div className="flex items-center justify-between bg-white shadow-md px-8 py-3 fixed top-0 left-0 right-0 z-50">
                <h2 className="text-lg font-bold text-gray-700">
                    🧠 Bài test đầu vào
                </h2>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-1 text-gray-700 font-semibold">
                        <ClockCircleOutlined className="mr-2 text-red-500" />
                        {formattedTime}
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !font-semibold !rounded-full"
                    >
                        Nộp bài
                    </Button>
                </div>
            </div>

            {/* Nội dung test */}
            <div className="flex-1 overflow-y-auto mt-20 px-6 md:px-20 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Tiến trình */}
                    <div className="my-6">
                        <Progress
                            percent={Math.round(progress)}
                            strokeColor={{ from: "#8b5cf6", to: "#ec4899" }}
                            showInfo={true}
                        />
                        <p className="text-center text-gray-500 mt-2 text-sm">
                            Đã trả lời {Object.keys(answers).length}/{questions?.length || 0} câu
                        </p>
                    </div>

                    {isLoading ? (
                        <p className="text-center text-gray-500">Đang tải câu hỏi...</p>
                    ) : (
                        questions?.map((q: any, index: number) => {
                            const options = q.answerOptions.split("|").map((opt: string) => {
                                const [key, text] = opt.split(".");
                                return { key, text };
                            });

                            return (
                                <Card
                                    key={q.questionId}
                                    title={
                                        <span className="font-semibold text-gray-800">
                                            Câu {index + 1}: {q.questionText}
                                        </span>
                                    }
                                    className="shadow-lg rounded-xl mb-6 border border-gray-200 hover:shadow-xl transition-all"
                                >
                                    <Radio.Group
                                        onChange={(e) =>
                                            handleAnswerChange(q.questionId, e.target.value)
                                        }
                                        value={answers[q.questionId]}
                                        className="flex flex-col gap-3"
                                    >
                                        {options.map(
                                            (opt: { key: string; text: string }) => (
                                                <Radio
                                                    key={opt.key}
                                                    value={opt.key}
                                                    className="p-2 rounded-md hover:bg-gray-50 transition-all"
                                                >
                                                    <span className="font-medium text-gray-700">
                                                        {opt.key}. {opt.text}
                                                    </span>
                                                </Radio>
                                            )
                                        )}
                                    </Radio.Group>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
            <Modal
                open={showResultPopup}
                onCancel={() => navigate("/placement-test/history")}
                footer={null}
                centered
                width={600}
            >
                {latestResult && (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-3">
                            🎉 Kết quả bài test của bạn
                        </h2>

                        <p className="text-center text-gray-700 mb-4">
                            Điểm: <b>{latestResult.score}%</b> – Level: <b>{latestResult.level}</b>
                        </p>

                        <h3 className="text-lg font-semibold mb-2">Gợi ý khóa học phù hợp</h3>

                        <div className="grid grid-cols-1 gap-4">
                            {latestResult.recommendedCourses.map((c: any) => (
                                <CourseSuggestCard key={c.courseId} course={c} />
                            ))}
                        </div>


                        <Button
                            block
                            className="mt-6 bg-purple-600 text-white h-12 rounded-xl"
                            onClick={() => navigate("/placement-test/history")}
                        >
                            Xem lịch sử bài test
                        </Button>
                    </div>
                )}
            </Modal>

        </div>

    );
};

export default PlacementTestStartPage;
