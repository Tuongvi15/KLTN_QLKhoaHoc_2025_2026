import { Button, Input } from 'antd';
import MyCarouselLogin from './MyCarouselLogin';
import { EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks/appHook';
import { LoginRequest, useLoginUserMutation } from '../../../services/auth.services';
import { useEffect, useState } from 'react';
import { setUser } from '../../../slices/authSlice';
import { checkEmailValidaion, checkEmptyValidation } from '../../../utils/Validation';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../../../firebase/firebase';

const initFromData: LoginRequest = {
    accountEmail: '',
    accountPassword: '',
};

interface validationProps {
    isError: boolean;
    errorMessage: string;
}

const initialValidation: validationProps = {
    errorMessage: '',
    isError: false,
};

function LoginPage() {
    const useDispach = useAppDispatch();
    const [formData, setFormData] = useState(initFromData);
    const [emailValidation, setEmailValidation] = useState(initialValidation);
    const [passwordValidation, setPasswordValidation] = useState(initialValidation);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const [
        loginUser,
        {
            data: loginData,
            isLoading: isLoginLoading,
            isSuccess: isLoginSuccess,
            isError: isLoginError,
        },
    ] = useLoginUserMutation();

    useEffect(() => {
        if (isLoginError) {
            setErrorMessage('Địa chỉ email hoặc mật khẩu không đúng!');
        }
    }, [isLoginError]);

    // --------------------------
    // ⭐ XỬ LÝ REDIRECT SAU LOGIN
    // --------------------------
    useEffect(() => {
        if (isLoginSuccess && loginData) {
            const userData = {
                accessToken: loginData.jwtToken,
                refreshToken: loginData.jwtRefreshToken,
                email: formData.accountEmail,
                isLogin: true,
                expired: loginData.expired,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            useDispach(setUser({ ...userData }));

            // lấy redirect từ URL
            const params = new URLSearchParams(location.search);
            const redirect = params.get("redirect");

            if (redirect) {
                navigate(redirect, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isLoginSuccess]);
    // --------------------------

    const handleOnSubmit = async () => {
        await loginUser(formData);
    };

    const handleOnEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkEmailValidaion(e.target.value);
        setEmailValidation({ isError: isError, errorMessage: message });
        setFormData({ ...formData, accountEmail: e.target.value });
    };

    const handleOnPassworldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { isError, message } = checkEmptyValidation(
            e.target.value,
            'Mật khẩu không được để trống',
        );
        setPasswordValidation({ isError: isError, errorMessage: message });
        setFormData({ ...formData, accountPassword: e.target.value });
    };

    const handleLoginWithGoogle = async () => {
        try {
            const auth = await getAuth(app);
            const provider = new GoogleAuthProvider();
            const userData = await signInWithPopup(auth, provider);
            console.log(userData);
            const { displayName, email, photoURL } = userData.user;

            localStorage.setItem(
                'userLogin',
                JSON.stringify({ name: displayName, email, avatar: photoURL }),
            );

            // GOOGLE LOGIN cũng hỗ trợ redirect
            const params = new URLSearchParams(location.search);
            const redirect = params.get("redirect");
            if (redirect) navigate(redirect, { replace: true });
            else navigate('/', { replace: true });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex bg-greenHome font-sans">
            <div className="w-full bg-white sm:w-[30%] sm:rounded-br-xl sm:rounded-tr-xl md:h-screen">
                <form className="mt-8 flex flex-col items-center justify-center space-y-4">
                    <section className="w-[70%] space-y-4 ">
                        <div className="mb-12 ml-1 mt-[40%] ">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                Đăng nhập
                            </h1>
                            <p className="sm:max-xl:text-md mt-3 text-base font-normal leading-relaxed text-gray-600">
                                Mừng trở lại! Vui lòng điền thông tin bên dưới để tiếp tục
                            </p>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                onChange={handleOnEmailChange}
                                allowClear
                                size="large"
                                className="px-5 py-3 font-normal"
                                placeholder="Nhập địa chỉ Email"
                                status={emailValidation.isError ? 'error' : undefined}
                            />
                            <p className="ml-2 mt-1.5 text-sm font-medium text-red-500">
                                {emailValidation.errorMessage}
                            </p>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <Input.Password
                                value={formData.accountPassword}
                                onChange={handleOnPassworldChange}
                                size="large"
                                status={passwordValidation.isError ? 'error' : undefined}
                                placeholder="Nhập mật khẩu"
                                className="px-5 py-3 font-normal"
                                iconRender={(visible) =>
                                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                }
                            />
                            <p className="ml-2 mt-1.5 text-sm font-medium text-red-500">
                                {passwordValidation.errorMessage}
                            </p>
                            <div className="ml-2 mt-2 text-sm">
                                <Link to={'#'} className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </div>
                    </section>
                    {errorMessage && (
                        <p className="ml-2 text-sm font-semibold text-red-500">{errorMessage}</p>
                    )}
                    <Button
                        disabled={
                            emailValidation.isError ||
                            passwordValidation.isError ||
                            formData.accountEmail.length == 0 ||
                            formData.accountPassword.length == 0
                        }
                        onClick={handleOnSubmit}
                        loading={isLoginLoading}
                        type="primary"
                        className="text-base h-12 w-[70%] bg-greenHome font-semibold tracking-wide"
                    >
                        Đăng nhập
                    </Button>
                    <div className="text-sm font-medium text-gray-500">hoặc</div>
                    <Button
                        type="default"
                        className="flex h-12 w-[70%] items-center justify-center space-x-2 text-base font-medium"
                        onClick={handleLoginWithGoogle}
                    >
                        <GoogleOutlined style={{ fontSize: '24px', color: '#DB4437' }} />
                        <span className="text-gray-700">Đăng nhập với Google</span>
                    </Button>
                    <div className="text-sm font-normal text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to={'/register'} className="font-semibold text-red-500 hover:text-red-600 transition-colors">
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>

            <div className="hidden justify-end sm:block sm:w-[70%]">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/estudyhub-a1699.appspot.com/o/logo%2Flogo-black-tail.png?alt=media&token=e65f65a8-94a6-4504-a370-730b122ba42e"
                    alt="logo"
                    className="absolute right-1 top-2 w-[100px]"
                />
                <MyCarouselLogin></MyCarouselLogin>
            </div>
        </div>
    );
}

export default LoginPage;
