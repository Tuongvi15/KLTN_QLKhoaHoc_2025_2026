import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Popconfirm, message } from 'antd';
import { CircularProgress, IconButton } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LectureContentType, { LectureType } from './LectureContentType';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ArticleIcon from '@mui/icons-material/Article';
import CloseIcon from '@mui/icons-material/Close';
import {
    useAddStepMutation,
    useDeleteStepMutation,
    useUpdateStepMutation,
} from '../../../../../services/step.services';
import { useDispatch } from 'react-redux';
import {
    addCourseStep,
    deleteStepId,
    setStep,
    updateStepTitle,
} from '../../../../../slices/courseSlice';
import LectureVideoContent from './LectureVideoContent';
import LectureQuizzContent from './LectureQuizzContent';
import { Step } from '../../../../../types/Course.type';
import { Button as MuiButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { EditableItem, RenderRichText, RichTextEditor } from '../../../../../components';

interface LectureProps {
    position: number;
    isCreate: boolean;
    step?: Step | null;
}

export enum LectureState {
    DEFAULT,
    SELECT_CONTENT,
    SELECTED_CONTENT,
    COLLAPSE_CONTENT,
}

const LectureCreator = ({ position, isCreate, step = null }: LectureProps) => {
    const dispatch = useDispatch();
    const [isCreateFirst, setIsCreateFirst] = useState(isCreate);
    const [tempLable, setTempLable] = useState('');
    const [tempDescription, setTempDescription] = useState(step ? step.stepDescription : '');
    const [currentStep, setCurrentStep] = useState<Step | null>(step);
    const [isWaitingForStepCreation, setIsWaitingForStepCreation] = useState(false);
    const [pendingLectureType, setPendingLectureType] = useState<LectureType | null>(null);

    const [addStepMutation, { isSuccess, isLoading, data }] = useAddStepMutation();
    const [deleteStep, { isSuccess: isDeleteSuccess }] = useDeleteStepMutation();
    const [
        updateStepMutation,
        { isSuccess: isUpdateSucess, isLoading: isUpdateLoading, data: updateData },
    ] = useUpdateStepMutation();
    const [isEdit, setIsEdit] = useState(isCreate);
    const [isHovered, setIsHovered] = useState(false);
    const [lectureState, setLectureState] = useState(LectureState.DEFAULT);
    const [lectureSelectedType, setLectureSelectedType] = useState(LectureType.VIDEO);
    const [isAddDescription, setIsAddDescription] = useState(false);

    // 🔹 Cập nhật step khi props thay đổi
    useEffect(() => {
        if (step) {
            setCurrentStep(step);
        }
    }, [step]);

    // 🔹 Xóa step
    const handleOnRemoveClick = () => {
        deleteStep(currentStep ? currentStep.stepId : -1);
    };

    // 🔹 Tạo hoặc cập nhật step
    const handleOnClickDone = () => {
        if (isCreateFirst) {
            addStepMutation({
                duration: 0,
                position,
                quizId: 1,
                sectionId: step!.sectionId,
                stepDescription: '',
                title: tempLable,
                videoUrl: '',
            });
        } else {
            updateStepMutation({
                duration: currentStep!.duration,
                position,
                quizId: currentStep!.quizId,
                stepDescription: currentStep!.stepDescription,
                stepId: currentStep!.stepId,
                title: currentStep!.title,
                videoUrl: currentStep!.videoUrl,
            });
        }
    };

    // 🔹 Xác định loại nội dung hiển thị
    useEffect(() => {
        const hasVideo = !!currentStep?.videoUrl && currentStep.videoUrl.length > 10;
        const hasQuiz = !!currentStep?.quizId && currentStep.quizId !== 1;

        if (hasVideo && hasQuiz) {
            setLectureSelectedType(LectureType.COMBINED);
            setLectureState(LectureState.SELECTED_CONTENT);
        } else if (hasQuiz) {
            setLectureSelectedType(LectureType.QUIZZ);
            setLectureState(LectureState.SELECTED_CONTENT);
        } else if (hasVideo) {
            setLectureSelectedType(LectureType.VIDEO);
            setLectureState(LectureState.COLLAPSE_CONTENT);
        } else {
            setLectureState(LectureState.DEFAULT);
        }
    }, [currentStep]);

    // 🔹 Xóa step thành công
    useEffect(() => {
        if (isDeleteSuccess && currentStep) {
            dispatch(deleteStepId({ sectionId: currentStep.sectionId, stepId: currentStep.stepId }));
            message.success('Xóa bài học thành công!');
        }
    }, [isDeleteSuccess, currentStep, dispatch]);

    // 🔹 Đổi tiêu đề
    const handleOnTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCreateFirst) {
            setTempLable(e.target.value);
        } else if (currentStep?.stepId && currentStep.sectionId) {
            dispatch(
                updateStepTitle({
                    sectionId: currentStep.sectionId,
                    stepId: currentStep.stepId,
                    title: e.target.value,
                }),
            );
        }
    };

    // 🔹 Khi tạo step thành công
    useEffect(() => {
        if (isSuccess && data) {
            dispatch(addCourseStep(data));
            setCurrentStep(data);
            setIsCreateFirst(false);
            setIsEdit(false);
            setIsWaitingForStepCreation(false);

            if (pendingLectureType) {
                setLectureSelectedType(pendingLectureType);
                setLectureState(LectureState.SELECTED_CONTENT);
                setPendingLectureType(null);
            }
        }
    }, [isSuccess, data, dispatch, pendingLectureType]);

    // 🔹 Khi update thành công
    useEffect(() => {
        if (isUpdateSucess && updateData) {
            dispatch(setStep(updateData));
            setCurrentStep(updateData);
            setIsEdit(false);
        }
    }, [isUpdateSucess, updateData, dispatch]);

    // 🔹 Chọn loại nội dung
    const handleOnSelectLectureType = async (selectedType: LectureType) => {
        if (isCreateFirst && !currentStep?.stepId) {
            if (!tempLable || tempLable.trim().length < 6) {
                message.warning('Nhập tiêu đề bài học trước khi chọn nội dung!');
                return;
            }

            try {
                const data = await addStepMutation({
                    duration: 0,
                    position,
                    quizId: 1,
                    sectionId: step!.sectionId,
                    stepDescription: '',
                    title: tempLable,
                    videoUrl: '',
                }).unwrap();

                dispatch(addCourseStep(data));
                setCurrentStep(data);
                setIsCreateFirst(false);
            } catch {
                message.error('Tạo bài học thất bại!');
                return;
            }
        }

        setLectureSelectedType(selectedType);
        setLectureState(LectureState.SELECTED_CONTENT);
    };

    // 🔹 Lưu miêu tả
    const handleOnSaveDescription = () => {
        updateStepMutation({
            duration: currentStep!.duration,
            position,
            quizId: currentStep!.quizId,
            stepDescription: tempDescription!,
            stepId: currentStep!.stepId,
            title: currentStep!.title,
            videoUrl: currentStep!.videoUrl,
        });
        message.success('Cập nhật miêu tả thành công!');
    };

    // 🔹 Đóng khung nội dung
    const handleOnCloseLecture = () => {
        const hasVideo = !!currentStep?.videoUrl && currentStep.videoUrl.length > 10;
        const hasQuiz = !!currentStep?.quizId && currentStep.quizId !== 1;

        if (lectureState === LectureState.SELECT_CONTENT) {
            setLectureState(LectureState.DEFAULT);
        } else if (lectureState === LectureState.SELECTED_CONTENT) {
            if (hasVideo && hasQuiz) {
                setLectureSelectedType(LectureType.COMBINED);
                setLectureState(LectureState.COLLAPSE_CONTENT);
            } else if (hasQuiz) {
                setLectureSelectedType(LectureType.QUIZZ);
                setLectureState(LectureState.COLLAPSE_CONTENT);
            } else if (hasVideo) {
                setLectureSelectedType(LectureType.VIDEO);
                setLectureState(LectureState.COLLAPSE_CONTENT);
            } else {
                setLectureState(LectureState.DEFAULT);
            }
        }
    };

    return (
        <div className="border border-gray-300 bg-white">
            {/* Header */}
            <div
                className="flex items-center justify-between gap-4 px-4 py-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center gap-4">
                    <p className="text-base font-medium">Bài {position}:</p>

                    {isEdit ? (
                        <div className="flex items-center gap-4 font-medium">
                            <Input
                                minLength={6}
                                onChange={handleOnTitleChange}
                                value={isCreateFirst ? tempLable : currentStep?.title}
                                maxLength={200}
                                showCount
                                placeholder="Nhập tiêu đề bài học..."
                            />
                            <IconButton disabled={isLoading || isUpdateLoading} onClick={handleOnClickDone}>
                                {!isLoading && !isUpdateLoading && <DoneIcon />}
                                {(isLoading || isUpdateLoading) && (
                                    <CircularProgress className="!h-[18px] !w-[18px]" />
                                )}
                            </IconButton>
                        </div>
                    ) : (
                        <span>{' ' + currentStep?.title}</span>
                    )}

                    {!isEdit && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-x-4"
                        >
                            {/* <IconButton disabled={!isHovered} onClick={() => setIsEdit(true)} color="info" size="small">
                                <CreateIcon className="!text-xl" />
                            </IconButton> */}
                            {/* <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa bài học này?"
                                onConfirm={handleOnRemoveClick}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ style: { background: '#d32f2f' } }}
                            >
                                <IconButton disabled={!isHovered} color="error" size="small">
                                    <DeleteIcon className="!text-xl" />
                                </IconButton>
                            </Popconfirm> */}
                        </motion.div>
                    )}
                </div>

                <div>
                    {/* {lectureState === LectureState.DEFAULT && (
                        <Button
                            icon={<AddIcon />}
                            onClick={() => {
                                if (!currentStep?.stepId || currentStep.stepId <= 0) {
                                    message.warning('⚠️ Hãy tạo bài học trước khi thêm nội dung!');
                                    return;
                                }
                                setLectureState(LectureState.SELECT_CONTENT);
                            }}
                            loading={isWaitingForStepCreation}
                            disabled={!currentStep?.stepId || currentStep.stepId <= 0}
                        >
                            Thêm nội dung
                        </Button>
                    )} */}

                    {lectureState === LectureState.COLLAPSE_CONTENT && (
                        <MuiButton
                            variant="outlined"
                            startIcon={<CheckCircleIcon />}
                            className="!border-[#333] !text-[#333]"
                            onClick={() => setLectureState(LectureState.SELECTED_CONTENT)}
                        >
                            {lectureSelectedType === LectureType.VIDEO
                                ? 'Video'
                                : lectureSelectedType === LectureType.QUIZZ
                                    ? 'Quiz'
                                    : 'Video + Quiz'}
                        </MuiButton>
                    )}
                </div>
            </div>

            {/* Nội dung */}
            {lectureState !== LectureState.DEFAULT && lectureState !== LectureState.COLLAPSE_CONTENT && (
                <div className="relative border-t border-gray-300 bg-white p-4 overflow-hidden">
                    {/* Header bar */}
                    <div className="absolute right-4 top-0 flex h-8 items-center justify-end gap-2 border-x border-t border-gray-300 bg-white px-2">
                        {LectureState.SELECT_CONTENT === lectureState && (
                            <p className="text-sm">Lựa chọn loại nội dung</p>
                        )}
                        <IconButton size="small" onClick={handleOnCloseLecture}>
                            <CloseIcon className="!text-base" />
                        </IconButton>
                    </div>

                    {/* Chọn loại nội dung */}
                    {LectureState.SELECT_CONTENT === lectureState && (
                        <div className="mt-4">
                            <p className="text-center mb-4">Chọn loại nội dung chính trong bài học này:</p>
                            <div className="flex items-center justify-center gap-8">
                                <LectureContentType
                                    onSelect={handleOnSelectLectureType}
                                    icon={<PlayCircleIcon />}
                                    lectureType={LectureType.VIDEO}
                                    lable="Video"
                                />
                                <LectureContentType
                                    onSelect={handleOnSelectLectureType}
                                    icon={<ArticleIcon />}
                                    lectureType={LectureType.QUIZZ}
                                    lable="Quiz"
                                />
                                {/* <LectureContentType
                                    onSelect={handleOnSelectLectureType}
                                    icon={
                                        <>
                                            <PlayCircleIcon />
                                            <span className="mx-1">+</span>
                                            <ArticleIcon />
                                        </>
                                    }
                                    lectureType={LectureType.COMBINED}
                                    lable="Video + Quiz"
                                /> */}
                            </div>
                        </div>
                    )}

                    {/* Render nội dung */}
                    {lectureState === LectureState.SELECTED_CONTENT && currentStep && (
                        <div className="mt-4 flex flex-col gap-6">
                            {lectureSelectedType === LectureType.VIDEO && (
                                <LectureVideoContent step={currentStep} />
                            )}
                            {lectureSelectedType === LectureType.QUIZZ && (
                                <div className="border border-gray-300 rounded-lg p-4 bg-white overflow-hidden">
                                    <LectureQuizzContent step={currentStep} />
                                </div>
                            )}
                            {lectureSelectedType === LectureType.COMBINED && (
                                <div className="flex flex-col gap-6 border border-gray-300 rounded-lg p-4 bg-white">
                                    <LectureVideoContent step={currentStep} />
                                    <hr className="my-4 border-gray-300" />
                                    <LectureQuizzContent step={currentStep} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Miêu tả */}
                    {LectureState.SELECTED_CONTENT === lectureState && (
                        <div className="mt-4 flex flex-col gap-4">
                            {/* {!isAddDescription && (
                                <MuiButton
                                    startIcon={<AddIcon />}
                                    variant="outlined"
                                    className="!border-[#333] !text-[#333]"
                                    onClick={() => setIsAddDescription(true)}
                                >
                                    Thêm miêu tả
                                </MuiButton>
                            )} */}

                            {/* {isAddDescription && currentStep && (
                                <EditableItem
                                    displayElement={
                                        <div className="flex items-center gap-4">
                                            <p className="font-medium text-[#1976d2]">Miêu tả:</p>
                                            <RenderRichText jsonData={currentStep.stepDescription} />
                                        </div>
                                    }
                                    editElement={
                                        <div className="w-full">
                                            <RichTextEditor
                                                initialValue={
                                                    currentStep.stepDescription === 'string'
                                                        ? ''
                                                        : tempDescription
                                                }
                                                onChange={(value) => setTempDescription(value)}
                                            />
                                        </div>
                                    }
                                    onDoneClick={handleOnSaveDescription}
                                    showEditFirst={currentStep.stepDescription.length < 10}
                                />
                            )} */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LectureCreator;
