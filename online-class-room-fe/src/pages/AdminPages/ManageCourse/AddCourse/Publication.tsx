import React, { useState } from 'react';
import { Switch, Button, message, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import {
    setCoursePublish,
    setCourseCreatedData,
} from '../../../../slices/courseSlice';
import { useUpdateCourseMutation } from '../../../../services/course.services';
import { RoleType } from '../../../../slices/authSlice';
import { CheckCircle, XCircle, DollarSign, Percent, Info } from 'lucide-react';

const Publication: React.FC = () => {
    const dispatch = useDispatch();
    const courseCreatedData = useSelector(
        (state: RootState) => state.course.addCourse.courseCreatedData
    );
    const role = useSelector((state: RootState) => state.auth.currentRole);
    const [updateCourse, { isLoading }] = useUpdateCourseMutation();

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

                // ⭐ FIX BẮT BUỘC
                suitableLevels: courseCreatedData.suitableLevels ?? "",
            };

            await updateCourse(updated);
            dispatch(setCoursePublish(checked));
            message.success(
                checked
                    ? 'Cập nhật thành công!'
                    : 'Cập nhật thành công'
            );
        } catch {
            message.error('Không thể thay đổi trạng thái xuất bản.');
        }
    };

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
                salesCampaign: discount / 100,
                courseIsActive: true,
                isPublic: false,
                categoryList: courseCreatedData.courseCategories.map((c) => c.categoryId),

                // ⭐ FIX BẮT BUỘC
                suitableLevels: courseCreatedData.suitableLevels ?? "",
            };


            await updateCourse(updated);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {role === RoleType.TEACHER
                            ? 'Quản lý khóa học'
                            : 'Xuất bản khóa học'}
                    </h1>
                    <p className="text-gray-600">
                        {role === RoleType.TEACHER
                            ? 'Cập nhật giá và thông tin khóa học của bạn'
                            : 'Quản lý trạng thái xuất bản và hoạt động'}
                    </p>
                </div>

                {role === RoleType.ADMIN ? (
                    <div className="space-y-4">
                        {/* Xuất bản khóa học */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${courseCreatedData.isPublic ? "bg-green-100" : "bg-gray-100"
                                                }`}
                                        >
                                            {courseCreatedData.isPublic ? (
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Xuất bản khóa học</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {courseCreatedData.isPublic
                                                    ? "Khóa học đang được công khai"
                                                    : "Khóa học chưa được xuất bản"}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={!courseCreatedData.courseIsActive
                                            ? "rounded-full bg-red-200 p-1"   // nền đậm hơn
                                            : "rounded-full bg-gray-100 p-1"
                                        }
                                    >
                                        <Switch
                                            checked={courseCreatedData.isPublic}
                                            onChange={handlePublishChange}
                                            loading={isLoading}
                                            size="default"
                                            disabled={!courseCreatedData.courseIsActive}
                                        />
                                    </div>

                                </div>

                                {/* ⚠ Hiển thị lý do không thể public */}
                                {!courseCreatedData.courseIsActive && (
                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-3 text-sm">
                                        ⚠ Khóa học hiện đang <strong>tạm dừng</strong>.
                                        Giảng viên cần kích hoạt khóa học trước thì khóa học mới có thể xuất bản.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trạng thái khóa học */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden opacity-60">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${courseCreatedData.courseIsActive ? "bg-blue-100" : "bg-gray-100"
                                                }`}
                                        >
                                            {courseCreatedData.courseIsActive ? (
                                                <CheckCircle className="w-6 h-6 text-blue-600" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Trạng thái khóa học</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {courseCreatedData.courseIsActive
                                                    ? "Khóa học đang hoạt động"
                                                    : "Khóa học đã tạm dừng"}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={!courseCreatedData.courseIsActive
                                            ? "rounded-full bg-red-200 p-1"   // nền đậm hơn
                                            : "rounded-full bg-gray-100 p-1"
                                        }
                                    > <Switch checked={courseCreatedData.courseIsActive} disabled size="default" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                    : (
                        <div className="space-y-6">
                            {/* Trạng thái khóa học - Disabled for Teacher */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden opacity-60">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${courseCreatedData.courseIsActive
                                                ? 'bg-blue-100'
                                                : 'bg-gray-100'
                                                }`}>
                                                {courseCreatedData.courseIsActive ? (
                                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Trạng thái khóa học
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {courseCreatedData.courseIsActive
                                                        ? 'Khóa học đang hoạt động'
                                                        : 'Khóa học đã tạm dừng'}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={!courseCreatedData.courseIsActive
                                                ? "rounded-full bg-red-200 p-1"   // nền đậm hơn
                                                : "rounded-full bg-gray-100 p-1"
                                            }
                                        >
                                            <Switch
                                                checked={courseCreatedData.courseIsActive}
                                                disabled={true}
                                                size="default"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                    <h3 className="text-xl font-bold text-white">
                                        Thiết lập giá khóa học
                                    </h3>
                                    <p className="text-blue-100 mt-1">
                                        Cập nhật giá và chương trình giảm giá
                                    </p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Price Input */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                            Giá khóa học (₫)
                                        </label>
                                        <InputNumber
                                            value={price}
                                            min={0}
                                            max={100000000}
                                            onChange={handlePriceChange}
                                            className="w-full"
                                            size="large"
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => Number((value ?? "0").replace(/\$\s?|(,*)/g, ""))}

                                        />
                                    </div>

                                    {/* Discount Input */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Percent className="w-5 h-5 text-blue-600" />
                                            Giảm giá (%)
                                        </label>
                                        <InputNumber
                                            value={discount}
                                            min={0}
                                            max={100}
                                            onChange={handleDiscountChange}
                                            className="w-full"
                                            size="large"
                                        />
                                    </div>

                                    {/* Final Price Preview */}
                                    {discount > 0 && (
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 font-medium">Giá sau giảm:</span>
                                                <div className="text-right">
                                                    <span className="text-gray-400 line-through text-sm">
                                                        {price.toLocaleString('vi-VN')}₫
                                                    </span>
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {(price * (1 - discount / 100)).toLocaleString('vi-VN')}₫
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Save Button */}
                                    <Button
                                        type="primary"
                                        onClick={handleSavePrice}
                                        loading={isLoading}
                                        size="large"
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                    >
                                        Lưu giá & Kích hoạt khóa học
                                    </Button>

                                    {/* Info Box */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex gap-3">
                                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <strong className="font-semibold">Lưu ý:</strong> Việc lưu giá sẽ tự động kích hoạt khóa học và gửi lên hệ thống chờ quản trị viên duyệt và xuất bản.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default Publication;