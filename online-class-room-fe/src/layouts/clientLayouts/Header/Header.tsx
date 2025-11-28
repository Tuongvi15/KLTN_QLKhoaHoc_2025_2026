import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Button, IconButton, styled, Container } from '@mui/material';
import { Badge, Drawer, Popover, Tooltip } from 'antd';
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
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExploreIcon from '@mui/icons-material/Explore';

const StyledSearch = styled('div')({
    position: 'relative',
    width: '100%',
    '& .search-input': {
        width: '100%',
        height: '48px',
        border: '1px solid #1c1d1f',
        borderRadius: '50px',
        fontSize: '16px',
        paddingLeft: '48px',
        paddingRight: '16px',
        outline: 'none',
        fontFamily: 'inherit',
        '&:focus': {
            borderColor: '#5624d0',
            borderWidth: '2px',
        },
        '&::placeholder': {
            color: '#6a6f73',
        }
    },
    '& .search-icon': {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#1c1d1f',
        pointerEvents: 'none',
    }
});

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
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
            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)]">
                <Container maxWidth="xl">
                    <div className="flex h-[72px] items-center gap-4">
                        {/* Mobile Menu */}
                        <div className="lg:hidden">
                            <IconButton
                                onClick={handleOpenMenuToggle}
                                sx={{ 
                                    color: '#1c1d1f',
                                    '&:hover': { bgcolor: '#f7f9fa' }
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </div>

                        {/* Logo */}
                        <Link to={'/'} className="flex items-center">
                            <div className="flex items-center">
                                <SchoolIcon sx={{ fontSize: 40, color: '#00497cff' }} />
                                <span className="ml-1 text-2xl font-bold text-[#1c1d1f] hidden sm:inline">eStudyHub</span>
                            </div>
                        </Link>

                        {/* Navigation - Desktop */}
                        <div className="hidden lg:flex items-center gap-2">
                            <Link to={'/courses/'}>
                                <button className="px-3 py-2 text-[15px] font-medium text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap">
                                    Khám phá
                                </button>
                            </Link>

                            <Popover content={<MyLearningPopover />} trigger="hover" placement="bottom">
                                <button className="px-3 py-2 text-[15px] font-medium text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap">
                                    Khóa học của tôi
                                </button>
                            </Popover>

                            <Link to={'/placement-test'}>
                                <button className="px-3 py-2 text-[15px] font-medium text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap">
                                    Bài test đầu vào
                                </button>
                            </Link>

                            <Link to={'/community'}>
                                <button className="px-3 py-2 text-[15px] font-medium text-[#1c1d1f] hover:text-[#5624d0] transition-colors whitespace-nowrap">
                                    Cộng đồng
                                </button>
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-[750px] hidden md:block">
                            <StyledSearch>
                                <SearchIcon className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Tìm kiếm khóa học ..."
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyPress}
                                />
                            </StyledSearch>
                        </div>

                        {/* Right Navigation */}
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Wishlist */}
                            <Popover content={<FavoritePopover />} trigger="hover" placement="bottomRight">
                                <IconButton 
                                    sx={{ 
                                        color: '#1c1d1f',
                                        '&:hover': { bgcolor: '#f7f9fa', color: '#5624d0' }
                                    }}
                                >
                                    <Badge 
                                        count={wishListCount} 
                                        size="small"
                                        className="[&_.ant-badge-count]:!bg-[#ec5252] [&_.ant-badge-count]:!border-none [&_.ant-badge-count]:!min-w-[18px] [&_.ant-badge-count]:!h-[18px] [&_.ant-badge-count]:!text-[11px] [&_.ant-badge-count]:!leading-[18px]"
                                    >
                                        <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                                    </Badge>
                                </IconButton>
                            </Popover>

                            {/* Notifications */}
                            <IconButton 
                                sx={{ 
                                    color: '#1c1d1f',
                                    '&:hover': { bgcolor: '#f7f9fa', color: '#5624d0' }
                                }}
                            >
                                <Notification />
                            </IconButton>

                            {/* Auth Buttons or User Avatar */}
                            {!isLogin && !loginGoogle ? (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to={'/login'}>
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                color: '#1c1d1f',
                                                borderColor: '#1c1d1f',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                padding: '10px 16px',
                                                '&:hover': {
                                                    borderColor: '#1c1d1f',
                                                    bgcolor: '#f7f9fa'
                                                }
                                            }}
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                    <Link to={'/register'}>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#1c1d1f',
                                                color: 'white',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                padding: '10px 16px',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    bgcolor: '#000000',
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Đăng ký
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Tooltip title="Tài khoản" placement="bottom">
                                    <Link to={'/user/12'}>
                                        {isLogin ? (
                                            <UserAvatar className="!w-10 !h-10 cursor-pointer" />
                                        ) : (
                                            <img
                                                src={userAvatar}
                                                className="w-10 h-10 cursor-pointer rounded-full object-cover"
                                                alt="User Avatar"
                                            />
                                        )}
                                    </Link>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </Container>
                
                {/* Mobile Search Bar */}
                <div className="md:hidden border-t border-gray-200 px-4 py-2">
                    <StyledSearch>
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm khóa học ..."
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                        />
                    </StyledSearch>
                </div>
            </header>

            {/* Spacer */}
            <div className="h-[72px] md:h-[72px]" />

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                title={
                    <div className="flex items-center gap-3">
                        {isLogin || loginGoogle ? (
                            <>
                                {isLogin ? (
                                    <UserAvatar className="!w-12 !h-12" />
                                ) : (
                                    <img
                                        src={userAvatar}
                                        className="w-12 h-12 rounded-full object-cover"
                                        alt="User Avatar"
                                    />
                                )}
                                <div>
                                    <h2 className="text-lg font-bold text-[#1c1d1f]">
                                        Long Nguyen
                                    </h2>
                                    <p className="text-sm text-[#6a6f73]">Chào mừng trở lại</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <Link to={'/login'} className="flex-1">
                                    <Button
                                        variant="outlined"
                                        className="!w-full !border-[#1c1d1f] !text-[#1c1d1f] !font-bold !normal-case"
                                    >
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to={'/register'} className="flex-1">
                                    <Button
                                        variant="contained"
                                        className="!w-full !bg-[#1c1d1f] !font-bold !normal-case !shadow-none"
                                    >
                                        Đăng ký
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                }
                closeIcon={<KeyboardDoubleArrowLeftIcon />}
                onClose={handleOpenMenuToggle}
                open={open}
            >
                <div className="flex flex-col gap-4">
                    <div className="border-b pb-3">
                        <h3 className="font-semibold text-[#1c1d1f] mb-2 flex items-center">
                            <SchoolIcon className="mr-2" sx={{ fontSize: 20 }} />
                            Của tôi
                        </h3>
                        <div className="ml-7 space-y-1">
                            <Link to="/my-courses" className="block text-[15px] text-[#1c1d1f] hover:text-[#5624d0] py-2">
                                Khóa học của tôi
                            </Link>
                            <Link to="/wishlist" className="block text-[15px] text-[#1c1d1f] hover:text-[#5624d0] py-2">
                                Khóa học yêu thích
                            </Link>
                        </div>
                    </div>

                    <div className="border-b pb-3">
                        <h3 className="font-semibold text-[#1c1d1f] mb-2 flex items-center">
                            <ExploreIcon className="mr-2" sx={{ fontSize: 20 }} />
                            Khám phá
                        </h3>
                        <div className="ml-7 space-y-1">
                            <Link to="/courses" className="block text-[15px] text-[#1c1d1f] hover:text-[#5624d0] py-2">
                                Tất cả khóa học
                            </Link>
                            <Link to="/placement-test" className="block text-[15px] text-[#1c1d1f] hover:text-[#5624d0] py-2">
                                Bài test đầu vào
                            </Link>
                            <Link to="/community" className="block text-[15px] text-[#1c1d1f] hover:text-[#5624d0] py-2">
                                Cộng đồng
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-[#f7f9fa] p-4 rounded-lg text-center border border-gray-200">
                            <div className="text-2xl font-bold text-[#1c1d1f]">1,200+</div>
                            <div className="text-sm text-[#6a6f73]">Khóa học</div>
                        </div>
                        <div className="bg-[#f7f9fa] p-4 rounded-lg text-center border border-gray-200">
                            <div className="text-2xl font-bold text-[#1c1d1f]">50,000+</div>
                            <div className="text-sm text-[#6a6f73]">Học viên</div>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default Header;