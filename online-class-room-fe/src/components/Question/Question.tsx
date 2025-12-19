import { Radio, Typography } from 'antd';
import { Question } from '../../types/Question.type';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const answerPrefix = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export interface QuestionProps {
    question: Question;
    seperator: string;
    position: number;
    isShowAnswer?: boolean;
    selectedAnswer?: number;
    onAnswer?: (questionId: number, answer: number) => void;
}

const QuestionUI = ({
    question,
    seperator,
    position,
    isShowAnswer,
    selectedAnswer,
    onAnswer,
}: QuestionProps) => {
    const { anwser, correctAnwser, questionTitle, questionId } = question;

    return (
        <div className="flex flex-col gap-8">
            <p className="text-base font-medium text-[#1677ff]">
                {`Câu ${position}: ${questionTitle}`}
            </p>

            <Radio.Group
                className="grid grid-cols-2 gap-8 px-4"
                value={selectedAnswer}
                onChange={(e) =>
                    onAnswer?.(questionId, e.target.value)
                }
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
                                correctAnwser === index && (
                                    <CheckCircleIcon className="text-[#52c41a]" />
                                )}

                            {isShowAnswer &&
                                selectedAnswer === index &&
                                correctAnwser !== index && (
                                    <CancelIcon className="text-[#ff4d4f]" />
                                )}
                        </label>
                    ))}
            </Radio.Group>
        </div>
    );
};

export default QuestionUI;
