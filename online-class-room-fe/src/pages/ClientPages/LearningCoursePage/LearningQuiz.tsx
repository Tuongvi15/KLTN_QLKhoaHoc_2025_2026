import { useDispatch, useSelector } from 'react-redux';
import { useGetQuizDetailQuery } from '../../../services/quiz.services';
import { RootState } from '../../../store';
import { QuestionUI } from '../../../components';
import { Button } from '@mui/material';
import {
    gotToNextStep,
    setNextStepCompletedPos,
    setQuestionList,
    setShowAnswer,
    tryAnswerAgain,
} from '../../../slices/learningCourseSlice';
import { useUpdateLastStepCompletedMutation } from '../../../services/registrationCourse.services';
import { useEffect } from 'react';
import { Skeleton } from 'antd';

const LearningQuiz = () => {
    const dispatch = useDispatch();
    const { isShowAnswer, stepActive, quizAnswer, registrationData } = useSelector(
        (state: RootState) => state.learningCourse,
    );

    // ✅ FIX: gọi quiz đúng – KHÔNG check quizId === 1
    const { data: quizData, isLoading } = useGetQuizDetailQuery(
        stepActive.quizId ?? -1,
    );

    const [updateLastStepCompleted, { isSuccess }] =
        useUpdateLastStepCompletedMutation();

    // ✅ FIX: chỉ init quizAnswer 1 LẦN
    useEffect(() => {
        if (quizData?.questions?.length && quizAnswer.length === 0) {
            dispatch(setQuestionList(quizData.questions));
        }
    }, [quizData]);

    useEffect(() => {
        if (isSuccess) {
            dispatch(setNextStepCompletedPos());
            dispatch(gotToNextStep());
        }
    }, [isSuccess]);

    const correctRate =
        quizAnswer.length === 0
            ? 0
            : quizAnswer.filter(
                  (q) => q.correctAnswer === q.userSelectedAnswer,
              ).length / quizAnswer.length;

    const handleGoToNext = () => {
        updateLastStepCompleted({
            registrationId: registrationData!.registrationId,
            stepId: stepActive.stepId,
        });
    };

    return (
        <div className="flex flex-col gap-12 bg-white px-8 py-8">
            {isLoading && <Skeleton active />}

            <p className="text-lg font-bold text-[#1677ff]">
                {quizData?.title}
            </p>

            {quizData?.questions.map((question, index) => (
                <QuestionUI
                    key={question.questionId}
                    position={index + 1}
                    question={question}
                    seperator="|"
                />
            ))}

            {!isShowAnswer && (
                <Button
                    className="self-end"
                    variant="outlined"
                    disabled={
                        quizAnswer.length === 0 ||
                        quizAnswer.some(
                            (a) => a.userSelectedAnswer === -1,
                        )
                    }
                    onClick={() => dispatch(setShowAnswer(true))}
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
                        onClick={() => dispatch(tryAnswerAgain())}
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
                    onClick={handleGoToNext}
                >
                    Tiếp tục
                </Button>
            )}
        </div>
    );
};

export default LearningQuiz;
