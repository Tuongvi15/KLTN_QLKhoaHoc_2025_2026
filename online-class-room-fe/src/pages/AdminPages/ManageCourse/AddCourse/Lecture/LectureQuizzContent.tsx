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
import { Skeleton } from 'antd';

export interface LectureQuizzContentProps {
    step: Step;
}

const LectureQuizzContent = ({ step }: LectureQuizzContentProps) => {
    const { quizId, stepId } = step;
    const dispatch = useDispatch();
    
    // 🔥 FIX: Dùng state key để force re-render khi cần
    const [componentKey, setComponentKey] = useState(0);
    const [isInCreateMode, setIsInCreateMode] = useState(quizId === 1);
    const [questionDelete, setQuestionDelete] = useState(0);
    const [titleTemp, setTitleTemp] = useState('');
    const isCreatingQuizRef = useRef(false);

    const initialQuestionData = useMemo<Question>(() => ({
        answerHistories: [],
        anwser: '',
        correctAnwser: 0,
        questionId: -1,
        questionTitle: '',
        quiz: '',
        quizId: quizId,
    }), [quizId]);

    const quizState = useSelector((state: RootState) => {
        if (quizId === 1) {
            return undefined;
        }
        return state.quiz.quizList.find((quiz) => quiz.quizId === quizId);
    });

    const {
        isSuccess: isGetQuizSuccess,
        data: getQuizData,
        isLoading: isGetQuizLoading,
    } = useGetQuizDetailQuery(quizId === 1 ? -1 : quizId, {
        skip: quizId === 1,
    });

    const [updateStepMutation, { isSuccess: isUpdateSuccess, isLoading: isUpdateLoading, data: updateData }] =
        useUpdateStepMutation();
    const [addQuizzMutation, { isSuccess: isAddQuizzSuccess, data: addQuizzData, isLoading: isAddQuizzLoading }] =
        useAddQuizMutation();
    const [updateQuizMutation, { isSuccess: isUpdateQuizSuccess, data: updateQuizData }] =
        useUpdateQuizMutation();
    const [deleteQuestionMutation, { isSuccess: isDeleteQuestionSuccess }] =
        useDeleteQuestionMutation();

    const handleCreateQuiz = useCallback(() => {
        if (titleTemp.trim() && !isCreatingQuizRef.current) {
            isCreatingQuizRef.current = true;
            addQuizzMutation({
                title: titleTemp,
                description: 'string',
            });
        }
    }, [titleTemp, addQuizzMutation]);

    const handleOnClickDone = useCallback(() => {
        if (quizState) {
            updateQuizMutation({
                ...quizState,
            });
        }
    }, [quizState, updateQuizMutation]);

    const handleOnAddQuestion = useCallback(() => {
        dispatch(upsertQuestion({ question: initialQuestionData, quizId: quizId }));
    }, [dispatch, initialQuestionData, quizId]);

    const handleOnDeleteQuestion = useCallback((questionId: number) => {
        setQuestionDelete(questionId);
        deleteQuestionMutation(questionId);
    }, [deleteQuestionMutation]);

    const handleUpdateQuestions = useCallback(() => {
        if (quizState) {
            updateQuizMutation({
                description: '',
                quizId: quizId,
                questions: quizState.questions,
                title: quizState.title,
            });
        }
    }, [quizState, quizId, updateQuizMutation]);

    const handleTitleChange = useCallback((value: string | number) => {
        if (typeof value === 'string') {
            if (isInCreateMode) {
                setTitleTemp(value);
            } else {
                dispatch(updateQuizTile({ quizId: quizId, title: value }));
            }
        }
    }, [isInCreateMode, dispatch, quizId]);

    useEffect(() => {
        if (!quizState && quizId > 1 && !isGetQuizLoading) {
            console.log('🔧 Creating temporary quiz in state for quizId:', quizId);
            dispatch(upsertQuiz({
                quizId: quizId,
                title: '',
                description: '',
                questions: [],
                steps: [],
            }));
        }
    }, [quizState, quizId, isGetQuizLoading, dispatch]);

    useEffect(() => {
        if (isUpdateQuizSuccess && updateQuizData) {
            dispatch(upsertQuiz(updateQuizData));
        }
    }, [isUpdateQuizSuccess, updateQuizData, dispatch]);

    useEffect(() => {
        if (isGetQuizSuccess && getQuizData) {
            console.log('📥 Loaded quiz from API:', getQuizData);
            dispatch(upsertQuiz(getQuizData));
        }
    }, [isGetQuizSuccess, getQuizData, dispatch]);

    // 🔥 FIX: Xử lý toàn bộ flow tạo quiz trong 1 effect
    useEffect(() => {
        if (isAddQuizzSuccess && addQuizzData && isCreatingQuizRef.current) {
            console.log('✅ Quiz created successfully:', addQuizzData);
            dispatch(upsertQuiz(addQuizzData));
            
            // Update step với quizId mới
            if (step.stepId > 0) {
                console.log('🔄 Updating step with new quizId:', addQuizzData.quizId);
                updateStepMutation({
                    duration: step.duration,
                    position: step.position,
                    quizId: addQuizzData.quizId,
                    stepDescription: step.stepDescription,
                    stepId: step.stepId,
                    title: step.title,
                    videoUrl: step.videoUrl,
                }).unwrap().then(() => {
                    // ✅ Sau khi update step thành công, thoát create mode
                    console.log('✅ Step updated, exiting create mode');
                    setIsInCreateMode(false);
                    isCreatingQuizRef.current = false;
                }).catch((error) => {
                    console.error('❌ Failed to update step:', error);
                    isCreatingQuizRef.current = false;
                });
            } else {
                // Nếu không có stepId, thoát create mode ngay
                setIsInCreateMode(false);
                isCreatingQuizRef.current = false;
            }
        }
    }, [isAddQuizzSuccess, addQuizzData, dispatch, updateStepMutation, step]);

    useEffect(() => {
        if (isUpdateSuccess && updateData) {
            dispatch(setStep(updateData));
        }
    }, [isUpdateSuccess, updateData, dispatch]);

    useEffect(() => {
        if (isDeleteQuestionSuccess && questionDelete) {
            dispatch(deleteQuestion({ quizId: quizId, questionId: questionDelete }));
        }
    }, [isDeleteQuestionSuccess, questionDelete, dispatch, quizId]);

    console.log('🔍 LectureQuizzContent Debug:', { 
        stepId: step.stepId,
        quizId, 
        isInCreateMode,
        isCreatingQuiz: isCreatingQuizRef.current,
        hasQuizState: !!quizState,
        questionsCount: quizState?.questions?.length || 0,
        titleTemp,
        componentKey
    });

    return (
        <div className="flex flex-col gap-4" key={componentKey}>
            <div className="flex items-center gap-4">
                <p className="w-fit font-medium text-[#1976d2]">Tiêu đề:</p>
                <div className="flex-1">
                    {isInCreateMode ? (
                        <div className="flex items-center gap-2">
                            <TextField
                                fullWidth
                                size="small"
                                value={titleTemp}
                                onChange={(e) => setTitleTemp(e.target.value)}
                                placeholder="Nhập tiêu đề quiz..."
                                disabled={isAddQuizzLoading || isCreatingQuizRef.current}
                                inputProps={{ maxLength: 76 }}
                                helperText={`${titleTemp.length}/76`}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && titleTemp.trim() && !isCreatingQuizRef.current) {
                                        handleCreateQuiz();
                                    }
                                }}
                            />
                            <MuiButton
                                variant="contained"
                                onClick={handleCreateQuiz}
                                disabled={!titleTemp.trim() || isAddQuizzLoading || isCreatingQuizRef.current}
                                size="small"
                                startIcon={isCreatingQuizRef.current ? <CircularProgress size={16} /> : null}
                            >
                                {isCreatingQuizRef.current ? 'Đang lưu...' : 'Lưu'}
                            </MuiButton>
                        </div>
                    ) : (
                        <EditableText
                            isLoading={isUpdateLoading}
                            maxLength={76}
                            showCount
                            textCSS="font-medium text-base"
                            edit={false}
                            value={quizState?.title || ''}
                            onDoneClick={handleOnClickDone}
                            onChage={handleTitleChange}
                        />
                    )}
                </div>
            </div>

            {!isGetQuizLoading && quizState && !isInCreateMode && (
                <div className="flex flex-col gap-6 px-6">
                    {(quizState.questions && quizState.questions.length > 0) ? (
                        quizState.questions.map((question) => (
                            <MultipleQuestionInput
                                maxInputItem={10}
                                onDataChange={(q) => {
                                    dispatch(upsertQuestion({ quizId: quizId, question: q }));
                                }}
                                seperator="|"
                                values={question}
                                key={question.questionId}
                                position={quizState.questions.indexOf(question) + 1}
                                onDoneClick={handleUpdateQuestions}
                                onDeleteClick={() => handleOnDeleteQuestion(question.questionId)}
                                isCreate={question.questionId === -1}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
                    )}

                    <MuiButton
                        onClick={handleOnAddQuestion}
                        className="!w-fit justify-start"
                        variant="text"
                        size="small"
                        style={{ fontSize: '12px' }}
                        startIcon={<AddIcon />}
                    >
                        Thêm câu hỏi
                    </MuiButton>
                </div>
            )}

            {!isGetQuizLoading && isInCreateMode && !isCreatingQuizRef.current && (
                <div className="text-gray-500 px-6 text-sm">
                    📝 Nhập tiêu đề quiz và nhấn "Lưu" (hoặc Enter) để bắt đầu tạo câu hỏi.
                </div>
            )}

            {(isGetQuizLoading || isCreatingQuizRef.current) && (
                <div className="px-6">
                    <Skeleton active />
                </div>
            )}
        </div>
    );
};

export default LectureQuizzContent;