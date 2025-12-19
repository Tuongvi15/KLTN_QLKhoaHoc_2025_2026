import { Button } from '@mui/material';
import { Skeleton } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../store';
import { QuestionUI } from '../../../components';
import { useGetQuizDetailQuery } from '../../../services/quiz.services';
import {
    useUpdateLastStepCompletedMutation,
    useGetLearningStateQuery,
} from '../../../services/registrationCourse.services';

interface QuestionAnswer {
    questionId: number;
    correctAnswer: number;
    userSelectedAnswer: number;
}

const LearningQuiz = () => {
    const { stepActive, registrationData } = useSelector(
        (state: RootState) => state.learningCourse,
    );

    const { data: quizData, isLoading } = useGetQuizDetailQuery(
        stepActive.quizId ?? -1,
    );

    const [updateLastStepCompleted] =
        useUpdateLastStepCompletedMutation();

    // 👉 dùng để refetch learning state (BE quyết định step tiếp theo)
    const { refetch: refetchLearningState } =
        useGetLearningStateQuery(registrationData?.registrationId ?? -1, {
            skip: !registrationData?.registrationId,
        });

    // ===== LOCAL STATE =====
    const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
    const [isShowAnswer, setIsShowAnswer] = useState(false);

    // ===== init answers khi load quiz =====
    useEffect(() => {
        if (quizData?.questions?.length) {
            setAnswers(
                quizData.questions.map((q: any) => ({
                    questionId: q.questionId,
                    correctAnswer: q.correctAnwser,
                    userSelectedAnswer: -1,
                })),
            );
            setIsShowAnswer(false);
        }
    }, [quizData]);

    const correctRate = useMemo(() => {
        if (answers.length === 0) return 0;
        const correct = answers.filter(
            a => a.correctAnswer === a.userSelectedAnswer,
        ).length;
        return correct / answers.length;
    }, [answers]);

    // ===== SUBMIT QUIZ (CHUẨN KIẾN TRÚC MỚI) =====
    const handleSubmit = async () => {
        if (!registrationData) return;

        await updateLastStepCompleted({
            registrationId: registrationData.registrationId,
            stepId: stepActive.stepId,
        }).unwrap();

        // ✅ BE là source of truth
        await refetchLearningState();
    };

    return (
        <div className="flex flex-col gap-12 bg-white px-8 py-8">
            {isLoading && <Skeleton active />}

            <p className="text-lg font-bold text-[#1677ff]">
                {quizData?.title}
            </p>

            {quizData?.questions.map((question: any, index: number) => (
                <QuestionUI
                    key={question.questionId}
                    position={index + 1}
                    question={question}
                    seperator="|"
                    isShowAnswer={isShowAnswer}
                    selectedAnswer={
                        answers.find(a => a.questionId === question.questionId)
                            ?.userSelectedAnswer
                    }
                    onAnswer={(questionId: number, answer: number) => {
                        setAnswers(prev =>
                            prev.map(a =>
                                a.questionId === questionId
                                    ? { ...a, userSelectedAnswer: answer }
                                    : a,
                            ),
                        );
                    }}
                />
            ))}

            {!isShowAnswer && (
                <Button
                    className="self-end"
                    variant="outlined"
                    disabled={
                        answers.length === 0 ||
                        answers.some(a => a.userSelectedAnswer === -1)
                    }
                    onClick={() => setIsShowAnswer(true)}
                >
                    Kiểm tra
                </Button>
            )}

            {isShowAnswer && correctRate < 0.8 && (
                <div className="space-x-3 self-end">
                    <span className="text-sm font-bold text-red-500">
                        Bạn phải đúng ít nhất 80% câu hỏi để qua
                    </span>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            setAnswers(prev =>
                                prev.map(a => ({
                                    ...a,
                                    userSelectedAnswer: -1,
                                })),
                            );
                            setIsShowAnswer(false);
                        }}
                    >
                        Thử lại
                    </Button>
                </div>
            )}

            {isShowAnswer && correctRate >= 0.8 && (
                <Button
                    className="self-end"
                    variant="outlined"
                    color="success"
                    onClick={handleSubmit}
                >
                    Tiếp tục
                </Button>
            )}
        </div>
    );
};

export default LearningQuiz;
