import React, { useState } from 'react';
import { Switch, Button, message, Divider, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import {
    setCoursePublish,
    setCourseCreatedData,
} from '../../../../slices/courseSlice';
import { useUpdateCourseMutation } from '../../../../services/course.services';
import { RoleType } from '../../../../slices/authSlice';

const Publication: React.FC = () => {
    const dispatch = useDispatch();
    const courseCreatedData = useSelector(
        (state: RootState) => state.course.addCourse.courseCreatedData
    );
    const role = useSelector((state: RootState) => state.auth.currentRole);
    const [updateCourse, { isLoading }] = useUpdateCourseMutation();

    // 🧮 Local state cho giá tiền và giảm giá
    const [price, setPrice] = useState<number>(courseCreatedData.price || 0);
    const [discount, setDiscount] = useState<number>(
        courseCreatedData.salesCampaign || 0
    );

    const handlePublishChange = async (checked: boolean) => {
        try {
            if (role === RoleType.TEACHER) {
                message.warning('Chỉ quản trị viên mới có thể xuất bản khóa học.');
                return;
            }

            const updated = {
                ...courseCreatedData,
                isPublic: checked,
                categoryList: courseCreatedData.courseCategories.map((c) => c.categoryId),
            };
            await updateCourse(updated);
            dispatch(setCoursePublish(checked));
            message.success(
                checked
                    ? 'Khóa học đã được xuất bản!'
                    : 'Khóa học đã được gỡ khỏi xuất bản.'
            );
        } catch {
            message.error('Không thể thay đổi trạng thái xuất bản.');
        }
    };

    const handleActiveChange = async (checked: boolean) => {
        try {
            const updated = {
                ...courseCreatedData,
                courseIsActive: checked,
                categoryList: courseCreatedData.courseCategories.map(
                    (c) => c.categoryId
                ),
            };

            // Nếu teacher, không cho public
            if (role === RoleType.TEACHER) updated.isPublic = false;

            await updateCourse(updated);

            dispatch(
                setCourseCreatedData({
                    ...courseCreatedData,
                    courseIsActive: checked,
                })
            );

            if (role === RoleType.TEACHER) {
                message.info(
                    'Trạng thái khóa học đã được cập nhật. Khóa học sẽ được xuất bản khi quản trị viên duyệt.'
                );
            } else {
                message.success(
                    checked
                        ? 'Khóa học đã được kích hoạt!'
                        : 'Khóa học đã được tạm dừng!'
                );
            }
        } catch {
            message.error('Không thể cập nhật trạng thái khóa học.');
        }
    };

    // 💰 Cập nhật giá tiền & giảm giá
    const handlePriceChange = (value: number | null) => {
        setPrice(value || 0);
    };

    const handleDiscountChange = (value: number | null) => {
        setDiscount(value || 0);
    };

    const handleSavePrice = async () => {
        try {
            const updated = {
                ...courseCreatedData,
                price,
                // ⚙️ Giảm giá từ % sang tỷ lệ (ví dụ 14% → 0.14)
                salesCampaign: discount / 100,
                // ✅ Tự động kích hoạt khóa học
                courseIsActive: true,
                // 🚫 Không cho phép public — chờ admin duyệt
                isPublic: false,
                categoryList: courseCreatedData.courseCategories.map((c) => c.categoryId),
            };

            await updateCourse(updated);

            // ✅ Cập nhật lại Redux store
            dispatch(
                setCourseCreatedData({
                    ...courseCreatedData,
                    price,
                    salesCampaign: discount,
                    courseIsActive: true,
                    isPublic: false,
                })
            );

            message.success(
                'Đã lưu giá, giảm giá và kích hoạt khóa học. Khóa học sẽ được gửi lên hệ thống chờ quản trị viên duyệt.'
            );
        } catch {
            message.error('Không thể cập nhật giá.');
        }
    };


    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-[#1677ff] mb-4">
                {role === RoleType.TEACHER
                    ? 'Cập nhật trạng thái & giá khóa học'
                    : 'Xuất bản khóa học'}
            </h2>

            <Divider />

            {role === RoleType.ADMIN ? (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-base font-medium">Xuất bản khóa học:</p>
                        <Switch
                            checked={courseCreatedData.isPublic}
                            onChange={handlePublishChange}
                            loading={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-base font-medium">Trạng thái khóa học:</p>
                        <Switch
                            checked={courseCreatedData.courseIsActive}
                            onChange={handleActiveChange}
                            loading={isLoading}
                        />
                    </div>
                </>
            ) : (
                <>
                    {/* 👨‍🏫 Teacher view */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-base font-medium">Trạng thái khóa học:</p>
                        <Switch
                            checked={courseCreatedData.courseIsActive}
                            onChange={handleActiveChange}
                            loading={isLoading}
                        />
                    </div>

                    <Divider />

                    {/* 💰 Giá và Giảm giá */}
                    <div className="flex flex-col gap-4 mb-4">
                        <div>
                            <p className="text-base font-medium text-[#1677ff] mb-1">
                                Giá khóa học (₫):
                            </p>
                            <InputNumber
                                value={price}
                                min={0}
                                max={100000000}
                                onChange={handlePriceChange}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <p className="text-base font-medium text-[#1677ff] mb-1">
                                Giảm giá (%):
                            </p>
                            <InputNumber
                                value={discount}
                                min={0}
                                max={100}
                                onChange={handleDiscountChange}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            onClick={handleSavePrice}
                            loading={isLoading}
                            className="bg-[#1677ff] text-white hover:bg-[#4096ff]"
                        >
                            Lưu giá & giảm giá
                        </Button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                        <strong>💡 Ghi chú:</strong> Việc lưu giá sẽ đồng nghĩa với bật trạng thái hoạt động. Khi bật trạng thái hoạt động, khóa học sẽ được
                        gửi lên hệ thống chờ quản trị viên duyệt và xuất bản.
                    </div>
                </>
            )}

            {/* <div className="flex justify-end mt-6">
                <Button
                    type="default"
                    onClick={() => message.success('Cập nhật trạng thái thành công!')}
                >
                    Lưu thay đổi
                </Button>
            </div> */}
        </div>
    );
};

export default Publication;
