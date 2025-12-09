import { Button, Input, notification } from 'antd';
import MyCarouselLogin from './MyCarouselLogin';
import { EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterUserRequest, useRegisterTeacherMutation } from '../../../services/auth.services';
import {
    checkEmailValidaion,
    checkEmptyValidation,
    checkPasswordValidation,
} from '../../../utils/Validation';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../../../firebase/firebase';
import UploadFileCustom, { UploadFileType, UploadStyle } from '../../../components/UploadFile/UploadFileCustom';

const initFromData: RegisterUserRequest = {
    accountEmail: '',
    accountPassword: '',
    confirmAccountPassword: '',
    birthDate: new Date().toISOString(),
    lastName: '',
    firstName: '',
    accountPhone: 'null',
    cvUrl: ''   // ⭐ THÊM DÒNG NÀY
};

interface validationProps {
    isError: boolean;
    errorMessage: string;
}

const initialValidation: validationProps = {
    errorMessage: '',
    isError: false,
};

function RegisterTeacherPage() {
    const [formData, setFormData] = useState(initFromData);
    const [emptyValidation, setEmptyValidation] = useState(initialValidation);
    const [emailValidation, setEmailValidation] = useState(initialValidation);
    const [emailParentValidation, setEmailParentValidation] = useState(initialValidation);
    const [passwordValidation, setPasswordValidation] = useState(initialValidation);
    const [confirmPasswordValidation, setConfirmPasswordValidation] = useState(initialValidation);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const [
        registerUser,
        { isLoading: isRegisterLoading, isSuccess: isRegisterSuccess, isError: isRegisterError },
    ] = useRegisterTeacherMutation();

    const [cvUrl, setCvUrl] = useState<string>("");

    // ERROR
    useEffect(() => {
        if (isRegisterError) {
            setErrorMessage('Email đã có người sử dụng');
        }
    }, [isRegisterError]);

    // SUCCESS → redirect
    useEffect(() => {
        if (isRegisterSuccess) {
            navigate('/login');
        }
    }, [isRegisterSuccess]);

    const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.cvUrl) {
            notification.error({
                message: "Thiếu CV",
                description: "Vui lòng upload CV PDF trước khi đăng ký.",
            });
            return;
        }

        try {
            const payload = {
                ...formData,
                cvUrl: cvUrl, // ⭐ GỬI CV VỀ BACKEND
            };

            await registerUser(payload).unwrap();

            notification.success({
                message: 'Đăng kí thành công!',
                description: 'Hãy kiểm tra email của bạn để xác thực tài khoản!',
                duration: 5,
            });

        } catch (error) {
            notification.error({
                message: 'Đăng kí thất bại',
                description: 'Vui lòng thử lại.',
            });
        }
    };

    const handleOnFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkEmptyValidation(e.target.value);
        setEmptyValidation({ isError, errorMessage: message });
        setFormData({ ...formData, firstName: e.target.value });
    };

    const handleOnLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkEmptyValidation(e.target.value);
        setEmptyValidation({ isError, errorMessage: message });
        setFormData({ ...formData, lastName: e.target.value });
    };

    const handleOnEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkEmailValidaion(e.target.value);
        setEmailValidation({ isError, errorMessage: message });
        setFormData({ ...formData, accountEmail: e.target.value });
    };

    const handleOnPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkPasswordValidation(
            e.target.value,
            formData.confirmAccountPassword,
        );
        setPasswordValidation({ isError, errorMessage: message });
        setFormData({ ...formData, accountPassword: e.target.value });
    };

    const handleOnConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkPasswordValidation(
            formData.accountPassword,
            e.target.value,
        );
        setConfirmPasswordValidation({ isError, errorMessage: message });
        setFormData({ ...formData, confirmAccountPassword: e.target.value });
    };

    const handleLoginWithGoogle = async () => {
        try {
            const auth = await getAuth(app);
            const provider = new GoogleAuthProvider();
            const userData = await signInWithPopup(auth, provider);
            const { displayName, email, photoURL } = userData.user;

            localStorage.setItem(
                'userLogin',
                JSON.stringify({ name: displayName, email, avatar: photoURL }),
            );

            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex bg-greenHome">
            <div className="w-full bg-white sm:w-[30%] sm:rounded-br-xl sm:rounded-tr-xl md:h-screen">
                <form
                    onSubmit={handleOnSubmit}
                    className="mt-2 flex flex-col items-center justify-center space-y-5"
                >
                    <section className="w-[80%] space-y-5">
                        <div className="ml-1 mt-[10%]">
                            <h1 className="text-3xl">Đăng ký</h1>
                            <p className="text-base text-grayLine mt-2">
                                Chào mừng đến với hệ thống!
                                Vui lòng điền thông tin bên dưới để trở thành giáo viên.
                            </p>
                        </div>

                        {/* FIRST NAME */}
                        <div>
                            <Input
                                required
                                onChange={handleOnFirstNameChange}
                                allowClear
                                size="large"
                                className="px-5 py-3"
                                value={formData.firstName}
                                placeholder="Nhập họ của bạn"
                                status={emptyValidation.isError ? 'error' : undefined}
                            />
                            <p className="text-red-500 text-sm">{emptyValidation.errorMessage}</p>
                        </div>

                        {/* LAST NAME */}
                        <div>
                            <Input
                                required
                                onChange={handleOnLastNameChange}
                                allowClear
                                size="large"
                                className="px-5 py-3"
                                value={formData.lastName}
                                placeholder="Nhập tên của bạn"
                                status={emptyValidation.isError ? 'error' : undefined}
                            />
                            <p className="text-red-500 text-sm">{emptyValidation.errorMessage}</p>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <Input
                                onChange={handleOnEmailChange}
                                allowClear
                                size="large"
                                className="px-5 py-3"
                                value={formData.accountEmail}
                                placeholder="Nhập địa chỉ Email"
                                status={emailValidation.isError ? 'error' : undefined}
                            />
                            <p className="text-red-500 text-sm">{emailValidation.errorMessage}</p>
                        </div>

                        {/* CV UPLOAD */}
                        <div>
                            <label className="font-medium">Upload CV (PDF)</label>
                            <UploadFileCustom
                                storePath="teacher-cv"
                                fileName={`cv-${Date.now()}.pdf`}
                                fileType={UploadFileType.PDF}
                                showPreview={false}
                                uploadStyle={UploadStyle.SMALL}   // ⭐ UI nhỏ đẹp
                                buttonText="Tải lên"
                                onUploadFileSuccess={(url) => {
                                    setCvUrl(url);
                                    setFormData({ ...formData, cvUrl: url });
                                }}
                                onUploadFileError={(err) => console.log(err)}
                            />

                            {cvUrl && (
                                <p className="text-green-600 text-sm mt-1">
                                    📄 CV đã tải lên thành công
                                </p>
                            )}

                            {!formData.cvUrl && (
                                <p className="text-red-500 text-sm">Vui lòng upload CV PDF</p>
                            )}

                        </div>

                        {/* PASSWORD */}
                        <div>
                            <Input.Password
                                onChange={handleOnPasswordChange}
                                size="large"
                                status={passwordValidation.isError ? 'error' : undefined}
                                value={formData.accountPassword}
                                placeholder="Nhập mật khẩu"
                                className="px-5 py-3"
                                iconRender={(visible) =>
                                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                }
                            />
                            <p className="text-red-500 text-sm">{passwordValidation.errorMessage}</p>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <Input.Password
                                onChange={handleOnConfirmPasswordChange}
                                size="large"
                                status={confirmPasswordValidation.isError ? 'error' : undefined}
                                value={formData.confirmAccountPassword}
                                placeholder="Xác nhận mật khẩu"
                                className="px-5 py-3"
                                iconRender={(visible) =>
                                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                }
                            />
                            <p className="text-red-500 text-sm">{confirmPasswordValidation.errorMessage}</p>
                        </div>
                    </section>

                    {/* ERROR MESSAGE */}
                    <p className="text-red-500 text-sm">{errorMessage}</p>

                    {/* SUBMIT BUTTON */}
                    <Button
                        disabled={
                            !cvUrl ||
                            emailValidation.isError ||
                            passwordValidation.isError ||
                            confirmPasswordValidation.isError ||
                            formData.accountEmail.length === 0 ||
                            formData.accountPassword.length === 0 ||
                            formData.confirmAccountPassword.length === 0
                        }
                        htmlType="submit"
                        loading={isRegisterLoading}
                        type="default"
                        className="h-11 w-[70%] bg-greenHome font-bold"
                    >
                        Đăng ký
                    </Button>

                    <div>Hoặc</div>

                    {/* GOOGLE LOGIN */}
                    <Button
                        type="default"
                        className="flex h-11 w-[70%] items-center justify-center space-x-2 text-lg"
                        onClick={handleLoginWithGoogle}
                    >
                        <GoogleOutlined style={{ fontSize: '24px', color: 'red' }} />
                        <span className="text-black">Google</span>
                    </Button>

                    <div>
                        Đã có tài khoản?{" "}
                        <Link to={'/login'} className="text-red-500">
                            Đăng nhập ngay.
                        </Link>
                    </div>
                </form>
            </div>

            {/* RIGHT PANEL */}
            <div className="hidden sm:block sm:w-[70%]">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/estudyhub-a1699.appspot.com/o/logo%2Flogo-black-tail.png?alt=media&token=e65f65a8-94a6-4504-a370-730b122ba42e"
                    alt="logo"
                    className="absolute right-1 top-2 w-[100px]"
                />
                <MyCarouselLogin />
            </div>
        </div>
    );
}

export default RegisterTeacherPage;
