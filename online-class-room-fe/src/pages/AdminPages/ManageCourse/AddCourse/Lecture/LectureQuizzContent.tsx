import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { EditableText, MultipleQuestionInput } from '../../../../../components';
import {
    useAddQuizMutation,
    useGetQuizDetailQuery,
    useUpdateQuizMutation,
} from '../../../../../services/quiz.services';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteQuestion,
    updateQuizTile,
    upsertQuestion,
    upsertQuiz,
} from '../../../../../slices/quizSlice';
import { Step } from '../../../../../types/Course.type';
import { useUpdateStepMutation } from '../../../../../services/step.services';
import { setStep } from '../../../../../slices/courseSlice';
import { RootState } from '../../../../../store';
import { Button as MuiButton, TextField, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Question } from '../../../../../types/Question.type';
import { useDeleteQuestionMutation } from '../../../../../services/question.services';
import { Skeleton, message } from 'antd';

export interface LectureQuizzContentProps {
    step: Step;
}

const LectureQuizzContent = ({ step }: LectureQuizzContentProps) => {
    const { quizId, stepId } = step;
    const dispatch = useDispatch();

    // UI & State
    const [isInCreateMode, setIsInCreateMode] = useState(quizId === 1);
    const [titleTemp, setTitleTemp] = useState('');
    const [questionDelete, setQuestionDelete] = useState<number | null>(null);
    const isCreatingQuizRef = useRef(false);

    // RTK mutations
    const [addQuiz, { isLoading: isAddLoading, isSuccess: isAddSuccess, data: addQuizData }] =
        useAddQuizMutation();
    const [updateStep, { isLoading: isUpdateStepLoading }] = useUpdateStepMutation();
    const [updateQuiz, { isLoading: isUpdateQuizLoading, isSuccess: isUpdateQuizSuccess, data: updateQuizData }] =
        useUpdateQuizMutation();
    const [deleteQuestionMutation, { isSuccess: isDeleteQuestionSuccess }] =
        useDeleteQuestionMutation();

    const { data: getQuizData, isSuccess: isGetSuccess, isLoading: isGetLoading } =
        useGetQuizDetailQuery(quizId === 1 ? -1 : quizId, {
            skip: quizId === 1,
        });

    const quizState = useSelector((state: RootState) =>
        state.quiz.quizList.find((quiz) => quiz.quizId === quizId)
    );

    // Template for new question
    const initialQuestion = useMemo<Question>(
        () => ({
            answerHistories: [],
            anwser: '',
            correctAnwser: 0,
            questionId: -1,
            questionTitle: '',
            quiz: '',
            quizId,
        }),
        [quizId]
    );

    // 🔹 Auto-create quiz (nếu chưa có) khi user muốn thêm câu hỏi
    const ensureQuizExists = useCallback(async () => {
        if (quizId > 1) return quizId;

        if (isCreatingQuizRef.current) return null;
        isCreatingQuizRef.current = true;

        try {
            const created = await addQuiz({
                title: titleTemp.trim() || 'Quiz mới',
                description: 'Auto-created quiz',
            }).unwrap();

            dispatch(upsertQuiz(created));
            await updateStep({
                ...step,
                quizId: created.quizId,
            }).unwrap();

            dispatch(setStep({ ...step, quizId: created.quizId }));
            message.success('Đã tự động tạo quiz mới!');
            setIsInCreateMode(false);
            return created.quizId;
        } catch (err) {
            console.error('❌ Tạo quiz thất bại:', err);
            message.error('Không thể tạo quiz!');
            return null;
        } finally {
            isCreatingQuizRef.current = false;
        }
    }, [quizId, addQuiz, dispatch, step, titleTemp, updateStep]);

    // 🧠 Tạo quiz thủ công
    const handleCreateQuiz = useCallback(async () => {
        if (isCreatingQuizRef.current) return;
        isCreatingQuizRef.current = true;

        try {
            const created = await addQuiz({
                title: titleTemp.trim() || 'Quiz mới',
                description: 'string',
            }).unwrap();

            dispatch(upsertQuiz(created));
            await updateStep({
                ...step,
                quizId: created.quizId,
            }).unwrap();

            dispatch(setStep({ ...step, quizId: created.quizId }));
            message.success('Quiz đã được tạo!');
            setIsInCreateMode(false);
        } catch (err) {
            message.error('Không thể tạo quiz!');
        } finally {
            isCreatingQuizRef.current = false;
        }
    }, [titleTemp, step, addQuiz, updateStep, dispatch]);

    // 🧠 Validate câu hỏi trước khi lưu
    const validateQuestions = useCallback((quiz: any) => {
        const errors: string[] = [];

        quiz.questions.forEach((q: Question, idx: number) => {
            if (!q.questionTitle?.trim()) {
                errors.push(`❌ Câu ${idx + 1}: Nội dung câu hỏi không được để trống.`);
            }

            if (!q.anwser?.trim()) {
                errors.push(`❌ Câu ${idx + 1}: Danh sách đáp án không được để trống.`);
            }
        });

        if (errors.length) {
            message.error(errors.join('\n'));
            return false;
        }
        return true;
    }, []);

    // 🧠 Lưu quiz & validate
    const handleSaveQuiz = useCallback(() => {
        if (!quizState) return;

        let hasError = false;
        quizState.questions.forEach((q, idx) => {
            const answers = q.anwser.split('|').map(a => a.trim()).filter(a => a);
            if (!q.questionTitle.trim()) {
                message.warning(`❌ Câu ${idx + 1}: Câu hỏi không được để trống`);
                hasError = true;
            }
            if (answers.length < 2) {
                message.warning(`❌ Câu ${idx + 1}: Cần ít nhất 2 đáp án hợp lệ`);
                hasError = true;
            }
            
        });

        if (hasError) return;
        updateQuiz({ ...quizState });
        message.success('Lưu câu hỏi thành công!');
    }, [quizState, updateQuiz]);


    // 🧠 Thêm câu hỏi mới (tự tạo quiz nếu chưa có)
    const handleAddQuestion = useCallback(async () => {
        let qid = quizId;

        // ⚙️ Nếu quiz chưa có, tự tạo
        if (quizId === 1) {
            try {
                const created = await addQuiz({
                    title: titleTemp.trim() || 'Quiz tự động',
                    description: 'Auto-created quiz',
                }).unwrap();
                dispatch(upsertQuiz(created));
                await updateStep({ ...step, quizId: created.quizId }).unwrap();
                dispatch(setStep({ ...step, quizId: created.quizId }));
                message.success('Đã tự tạo quiz mới!');
                qid = created.quizId;
                setIsInCreateMode(false);
            } catch {
                message.error('Tạo quiz thất bại!');
                return;
            }
        }

        // ⚙️ Thêm câu hỏi trống
        const newQuestion: Question = {
            questionId: -1,
            questionTitle: '',
            anwser: '||', // 3 chỗ trống
            correctAnwser: 0,
            answerHistories: [],
            quiz: '',
            quizId: qid,
        };
        dispatch(upsertQuestion({ question: newQuestion, quizId: qid }));
    }, [dispatch, addQuiz, quizId, titleTemp, step, updateStep]);


    // 🧠 Xóa câu hỏi
    const handleDeleteQuestion = useCallback(
        (id: number) => {
            setQuestionDelete(id);
            deleteQuestionMutation(id);
        },
        [deleteQuestionMutation]
    );

    // 🧠 Sửa tiêu đề
    const handleTitleChange = useCallback(
        (value: string | number) => {
            if (typeof value !== 'string') return;
            if (isInCreateMode) setTitleTemp(value);
            else dispatch(updateQuizTile({ quizId, title: value }));
        },
        [isInCreateMode, dispatch, quizId]
    );

    // 🧩 Đồng bộ load quiz
    useEffect(() => {
        if (isGetSuccess && getQuizData) {
            dispatch(upsertQuiz(getQuizData));
        }
    }, [isGetSuccess, getQuizData, dispatch]);

    // 🧩 Sau khi update quiz
    useEffect(() => {
        if (isUpdateQuizSuccess && updateQuizData) {
            dispatch(upsertQuiz(updateQuizData));
        }
    }, [isUpdateQuizSuccess, updateQuizData, dispatch]);

    // 🧩 Sau khi xóa câu hỏi
    useEffect(() => {
        if (isDeleteQuestionSuccess && questionDelete) {
            dispatch(deleteQuestion({ quizId, questionId: questionDelete }));
            setQuestionDelete(null);
            message.success('Đã xóa câu hỏi!');
        }
    }, [isDeleteQuestionSuccess, questionDelete, dispatch, quizId]);

    return (
        <div className="flex flex-col gap-4">
            {/* 🧱 Tiêu đề quiz */}
            <div className="flex items-center gap-4">
                <p className="font-medium text-[#1976d2]">Tiêu đề:</p>
                <div className="flex-1">
                    {isInCreateMode ? (
                        <div className="flex items-center gap-2">
                            <TextField
                                fullWidth
                                size="small"
                                value={titleTemp}
                                onChange={(e) => setTitleTemp(e.target.value)}
                                placeholder="(Tùy chọn) Nhập tiêu đề quiz..."
                                disabled={isAddLoading || isCreatingQuizRef.current}
                                inputProps={{ maxLength: 76 }}
                                helperText={`${titleTemp.length}/76`}
                            />
                            {/* <MuiButton
                                variant="contained"
                                size="small"
                                disabled={isAddLoading}
                                onClick={handleCreateQuiz}
                                startIcon={
                                    isCreatingQuizRef.current ? <CircularProgress size={16} /> : <AddIcon />
                                }
                            >
                                {isCreatingQuizRef.current ? 'Đang tạo...' : 'Tạo quiz'}
                            </MuiButton> */}
                        </div>
                    ) : ""}
                </div>
            </div>

            {/* 🧩 Danh sách câu hỏi */}
            {!isGetLoading && quizState && !isInCreateMode && (
                <div className="flex flex-col gap-6 px-6">
                    {quizState.questions?.length ? (
                        quizState.questions.map((q) => (
                            <MultipleQuestionInput
                                key={q.questionId}
                                values={q}
                                position={quizState.questions.indexOf(q) + 1}
                                onDataChange={(question) =>
                                    dispatch(upsertQuestion({ quizId, question }))
                                }
                                onDoneClick={handleSaveQuiz}
                                onDeleteClick={() => handleDeleteQuestion(q.questionId)}
                                seperator="|"
                                maxInputItem={10}
                                isCreate={q.questionId === -1}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">
                            {/* Chưa có câu hỏi nào. Nhấn “Thêm câu hỏi” để bắt đầu. */}
                        </p>
                    )}
                    {/* <MuiButton
                        onClick={handleAddQuestion}
                        className="!w-fit"
                        variant="text"
                        size="small"
                        startIcon={<AddIcon />}
                    >
                        Thêm câu hỏi
                    </MuiButton> */}
                </div>
            )}

            {!isGetLoading && isInCreateMode && !isCreatingQuizRef.current && (
                <div className="text-gray-500 px-6 text-sm">
                    Bạn có thể tạo quiz trống hoặc thêm câu hỏi — hệ thống sẽ tự tạo quiz nếu cần.
                </div>
            )}

            {(isGetLoading || isCreatingQuizRef.current) && (
                <div className="px-6">
                    <Skeleton active />
                </div>
            )}
        </div>
    );
};

export default LectureQuizzContent;
