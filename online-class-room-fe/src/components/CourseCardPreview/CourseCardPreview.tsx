import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { Course } from '../../types/Course.type';
import { formatNumberWithCommas } from '../../utils/NumberFormater';
import { FormatType, secondsToTimeString } from '../../utils/TimeFormater';
import { FavoriteButton, Video } from '..';
import { Modal, Skeleton } from 'antd';
import { useAddOrderToDBMutation } from '../../services/order.services';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setPreOrderData } from '../../slices/orderSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCheckRegistrationCourseQuery } from '../../services/registrationCourse.services';

interface Props {
    course: Course;
}

const CourseCardPreview = ({ course }: Props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [openPreviewModal, setOpenPreviewModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const accountId = useSelector((state: RootState) => state.user.id);
    const isLogin = useSelector((state: RootState) => state.auth.isLogin);

    const [
        addOrder,
        { isLoading: isAddOrderLoading, isSuccess: isAddOrderSuccess, data: addOrderData },
    ] = useAddOrderToDBMutation();

    const {
        refetch,
        data: checkRegistrationData,
        isLoading: isCheckRegistrationLoading,
    } = useCheckRegistrationCourseQuery({
        accountId: accountId ? accountId : '',
        courseId: course.courseId,
    });

    useEffect(() => {
        if (isAddOrderSuccess && addOrderData) {
            dispatch(setPreOrderData({ addOrderRespone: addOrderData, CourseData: course }));
            navigate('/checkout');
        }
    }, [isAddOrderSuccess]);

    useEffect(() => {
        refetch();
    }, [accountId]);

    // PRICE CALCULATION -----------------------------------------------------
    const getSalePrice = () => {
        if (course.salesCampaign && course.salesCampaign > 0) {
            return Math.round(course.price * (1 - course.salesCampaign));
        }
        return course.price;
    };

    const hasSale = course.salesCampaign && course.salesCampaign > 0;
    const salePrice = getSalePrice();
    const discountPercent = hasSale ? Math.round(course.salesCampaign * 100) : 0;

    // LOGIN CHECK -----------------------------------------------------------
    const requireLogin = (callback: Function) => {
        if (!isLogin || !accountId) {
            setShowLoginModal(true);
            return;
        }
        callback();
    };

    // ACTIONS ---------------------------------------------------------------
    const handleBuyClick = () => {
        requireLogin(() => addOrder({ accountId, courseId: course.courseId }));
    };

    const handleLearnClick = () => {
        requireLogin(() => navigate('/learn/' + course.courseId));
    };

    const handlePreviewClick = () => {
        requireLogin(() => setOpenPreviewModal(true));
    };

    return (
        <>
            <Paper className="w-[350px]" elevation={3}>
                <div className="p-0.5">
                    <div className="relative flex justify-center">
                        <div className="flex max-h-[200px] items-center justify-center overflow-hidden">
                            <img src={course?.imageUrl} className="w-full rounded-sm" />
                        </div>

                        {/* CLICK PREVIEW */}
                        <div
                            className="absolute inset-0 flex cursor-pointer items-center justify-center"
                            onClick={handlePreviewClick}
                        >
                            <PlayCircleOutlineIcon style={{ fontSize: 50, color: '#fff' }} />
                        </div>

                        <span className="absolute bottom-7 flex justify-center text-lg font-bold text-white">
                            Xem trước
                        </span>
                    </div>

                    <div className="flex flex-col gap-2 px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                {hasSale ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold text-[#a435f0]">
                                                {formatNumberWithCommas(salePrice)}₫
                                            </h2>
                                            <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                                -{discountPercent}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-through">
                                            {formatNumberWithCommas(course.price)}₫
                                        </p>
                                    </>
                                ) : (
                                    <h2 className="text-2xl font-bold">
                                        {formatNumberWithCommas(course.price)}₫
                                    </h2>
                                )}
                            </div>
                            <FavoriteButton courseId={course.courseId} />
                        </div>

                        {/* BUY / CONTINUE LEARNING */}
                        {!isCheckRegistrationLoading &&
                            !checkRegistrationData?.registrationId && (
                                <LoadingButton
                                    onClick={handleBuyClick}
                                    loading={isAddOrderLoading}
                                    variant="contained"
                                    className="flex-1 bg-[#a435f0]"
                                >
                                    Mua khóa học
                                </LoadingButton>
                            )}

                        {!isCheckRegistrationLoading &&
                            checkRegistrationData?.registrationId && (
                                <LoadingButton
                                    onClick={handleLearnClick}
                                    variant="contained"
                                    className="flex-1 bg-[#a435f0]"
                                >
                                    Tiếp tục học
                                </LoadingButton>
                            )}

                        {isCheckRegistrationLoading && (
                            <Skeleton.Input active className="!flex-1" />
                        )}

                        <div>
                            <h2 className="mt-4">Khóa học này bao gồm:</h2>
                            <div className="mt-3 flex flex-col gap-2">
                                <div className="flex items-center text-sm">
                                    <OndemandVideoIcon className="mr-4" style={{ fontSize: 'inherit' }} />
                                    <p>
                                        {secondsToTimeString(
                                            course.totalDuration,
                                            FormatType.HH_MM,
                                            [' giờ', ' phút'],
                                        )}{' '}
                                        thời gian học
                                    </p>
                                </div>

                                <div className="flex items-center text-sm">
                                    <PhoneAndroidIcon className="mr-4" style={{ fontSize: 'inherit' }} />
                                    <p>Có thể truy cập bằng điện thoại</p>
                                </div>

                                <div className="flex items-center text-sm">
                                    <AllInclusiveIcon className="mr-4" style={{ fontSize: 'inherit' }} />
                                    <p>Truy cập trọn đời</p>
                                </div>

                                <div className="flex items-center text-sm">
                                    <EmojiEventsOutlinedIcon className="mr-4" style={{ fontSize: 'inherit' }} />
                                    <p>Cấp chứng chỉ khi hoàn thành khóa học</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Paper>

            {/* VIDEO PREVIEW MODAL */}
            <Modal
                open={openPreviewModal}
                centered
                maskClosable={true}
                footer={null}
                closable={false}
                className="!w-[1000px]"
                destroyOnClose
                onCancel={() => setOpenPreviewModal(false)}
            >
                <div>
                    <Video src={course.videoPreviewUrl} />
                </div>
            </Modal>

            {/* LOGIN MODAL */}
            <Modal
                open={showLoginModal}
                onCancel={() => setShowLoginModal(false)}
                footer={null}
                centered
            >
                <div className="text-center py-6">
                    <h2 className="text-xl font-bold mb-2 text-purple-600">
                        Bạn chưa đăng nhập
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vui lòng đăng nhập để tiếp tục mua hoặc xem trước khóa học.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/login?redirect=${encodeURIComponent(location.pathname)}`
                            )
                        }
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default CourseCardPreview;
