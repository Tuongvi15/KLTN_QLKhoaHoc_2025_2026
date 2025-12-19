import { LoadingButton } from '@mui/lab';
import {
    DatePicker,
    DatePickerProps,
    Form,
    Input,
    Select,
    Typography,
    message,
    Card,
    Avatar,
    Upload,
    Button,
} from 'antd';
import { UserOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { UserInfo, setUserInfo } from '../../../../slices/userSlice';
import { useUpdateUserInfoMutation } from '../../../../services/auth.services';

const Profile = () => {
    const dispatch = useDispatch();
    const email = useSelector((state: RootState) => state.auth.email);
    const [updateUserMutate, { isSuccess, data, isLoading }] = useUpdateUserInfoMutation();

    const userLoaded = useSelector((state: RootState) => state.user);
    const [formData, setFormData] = useState<UserInfo>(userLoaded);
    const [form] = Form.useForm();

    useEffect(() => {
        setFormData(userLoaded);
    }, [userLoaded]);

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setUserInfo(data));
            message.success('✅ Cập nhật thành công!');
        }
    }, [isSuccess]);

    const handleOnBirthdateChange: DatePickerProps['onChange'] = (_, dateString) => {
        setFormData({ ...formData, birthDate: dateString });
    };

    const onSubmit = (data: UserInfo) => {
        const userData = {
            ...data,
            id: formData.id,
            profileImg: formData.profileImg,
            birthDate: formData.birthDate
                ? dayjs(formData.birthDate).format("YYYY-MM-DD")
                : null,
        };

        updateUserMutate(userData);
    };


    return (
        <div className="max-w-5xl mx-auto">
            {/* Profile Header Card */}


            {/* Main Form Card */}
            <Card
                className="shadow-sm"

            >
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Thông tin cá nhân
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Cập nhật thông tin của bạn để cải thiện trải nghiệm học tập
                    </p>
                </div>

                <Form
                    layout="vertical"
                    onFinish={onSubmit}
                    initialValues={{
                        ...formData,
                        birthDate: formData.birthDate ? dayjs(formData.birthDate) : null,
                        email: email
                    }}
                    requiredMark={false}
                >
                    {/* Họ và Tên */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Form.Item
                            label={<span className="font-medium text-gray-700">Họ</span>}
                            name="firstName"
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ của bạn!' },
                                { min: 2, message: 'Họ cần ít nhất 2 ký tự' },
                                { whitespace: true },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Nhập họ của bạn"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-gray-700">Tên</span>}
                            name="lastName"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên của bạn!' },
                                { min: 2, message: 'Tên cần ít nhất 2 ký tự' },
                                { whitespace: true },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Nhập tên của bạn"
                                className="rounded-lg"
                            />
                        </Form.Item>
                    </div>

                    {/* Email và Số điện thoại */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Form.Item
                            label={<span className="font-medium text-gray-700">Email</span>}
                            name="email"
                        >
                            <Input
                                size="large"
                                placeholder="email@example.com"
                                type="email"
                                readOnly
                                disabled
                                className="rounded-lg bg-gray-50"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-gray-700">Số điện thoại</span>}
                            name="phoneNumber"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại của bạn!',
                                },
                                {
                                    pattern: /^\d{10,11}$/,
                                    message: 'Số điện thoại không hợp lệ!',
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="0912345678"
                                type="tel"
                                className="rounded-lg"
                            />
                        </Form.Item>
                    </div>

                    {/* Giới tính và Ngày sinh */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Form.Item
                            label={<span className="font-medium text-gray-700">Giới tính</span>}
                            name="sex"
                            rules={[
                                { required: true, message: 'Vui lòng chọn giới tính!' },
                            ]}
                        >
                            <Select
                                size="large"
                                placeholder="Chọn giới tính"
                                className="rounded-lg"
                            >
                                <Select.Option value="nữ">Nữ</Select.Option>
                                <Select.Option value="nam">Nam</Select.Option>
                                <Select.Option value="khác">Khác</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-gray-700">Ngày sinh</span>}
                            name="birthDate"
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày sinh!" },

                                // ⭐ Custom rule kiểm tra tuổi >= 13
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value) return Promise.resolve();

                                        const today = new Date();
                                        const birth = new Date(value);
                                        const age = today.getFullYear() - birth.getFullYear();
                                        const monthDiff = today.getMonth() - birth.getMonth();
                                        const dayDiff = today.getDate() - birth.getDate();

                                        const is13 =
                                            age > 13 ||
                                            (age === 13 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

                                        return is13
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                new Error("Người dùng phải đủ 13 tuổi trở lên!")
                                            );
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                size="large"
                                allowClear={false}
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                                onChange={handleOnBirthdateChange}
                                placeholder="DD/MM/YYYY"
                                format="DD/MM/YYYY"
                                className="w-full rounded-lg"
                            />
                        </Form.Item>

                    </div>

                    {/* Tiểu sử */}
                    <Form.Item
                        label={<span className="font-medium text-gray-700">Tiểu sử</span>}
                        name="biography"
                        className="mb-8"
                    >
                        <TextArea
                            size="large"
                            showCount
                            maxLength={200}
                            placeholder="Giới thiệu một chút về bản thân bạn..."
                            rows={4}
                            className="rounded-lg"
                        />
                    </Form.Item>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            <span>💡 Thông tin của bạn sẽ được bảo mật và an toàn</span>
                        </div>
                        <div className="flex gap-3">

                            <LoadingButton
                                loading={isLoading}
                                variant="contained"
                                type="submit"
                                size="large"
                                style={{
                                    borderRadius: '8px',
                                    padding: '8px 32px',
                                    textTransform: 'none',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    background: 'linear-gradient(135deg, #425ac4ff 0%, #182e8fff 100%)',
                                    boxShadow: '0 4px 12px rgba(134, 140, 167, 0.4)',
                                }}
                                startIcon={<SaveOutlined />}
                            >
                                Lưu thay đổi
                            </LoadingButton>
                        </div>
                    </div>
                </Form>
            </Card>



            {/* Global Styles */}
            <style>{`
                .ant-form-item-label > label {
                    font-weight: 500;
                    color: #374151;
                }

                .ant-input:focus,
                .ant-input-focused,
                .ant-picker:focus,
                .ant-picker-focused,
                .ant-select-focused .ant-select-selector {
                    border-color: #0727b4ff !important;
                    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1) !important;
                }

                .ant-input:hover,
                .ant-picker:hover,
                .ant-select:hover .ant-select-selector {
                    border-color: #0024c7ff !important;
                }

                .ant-form-item-has-error .ant-input:focus,
                .ant-form-item-has-error .ant-picker:focus {
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
                }

                .ant-card {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .ant-input,
                .ant-picker,
                .ant-select-selector {
                    border-radius: 8px !important;
                }

                .ant-input-textarea textarea {
                    border-radius: 8px !important;
                }

                /* Smooth transitions */
                .ant-input,
                .ant-picker,
                .ant-select-selector,
                .ant-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Form item spacing */
                .ant-form-item {
                    margin-bottom: 0;
                }

                /* Avatar hover effect */
                .ant-avatar {
                    transition: transform 0.3s ease;
                }

                .ant-avatar:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default Profile;