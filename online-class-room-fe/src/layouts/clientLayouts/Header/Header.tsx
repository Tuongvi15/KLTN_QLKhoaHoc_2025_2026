import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Button, IconButton, styled, Container, Avatar, Chip } from '@mui/material';
import { Badge, Divider, Drawer, Input, Popover, Tooltip, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FavoritePopover, MyLearningPopover, UserAvatar } from './Components';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useState } from 'react';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { Notification } from '../../../components';
import { RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useCountWishListByAccountIDQuery } from '../../../services/wishlist.services';
import { setWishListCount } from '../../../slices/courseSlice';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SchoolIcon from '@mui/icons-material/School';
import ExploreIcon from '@mui/icons-material/Explore';

// ĐI CHUYỂN STYLED COMPONENT RA NGOÀI - QUAN TRỌNG!
const StyledSearch = styled('div')({
    position: 'relative',
    '& .search-input': {
        width: '100%',
        height: '56px',
        borderRadius: '28px',
        border: '2px solid transparent',
        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box',
        fontSize: '16px',
        paddingLeft: '24px',
        paddingRight: '60px',
        outline: 'none',
        transition: 'all 0.3s ease',
        '&:focus': {
            background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #f093fb 0%, #f5576c 100%) border-box',
            boxShadow: '0 0 20px rgba(240, 147, 251, 0.3)',
        },
        '&::placeholder': {
            color: '#64748b',
            fontWeight: '500',
        }
    },
    '& .search-button': {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            transform: 'translateY(-50%) scale(1.1)',
        }
    }
});

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const dispatch = useDispatch();
    const accid = useSelector((state: RootState) => state.user.id);
    const { isSuccess, data: countData } = useCountWishListByAccountIDQuery(accid ? accid : '');

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            navigate(`/search/${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const location = useLocation();

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isSuccess && countData) {
            dispatch(setWishListCount(countData));
        }
    }, [isSuccess, countData, dispatch]);

    useEffect(() => {
        if (!location.pathname.startsWith('/search')) {
            setSearchQuery('');
        }
    }, [location]);

    const isLogin = useSelector((state: RootState) => state.auth.isLogin);
    const wishListCount = useSelector((state: RootState) => state.course.wishListCount);

    const [open, setOpen] = useState(false);

    const handleOpenMenuToggle = () => {
        setOpen((pre) => !pre);
    };

    const [loginGoogle, setLoginGoogle] = useState(false);
    const [userAvatar, setUserAvatar] = useState('');

    useEffect(() => {
        const userDataString = localStorage.getItem('userLogin');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserAvatar(userData.avatar);
            setLoginGoogle(true);
        }
    }, []);

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50'
                : 'bg-white shadow-lg'
                }`}>
                <Container maxWidth="xl">
                    <div className="flex h-20 items-center justify-between gap-4 md:gap-8">
                        {/* Mobile Menu */}
                        <div className="md:hidden">
                            <IconButton
                                onClick={handleOpenMenuToggle}
                                className="!w-12 !h-12 !bg-gradient-to-br !from-purple-500 !to-pink-500 !text-white hover:!from-pink-500 hover:!to-purple-500 !transition-all !duration-300"
                            >
                                <MenuIcon />
                            </IconButton>
                        </div>

                        {/* Logo */}
                        <Link to={'/'} className="flex items-center group">
                            <div className="flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                                        <SchoolIcon className="text-white text-2xl" />
                                    </div>
                                </div>
                                
                            </div>
                        </Link>

                        {/* Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to={'/courses/'} className="group relative">
                                <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
                                    <ExploreIcon className="text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
                                    <span className="text-lg font-semibold text-gray-700 group-hover:text-purple-600 transition-colors duration-300">
                                        Khám phá
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
                            </Link>

                            <Popover content={<MyLearningPopover />} trigger="hover" placement="bottomLeft">
                                <div className="group relative cursor-pointer">
                                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                                        <SchoolIcon className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                                        <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                                            Khóa học của tôi
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                                </div>
                            </Popover>
                            <Link to={'/placement-test'} className="group relative">
                                <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50">
                                    <ExploreIcon className="text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                                    <span className="text-lg font-semibold text-gray-700 group-hover:text-green-600 transition-colors duration-300">
                                        Bài test đầu vào
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        </div>
                        <Link to={'/community'} className="group relative">
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
                                <ExploreIcon className="text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
                                <span className="text-lg font-semibold text-gray-700 group-hover:text-purple-600 transition-colors duration-300">
                                    Cộng đồng
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
                        </Link>

                        {/* Search Bar */}
                        <StyledSearch className="flex-1 max-w-md lg:max-w-lg xl:max-w-2xl">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tìm kiếm khóa học, giảng viên, chủ đề..."
                                value={searchQuery}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                            />
                            <button
                                type="button"
                                className="search-button"
                                onClick={handleSearch}
                            >
                                <SearchIcon className="text-white" />
                            </button>
                        </StyledSearch>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Wishlist */}
                            <Popover content={<FavoritePopover />} trigger="hover" placement="bottomRight">
                                <div className="relative group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center group-hover:from-pink-200 group-hover:to-purple-200 transition-all duration-300 group-hover:scale-110">
                                        <Badge count={wishListCount} size="small" className="[&_.ant-badge-count]:!bg-gradient-to-r [&_.ant-badge-count]:!from-pink-500 [&_.ant-badge-count]:!to-purple-500 [&_.ant-badge-count]:!border-none">
                                            <FavoriteBorderIcon className="text-purple-600 group-hover:text-pink-600 transition-colors duration-300" />
                                        </Badge>
                                    </div>
                                </div>
                            </Popover>

                            {/* Notifications */}
                            <div className="relative group cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 group-hover:scale-110">
                                    <Notification />
                                </div>
                            </div>

                            {/* Auth Buttons or User Avatar */}
                            {!isLogin && !loginGoogle ? (
                                <div className="flex items-center space-x-3">
                                    <Link to={'/register'}>
                                        <Button
                                            variant="outlined"
                                            className="!border-2 !border-gray-300 !text-gray-700 !font-semibold !px-6 !py-2 !rounded-full hover:!border-purple-500 hover:!text-purple-600 !transition-all !duration-300 hover:!shadow-lg hover:!scale-105"
                                        >
                                            Đăng ký
                                        </Button>
                                    </Link>
                                    <Link to={'/login'}>
                                        <Button
                                            variant="contained"
                                            className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !font-semibold !px-6 !py-2 !rounded-full !shadow-lg hover:!from-pink-600 hover:!to-purple-600 !transition-all !duration-300 hover:!shadow-xl hover:!scale-105"
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <Tooltip title="Quản lý tài khoản" placement="bottomRight">
                                        <Link to={'/user/12'} className="block">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="relative">
                                                    {isLogin ? (
                                                        <UserAvatar className="!w-12 !h-12 cursor-pointer border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300" />
                                                    ) : (
                                                        <img
                                                            src={userAvatar}
                                                            className="w-12 h-12 cursor-pointer rounded-full border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300 object-cover"
                                                            alt="User Avatar"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-20" />

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                title={
                    <div className="flex items-center gap-3 p-2">
                        {isLogin || loginGoogle ? (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-75" />
                                    <div className="relative">
                                        {isLogin ? (
                                            <UserAvatar className="!w-14 !h-14" />
                                        ) : (
                                            <img
                                                src={userAvatar}
                                                className="w-14 h-14 rounded-full border-2 border-white object-cover"
                                                alt="User Avatar"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Xin chào, Long Nguyen
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium">Chào mừng trở lại</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                    <Notification />
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <Link to={'/register'} className="flex-1">
                                    <Button
                                        variant="outlined"
                                        className="!w-full !border-2 !border-purple-500 !text-purple-600 !font-semibold !rounded-full"
                                    >
                                        Đăng ký
                                    </Button>
                                </Link>
                                <Link to={'/login'} className="flex-1">
                                    <Button
                                        variant="contained"
                                        className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !font-semibold !rounded-full"
                                    >
                                        Đăng nhập
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                }
                closeIcon={<KeyboardDoubleArrowLeftIcon className="text-purple-600" />}
                onClose={handleOpenMenuToggle}
                open={open}
                className="[&_.ant-drawer-header]:!bg-gradient-to-r [&_.ant-drawer-header]:!from-purple-50 [&_.ant-drawer-header]:!to-pink-50"
            >
                <div className="flex flex-col gap-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <SchoolIcon className="mr-2 text-purple-600" />
                            Của tôi
                        </h3>
                        <div className="space-y-2 ml-6">
                            <Link to="/my-courses" className="block">
                                <Button
                                    className="!w-full !justify-start !normal-case !text-gray-700 hover:!text-purple-600 hover:!bg-purple-50 !transition-all !duration-300"
                                    variant="text"
                                >
                                    Khóa học của tôi
                                </Button>
                            </Link>
                            <Link to="/wishlist" className="block">
                                <Button
                                    className="!w-full !justify-start !normal-case !text-gray-700 hover:!text-pink-600 hover:!bg-pink-50 !transition-all !duration-300"
                                    variant="text"
                                >
                                    Khóa học yêu thích
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <ExploreIcon className="mr-2 text-blue-600" />
                            Khám phá
                        </h3>
                        <div className="ml-6">
                            <Link to="/courses" className="block">
                                <Button
                                    className="!w-full !justify-start !normal-case !text-gray-700 hover:!text-blue-600 hover:!bg-blue-50 !transition-all !duration-300"
                                    variant="text"
                                >
                                    Tất cả khóa học
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-orange-600">1,200+</div>
                            <div className="text-sm text-gray-600">Khóa học</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-green-600">50,000+</div>
                            <div className="text-sm text-gray-600">Học viên</div>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default Header;