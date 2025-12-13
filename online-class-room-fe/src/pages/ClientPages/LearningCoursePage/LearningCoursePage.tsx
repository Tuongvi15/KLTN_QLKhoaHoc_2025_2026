import { AccordionSection, Video } from '../../../components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGetCourseIDQuery } from '../../../services';
import { Skeleton, Typography, Progress } from 'antd';
import { Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    LessionType,
    gotToNextStep,
    setLastStepCompleted,
    setLearingCourse,
    setNextStepCompletedPos,
    setRegistrationData,
    setStepActiveByStepId,
} from '../../../slices/learningCourseSlice';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { RootState } from '../../../store';
import {
    useCheckRegistrationCourseQuery,
    useGetLastStepCompletedQuery,
    useUpdateLastStepCompletedMutation,
} from '../../../services/registrationCourse.services';
import LearningQuiz from './LearningQuiz';

const LearningCoursePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const courseId = location.pathname.split('/').pop();
    const accountId = useSelector((state: RootState) => state.user.id);

    const {
        stepActive,
        stepActiveType,
        isVideoWatched,
        lastPostionCompleted,
        registrationData,
    } = useSelector((state: RootState) => state.learningCourse);

    const registrationId = registrationData?.registrationId ?? -1;

    // =============================
    // API
    // =============================
    const { data, isLoading, isSuccess: isGetCourseSuccess } =
        useGetCourseIDQuery(courseId ?? '');

    const { isSuccess: isGetCheckSuccess, data: checkData } =
        useCheckRegistrationCourseQuery({
            accountId: accountId ?? '',
            courseId: courseId ? parseInt(courseId) : -1,
        });

    const { isSuccess: isGetLastStepCompletedSuccess, data: lastStepCompletedData } =
        useGetLastStepCompletedQuery(registrationId);

    const [updateLastStepCompleted, { isSuccess: isUpdateLastStepSuccess }] =
        useUpdateLastStepCompletedMutation();

    // =============================
    // Load registration
    // =============================
    useEffect(() => {
        if (!isGetCheckSuccess) return;

        if (!checkData?.registrationId) {
            navigate('/*');
            return;
        }

        dispatch(setRegistrationData(checkData));
    }, [isGetCheckSuccess]);

    // =============================
    // Load course
    // =============================
    useEffect(() => {
        if (isGetCourseSuccess && data) {
            dispatch(setLearingCourse(data));
        }
    }, [isGetCourseSuccess]);

    // =============================
    // Load last completed step
    // =============================
    useEffect(() => {
        if (
            !isGetCourseSuccess ||
            !data ||
            !isGetLastStepCompletedSuccess
        )
            return;

        const allSteps = data.sections.flatMap(s => s.steps);

        // chưa học lần nào
        if (!lastStepCompletedData?.stepId) {
            const firstStepId = allSteps[0].stepId;
            dispatch(setLastStepCompleted(firstStepId));
            dispatch(setStepActiveByStepId(firstStepId));
            return;
        }

        const lastStepId = lastStepCompletedData.stepId;
        dispatch(setLastStepCompleted(lastStepId));

        const lastIndex = allSteps.findIndex(s => s.stepId === lastStepId);

        if (lastIndex >= 0 && lastIndex < allSteps.length - 1) {
            dispatch(setStepActiveByStepId(allSteps[lastIndex + 1].stepId));
        } else {
            dispatch(setStepActiveByStepId(lastStepId));
        }
    }, [isGetCourseSuccess, isGetLastStepCompletedSuccess]);

    // =============================
    // After update step completed
    // =============================
    useEffect(() => {
        if (isUpdateLastStepSuccess) {
            dispatch(setNextStepCompletedPos());
            dispatch(gotToNextStep());
        }
    }, [isUpdateLastStepSuccess]);

    // =============================
    // Actions
    // =============================
    const handleGoToNext = () => {
        updateLastStepCompleted({
            registrationId,
            stepId: stepActive.stepId,
        });
    };

    // =============================
    // Progress (SOURCE OF TRUTH = API)
    // =============================
    const learningProgress = registrationData?.learningProgress ?? 0;

    const totalSteps =
        data?.sections?.reduce(
            (acc, section) => acc + section.steps.length,
            0
        ) ?? 0;

    const progressPercent = Math.round(learningProgress * 100);
    const completedSteps = Math.round(learningProgress * totalSteps);

    // =============================
    // RENDER
    // =============================
    return (
        <div className="bg-[#f0f0f0] min-h-screen">

            {/* ===== HEADER ===== */}
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <Button
                                startIcon={<ArrowBackIcon />}
                                variant="text"
                                onClick={() => navigate(`/courses/${courseId}`)}
                            >
                                Quay lại
                            </Button>

                            {data && (
                                <div className="flex items-center gap-2">
                                    <MenuBookIcon sx={{ fontSize: 20, color: '#666' }} />
                                    <span className="text-sm font-medium">
                                        {data.title}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-[#666]">
                                Tiến độ:{' '}
                                <strong className="text-[#f05123]">
                                    {progressPercent}%
                                </strong>
                            </div>

                            <Progress
                                percent={progressPercent}
                                strokeColor="#f05123"
                                showInfo={false}
                                style={{ width: 120 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== MAIN ===== */}
            <div className="flex h-[calc(100vh-70px)]">

                {/* LEFT */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                        {isLoading && (
                            <div className="aspect-video flex items-center justify-center">
                                <Skeleton active />
                            </div>
                        )}

                        {!isLoading && stepActiveType === LessionType.VIDEO && (
                            <div className="relative">
                                <Video src={stepActive.videoUrl} />
                                {isVideoWatched && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                                        Đã xem
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLoading && stepActiveType === LessionType.QUIZ && (
                            <div className="bg-white">
                                <LearningQuiz />
                            </div>
                        )}
                    </div>

                    {stepActiveType === LessionType.VIDEO && (
                        <div className="flex justify-between items-center bg-white rounded-xl shadow p-4">
                            <div className="text-sm text-[#666]">
                                {isVideoWatched
                                    ? 'Bạn đã hoàn thành bài học này'
                                    : 'Vui lòng xem hết video để tiếp tục'}
                            </div>

                            <Button
                                onClick={handleGoToNext}
                                variant="contained"
                                disabled={!isVideoWatched}
                                sx={{ bgcolor: '#f05123', px: 4 }}
                            >
                                Hoàn thành và tiếp tục →
                            </Button>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                {data && stepActive && (
                    <div className="hidden lg:block w-[380px] bg-white border-l overflow-y-auto shadow-lg">
                        <div className="sticky top-0 bg-white border-b px-5 py-4">
                            <Typography.Title level={5} className="!m-0">
                                Nội dung khóa học
                            </Typography.Title>
                            <Typography.Text className="text-xs text-[#666] mt-1 block">
                                {completedSteps} / {totalSteps} bài học
                            </Typography.Text>
                        </div>

                        <div className="px-3 py-4">
                            <AccordionSection
                                lastPosition={lastPostionCompleted + 1}
                                sections={data.sections}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningCoursePage;
