import { Radio, Typography } from 'antd';
import { Question } from '../../types/Question.type';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setQuestionAnswer } from '../../slices/learningCourseSlice';

const answerPrefix = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export interface QuestionProps {
    question: Question;
    seperator: string;
    position: number;
}

const QuestionUI = ({ question, seperator, position }: QuestionProps) => {
    const { anwser, correctAnwser, questionTitle, questionId } = question;

    const dispatch = useDispatch();
    const isShowAnswer = useSelector(
        (state: RootState) => state.learningCourse.isShowAnswer,
    );

    const questionData = useSelector((state: RootState) =>
        state.learningCourse.quizAnswer.find(
            (q) => q.questionId === questionId,
        ),
    );

    return (
        <div className="flex flex-col gap-8">
            <p className="text-base font-medium text-[#1677ff]">
                {`Câu ${position}: ${questionTitle}`}
            </p>

            <Radio.Group
                className="grid grid-cols-2 gap-8 px-4"
                value={questionData?.userSelectedAnswer}
                onChange={(e) => {
                    dispatch(
                        setQuestionAnswer({
                            questionId,
                            correctAnswer: correctAnwser,
                            userSelectedAnswer: e.target.value,
                        }),
                    );
                }}
            >
                {anwser
                    .split(seperator)
                    .filter((a) => a.length > 0)
                    .map((answer, index) => (
                        <label
                            key={index}
                            className="flex cursor-pointer items-center bg-[#f7f9fa] py-4 pl-4 pr-2"
                        >
                            <div className="flex flex-1 items-center justify-between gap-2 pr-2">
                                <div className="flex items-start gap-2">
                                    <Typography.Title level={5}>
                                        {answerPrefix[index] + '.'}
                                    </Typography.Title>
                                    <Typography.Text>
                                        {answer}
                                    </Typography.Text>
                                </div>
                                <Radio value={index} />
                            </div>

                            {isShowAnswer &&
                                questionData?.correctAnswer === index && (
                                    <CheckCircleIcon className="text-[#52c41a]" />
                                )}

                            {isShowAnswer &&
                                questionData?.userSelectedAnswer === index &&
                                questionData?.correctAnswer !== index && (
                                    <CancelIcon className="text-[#ff4d4f]" />
                                )}
                        </label>
                    ))}
            </Radio.Group>
        </div>
    );
};

export default QuestionUI;
