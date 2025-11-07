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
    
    useEffect(() => {
        if (step) {
            setCurrentStep(step);
        }
    }, [step]);

    const handleOnRemoveClick = () => {
        deleteStep(currentStep ? currentStep.stepId : -1);
    };
    
    const handleOnClickDone = () => {
        if (isCreateFirst) {
            addStepMutation({
                duration: 0,
                position: position,
                quizId: 1,
                sectionId: step!.sectionId,
                stepDescription: 'string',
                title: tempLable,
                videoUrl: 'string',
            });
        } else {
            updateStepMutation({
                duration: currentStep!.duration,
                position: position,
                quizId: currentStep!.quizId,
                stepDescription: currentStep!.stepDescription,
                stepId: currentStep!.stepId,
                title: currentStep!.title,
                videoUrl: currentStep!.videoUrl,
            });
        }
    };

    useEffect(() => {
        if (currentStep?.quizId && currentStep?.videoUrl) {
            if (currentStep.quizId != 1) {
                setLectureSelectedType(LectureType.QUIZZ);
                setLectureState(LectureState.COLLAPSE_CONTENT);
            } else if (currentStep.videoUrl.length > 10) {
                setLectureSelectedType(LectureType.VIDEO);
                setLectureState(LectureState.COLLAPSE_CONTENT);
            } else {
                setLectureState(LectureState.DEFAULT);
            }
        }
    }, [currentStep]);

    useEffect(() => {
        if (isDeleteSuccess) {
            if (currentStep) {
                dispatch(deleteStepId({ sectionId: currentStep.sectionId, stepId: currentStep.stepId }));
                message.success('Xóa thành công!');
            }
        }
    }, [isDeleteSuccess, currentStep, dispatch]);

    const handleOnTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCreateFirst) {
            setTempLable(e.target.value);
        } else {
            if (currentStep?.stepId && currentStep.sectionId) {
                dispatch(
                    updateStepTitle({
                        sectionId: currentStep.sectionId,
                        stepId: currentStep.stepId,
                        title: e.target.value,
                    }),
                );
            }
        }
    };

    useEffect(() => {
        if (isSuccess && data) {
            console.log('✅ Step created successfully:', data);
            dispatch(addCourseStep(data));
            setCurrentStep(data);
            setIsCreateFirst(false);
            setIsEdit(false);
            setIsWaitingForStepCreation(false);
            
            // 🔥 Nếu đang chờ mở content type, mở ngay sau khi step được tạo
            if (pendingLectureType) {
                setLectureSelectedType(pendingLectureType);
                setLectureState(LectureState.SELECTED_CONTENT);
                setPendingLectureType(null);
            }
        }
    }, [isSuccess, data, dispatch, pendingLectureType]);

    useEffect(() => {
        if (isUpdateSucess && updateData) {
            console.log('✅ Step updated successfully:', updateData);
            dispatch(setStep(updateData));
            setCurrentStep(updateData);
            setIsEdit(false);
        }
    }, [isUpdateSucess, updateData, dispatch]);

    const handleOnSelectLectureType = (selectedType: LectureType) => {
        // 🔥 HƯỚNG 1: Tự động tạo step khi chọn content type
        if (isCreateFirst && currentStep?.stepId === -1) {
            console.log('📝 Auto-creating step before selecting content type...');
            
            // Kiểm tra title
            if (!tempLable || tempLable.trim().length < 6) {
                message.warning('Vui lòng nhập tiêu đề bài học (tối thiểu 6 ký tự) trước khi thêm nội dung!');
                return;
            }
            
            setIsWaitingForStepCreation(true);
            setPendingLectureType(selectedType);
            
            // Tạo step ngay lập tức
            addStepMutation({
                duration: 0,
                position: position,
                quizId: 1,
                sectionId: step!.sectionId,
                stepDescription: 'string',
                title: tempLable,
                videoUrl: 'string',
            });
        } else {
            // Step đã tồn tại, mở content ngay
            setLectureSelectedType(selectedType);
            setLectureState(LectureState.SELECTED_CONTENT);
        }
    };

    const handleOnSaveDescription = () => {
        updateStepMutation({
            duration: currentStep!.duration,
            position: position,
            quizId: currentStep!.quizId,
            stepDescription: tempDescription!,
            stepId: currentStep!.stepId,
            title: currentStep!.title,
            videoUrl: currentStep!.videoUrl,
        });
        message.success('Cập nhật thành công!');
    };

    const handleOnCloseLecture = () => {
        switch (lectureState) {
            case LectureState.SELECT_CONTENT: {
                setLectureState(LectureState.DEFAULT);
                break;
            }
            case LectureState.SELECTED_CONTENT: {
                if (currentStep?.quizId != 1) {
                    setLectureSelectedType(LectureType.QUIZZ);
                    setLectureState(LectureState.COLLAPSE_CONTENT);
                } else if (currentStep?.videoUrl && currentStep.videoUrl.length > 10) {
                    setLectureSelectedType(LectureType.VIDEO);
                    setLectureState(LectureState.COLLAPSE_CONTENT);
                } else {
                    setLectureState(LectureState.DEFAULT);
                }
                break;
            }
        }
    };

    return (
        <div>
            <div className="border-[1px] border-[#c3c4c4] bg-[#ffffff]">
                <div
                    className="flex items-center justify-between gap-4  px-4 py-2"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="flex items-center gap-4">
                        <p className="text-base font-medium">Bài {position}: </p>
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
                                <IconButton
                                    disabled={isLoading || isUpdateLoading}
                                    onClick={handleOnClickDone}
                                >
                                    {!isLoading && !isUpdateLoading && <DoneIcon />}
                                    {(isLoading || isUpdateLoading) && (
                                        <CircularProgress className="!h-[18px] !w-[18px]" />
                                    )}
                                </IconButton>
                            </div>
                        ) : (
                            <span className="">{' ' + currentStep?.title}</span>
                        )}
                        {!isEdit && (
                            <div>
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: isHovered ? 0.5 : 1,
                                    }}
                                    animate={{
                                        opacity: isHovered ? 1 : 0,
                                        scale: isHovered ? 1 : 0.5,
                                    }}
                                    transition={{ duration: 0.3, type: 'spring' }}
                                    className="space-x-4"
                                >
                                    <IconButton
                                        disabled={!isHovered}
                                        onClick={() => setIsEdit(true)}
                                        color="info"
                                        size="small"
                                    >
                                        <CreateIcon className="!text-xl" />
                                    </IconButton>
                                    <Popconfirm
                                        title="Xác nhận xóa"
                                        description="Bạn có chắc là muốn xóa ? toàn bộ nội dung trong bài này sẽ bị mất!"
                                        onConfirm={() => {
                                            handleOnRemoveClick();
                                        }}
                                        onCancel={() => {}}
                                        okText="Yes"
                                        cancelText="No"
                                        okButtonProps={{ style: { background: '#d32f2f' } }}
                                    >
                                        <IconButton
                                            disabled={!isHovered}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon className="!text-xl" />
                                        </IconButton>
                                    </Popconfirm>
                                </motion.div>
                            </div>
                        )}
                    </div>
                    <div>
                        {lectureState === LectureState.DEFAULT && (
                            <Button
                                icon={<AddIcon />}
                                onClick={() => setLectureState(LectureState.SELECT_CONTENT)}
                                loading={isWaitingForStepCreation}
                            >
                                Thêm nội dung
                            </Button>
                        )}
                        {lectureState === LectureState.COLLAPSE_CONTENT && (
                            <MuiButton
                                variant="outlined"
                                startIcon={<CheckCircleIcon />}
                                className="!border-[#333] !text-[#333]"
                                onClick={() => setLectureState(LectureState.SELECTED_CONTENT)}
                            >
                                {lectureSelectedType === LectureType.VIDEO ? 'Video' : 'Quizz'}
                            </MuiButton>
                        )}
                    </div>
                </div>
                <div>
                    {lectureState != LectureState.DEFAULT &&
                        lectureState != LectureState.COLLAPSE_CONTENT && (
                            <div className="relative border-t-[1px] border-[#c3c4c4] bg-[#ffffff] px-4 py-4">
                                <div className="absolute right-4 top-0 flex h-8 w-fit translate-y-[-100%] items-center justify-end  gap-2 border-x-[1px] border-t-[1px] border-[#c3c4c4] bg-white px-2">
                                    {LectureState.SELECT_CONTENT === lectureState && (
                                        <p className="text-sm">Lựa chọn loại nội dung</p>
                                    )}
                                    {LectureState.SELECTED_CONTENT === lectureState &&
                                        LectureType.QUIZZ === lectureSelectedType && (
                                            <p className="text-sm">Quizz</p>
                                        )}
                                    {LectureState.SELECTED_CONTENT === lectureState &&
                                        LectureType.VIDEO === lectureSelectedType && (
                                            <p className="text-sm">Video</p>
                                        )}
                                    <IconButton size="small" onClick={handleOnCloseLecture}>
                                        <CloseIcon className="!text-base" />
                                    </IconButton>
                                </div>
                                {LectureState.SELECT_CONTENT === lectureState && (
                                    <div>
                                        <p className="text-center">
                                            Lựa chọn loại nội dung chính trong bài học này:
                                        </p>
                                        {isWaitingForStepCreation && (
                                            <div className="text-center mt-4">
                                                <CircularProgress size={24} />
                                                <p className="text-sm text-gray-500 mt-2">Đang tạo bài học...</p>
                                            </div>
                                        )}
                                        {!isWaitingForStepCreation && (
                                            <div className="mt-2 flex items-center justify-center gap-8">
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
                                            </div>
                                        )}
                                    </div>
                                )}
                                {LectureState.SELECTED_CONTENT === lectureState &&
                                    lectureSelectedType === LectureType.VIDEO &&
                                    currentStep && currentStep.stepId > 0 && (
                                        <LectureVideoContent step={currentStep} />
                                    )}
                                {LectureState.SELECTED_CONTENT === lectureState &&
                                    lectureSelectedType === LectureType.QUIZZ &&
                                    currentStep && currentStep.stepId > 0 && (
                                        <LectureQuizzContent step={currentStep} />
                                    )}
                                {!isAddDescription &&
                                    LectureState.SELECTED_CONTENT === lectureState && (
                                        <div className="mt-4 flex flex-col gap-4">
                                            <MuiButton
                                                startIcon={<AddIcon />}
                                                variant="outlined"
                                                className="!border-[#333] !text-[#333]"
                                                onClick={() => setIsAddDescription(true)}
                                            >
                                                Thêm miêu tả
                                            </MuiButton>
                                        </div>
                                    )}
                                {isAddDescription && currentStep && (
                                    <div className="mt-4">
                                        <EditableItem
                                            displayElement={
                                                <div className="flex items-center gap-4">
                                                    <p className="w-fit font-medium text-[#1976d2]">
                                                        Miêu tả:
                                                    </p>
                                                    <RenderRichText
                                                        jsonData={currentStep.stepDescription}
                                                    />
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
                                                        onChange={(value) => {
                                                            setTempDescription(value);
                                                        }}
                                                    />
                                                </div>
                                            }
                                            onDoneClick={handleOnSaveDescription}
                                            showEditFirst={currentStep.stepDescription.length < 10}
                                        ></EditableItem>
                                    </div>
                                )}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default LectureCreator;