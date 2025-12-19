import { AccordionSection, Video } from '../../../components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useGetCourseIDQuery } from '../../../services';
import { Skeleton, Typography, Progress } from 'antd';
import { Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    LessionType,
    setLearingCourse,
    setRegistrationData,
    setStepActiveByStepId,
} from '../../../slices/learningCourseSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { RootState } from '../../../store';
import {
    useCheckRegistrationCourseQuery,
    useGetLearningStateQuery,
} from '../../../services/registrationCourse.services';
import LearningQuiz from './LearningQuiz';
import { useLazyGetCertificateByAccountAndCourseQuery } from '../../../services/account.services';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const LearningCoursePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const hasFetchedCertificate = useRef(false);

    const courseId = location.pathname.split('/').pop();
    const accountId = useSelector((state: RootState) => state.user.id);
    const [getCertificate] = useLazyGetCertificateByAccountAndCourseQuery();

    const {
        stepActive,
        stepActiveType,
        isVideoWatched,
        registrationData,
    } = useSelector((state: RootState) => state.learningCourse);

    // =============================
    // API
    // =============================
    const { data: course, isLoading } =
        useGetCourseIDQuery(courseId ?? '');

    const { data: checkData, isSuccess: isCheckOk } =
        useCheckRegistrationCourseQuery({
            accountId: accountId ?? '',
            courseId: courseId ? parseInt(courseId) : -1,
        });

    const { data: learningState } =
        useGetLearningStateQuery(checkData?.registrationId ?? -1, {
            skip: !checkData?.registrationId,
        });
    const handleGetCertificate = async () => {
        if (!registrationData?.accountId || !registrationData?.courseId) return;

        try {
            const html = await getCertificate({
                accountId: accountId,
                courseId: Number(registrationData.courseId),
            }).unwrap();

            setCertificateHtml(html);
            setOpenCertificate(true);
        } catch (e) {
            console.error('Không lấy được certificate', e);
        }
    };

    const [openCertificate, setOpenCertificate] = useState(false);
    const [certificateHtml, setCertificateHtml] = useState<string>('');






    // =============================
    // Load registration
    // =============================
    useEffect(() => {
        if (!isCheckOk) return;
        if (!checkData?.registrationId) {
            navigate('/');
            return;
        }
        dispatch(setRegistrationData(checkData));
    }, [isCheckOk]);

    // =============================
    // Load course
    // =============================
    useEffect(() => {
        if (course) {
            dispatch(setLearingCourse(course));
        }
    }, [course]);

    // =============================
    // Set active step (BE SOURCE OF TRUTH)
    // =============================
    useEffect(() => {
        if (!learningState) return;
        dispatch(setStepActiveByStepId(learningState.currentStepId));
    }, [learningState]);

    // =============================
    // Progress
    // =============================
    const learningProgress = learningState?.learningProgress ?? 0;
    const totalSteps =
        course?.sections.reduce(
            (acc, section) => acc + section.steps.length,
            0,
        ) ?? 0;

    const progressPercent = Math.round(learningProgress * 100);
    const completedSteps = Math.round(learningProgress * totalSteps);
    useEffect(() => {
        if (
            progressPercent === 100 &&
            registrationData?.registrationId &&
            !hasFetchedCertificate.current
        ) {
            hasFetchedCertificate.current = true;
            handleGetCertificate();
        }
    }, [progressPercent, registrationData]);
    // =============================
    // RENDER
    // =============================
    return (
        <div className="bg-[#f0f0f0] min-h-screen">
            {/* ===== HEADER ===== */}
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            startIcon={<ArrowBackIcon />}
                            variant="text"
                            onClick={() => navigate(`/courses/${courseId}`)}
                        >
                            Quay lại
                        </Button>

                        {course && (
                            <div className="flex items-center gap-2">
                                <MenuBookIcon sx={{ fontSize: 20, color: '#666' }} />
                                <span className="text-sm font-medium">
                                    {course.title}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <strong className="text-[#f05123]">
                            {progressPercent}%
                        </strong>
                        <Progress
                            percent={progressPercent}
                            strokeColor="#f05123"
                            showInfo={false}
                            style={{ width: 120 }}
                        />
                    </div>
                </div>
            </div>

            {/* ===== MAIN ===== */}
            <div className="flex h-[calc(100vh-70px)]">
                {/* LEFT */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                        {isLoading && <Skeleton active />}

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
                </div>

                {/* RIGHT */}
                {course && learningState && (
                    <div className="hidden lg:block w-[380px] bg-white border-l overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-5 py-4">
                            <Typography.Title level={5} className="!m-0">
                                Nội dung khóa học
                            </Typography.Title>
                            <Typography.Text className="text-xs text-[#666]">
                                {completedSteps} / {totalSteps} bài học
                            </Typography.Text>
                        </div>

                        <div className="px-3 py-4">
                            <AccordionSection
                                sections={course.sections}
                                completedStepIds={learningState.completedStepIds}
                                currentStepId={learningState.currentStepId}
                            />
                        </div>
                    </div>
                )}
            </div>
            {/* ===== CERTIFICATE MODAL ===== */}
            <Dialog
                open={openCertificate}
                onClose={() => setOpenCertificate(false)}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle className="flex items-center justify-between">
                    🎉 Chứng chỉ hoàn thành khóa học
                    <Button
                        onClick={() => setOpenCertificate(false)}
                        variant="text"
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>

                <DialogContent dividers>
                    <div
                        style={{
                            width: '100%',
                            minHeight: '600px',
                        }}
                        dangerouslySetInnerHTML={{ __html: certificateHtml }}
                    />
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default LearningCoursePage;
