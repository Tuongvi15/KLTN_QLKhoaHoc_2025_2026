import {
    Button,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    styled,
    Avatar as MuiAvatar,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ImageIcon from '@mui/icons-material/Image';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useEffect, useState } from 'react';
import { ManageProfileMenu } from './ManageProfile.enum';
import { Profile, Security, MyLearningCourse, UploadAvatar } from './Components';
import { LogoutOutlined } from '@mui/icons-material';
import { UserAvatar } from '../../../layouts/clientLayouts/Header/Components';
import { useSelector } from 'react-redux';
import { RootState, persistor } from '../../../store';
import PaymentHistory from './Components/PaymentHistory';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useLocation } from 'react-router-dom';

interface Menu {
    type: ManageProfileMenu;
    MenuIcon: any;
    menutext: string;
    component: JSX.Element;
}

const ManageProfilePage = () => {
    const userFullName = useSelector((state: RootState) => {
        return `${state.user.firstName} ${state.user.lastName}`;
    });
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    const menuList: Menu[] = [
        {
            type: ManageProfileMenu.PROFILE,
            MenuIcon: AccountCircleIcon,
            menutext: 'Hồ sơ',
            component: <Profile />,
        },
        {
            type: ManageProfileMenu.AVATAR,
            MenuIcon: ImageIcon,
            menutext: 'Ảnh đại diện',
            component: <UploadAvatar />,
        },
        {
            type: ManageProfileMenu.SECURITY,
            MenuIcon: LockPersonIcon,
            menutext: 'Bảo mật',
            component: <Security />,
        },
        {
            type: ManageProfileMenu.LEARNING_COURSES,
            MenuIcon: FavoriteIcon,
            menutext: 'Khóa học của tôi',
            component: <MyLearningCourse />,
        },
        {
            type: ManageProfileMenu.PAYMENT_HISTORY,
            MenuIcon: AccountBalanceWalletIcon,
            menutext: 'Lịch sử thanh toán',
            component: <PaymentHistory />,
        },
    ];

    const [menuSelected, setMenuSeleted] = useState(menuList[0]);
    
    useEffect(() => {
        if (tab === 'learning-courses') {
            const found = menuList.find(m => m.type === ManageProfileMenu.LEARNING_COURSES);
            if (found) setMenuSeleted(found);
        }
    }, [tab]);

    const StyledMenuItem = styled(MenuItem)({
        '&.MuiListItem-root': {
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '4px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '&:hover': {
            backgroundColor: '#f8fafc',
        },
        '&.Mui-selected': {
            backgroundColor: '#eff6ff',
            color: '#3b82f6',
            fontWeight: 600,
            '&:hover': {
                backgroundColor: '#dbeafe',
            },
            '& .MuiListItemIcon-root': {
                color: '#3b82f6',
            },
        },
        '& .MuiListItemText-primary': {
            fontSize: '14px',
            fontWeight: 500,
        },
    });

    const onMenuSelectEvent = (menu: Menu) => {
        setMenuSeleted(menu);
    };

    const [loginGoogle, setLoginGoogle] = useState(false);
    const [userAvatar, setUserAvatar] = useState('');
    const [userNameGoogle, setUserNameGoogle] = useState('');

    useEffect(() => {
        const userDataString = localStorage.getItem('userLogin');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserAvatar(userData.avatar);
            setUserNameGoogle(userData.name);
            setLoginGoogle(true);
        }
    }, []);

    return (
        <div 
            style={{ 
                background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
                minHeight: '100vh',
                padding: '32px 16px',
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Paper
                    elevation={0}
                    style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '1px solid #e8eaf0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                >
                    <div className="flex flex-col md:flex-row" style={{ minHeight: '80vh' }}>
                        {/* Sidebar */}
                        <div 
                            style={{
                                width: '100%',
                                maxWidth: '280px',
                                background: '#fafbfc',
                                borderRight: '1px solid #e8eaf0',
                                padding: '32px 20px',
                            }}
                            className="md:min-h-full"
                        >
                            {/* User Profile */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                {loginGoogle ? (
                                    <MuiAvatar
                                        src={userAvatar}
                                        alt={userNameGoogle}
                                        style={{
                                            width: '96px',
                                            height: '96px',
                                            margin: '0 auto 16px',
                                            border: '4px solid white',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        }}
                                    />
                                ) : (
                                    <div 
                                        style={{
                                            width: '96px',
                                            height: '96px',
                                            margin: '0 auto 16px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '36px',
                                            color: 'white',
                                            fontWeight: 600,
                                            border: '4px solid white',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                        }}
                                    >
                                        {userFullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <h2 
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        margin: 0,
                                        letterSpacing: '-0.3px',
                                    }}
                                >
                                    {loginGoogle ? userNameGoogle : userFullName}
                                </h2>
                                <p 
                                    style={{
                                        fontSize: '13px',
                                        color: '#64748b',
                                        margin: '4px 0 0',
                                    }}
                                >
                                    Thành viên
                                </p>
                            </div>

                            {/* Menu List */}
                            <MenuList style={{ padding: 0 }}>
                                {menuList.map(({ type, MenuIcon, menutext, component }, index) => {
                                    return (
                                        <StyledMenuItem
                                            onClick={() =>
                                                onMenuSelectEvent({ type, MenuIcon, menutext, component })
                                            }
                                            key={index}
                                            selected={type === menuSelected.type}
                                        >
                                            <ListItemIcon style={{ color: '#64748b', minWidth: '36px' }}>
                                                <MenuIcon style={{ fontSize: '20px' }} />
                                            </ListItemIcon>
                                            <ListItemText>{menutext}</ListItemText>
                                        </StyledMenuItem>
                                    );
                                })}
                            </MenuList>

                            {/* Logout Button */}
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e8eaf0' }}>
                                <Button
                                    onClick={() => {
                                        localStorage.clear();
                                        persistor.purge().then(() => {
                                            window.location.href = '/';
                                        });
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    style={{
                                        borderRadius: '10px',
                                        padding: '10px 16px',
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#64748b',
                                        borderColor: '#e8eaf0',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fef2f2';
                                        e.currentTarget.style.borderColor = '#fecaca';
                                        e.currentTarget.style.color = '#dc2626';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#e8eaf0';
                                        e.currentTarget.style.color = '#64748b';
                                    }}
                                >
                                    Đăng xuất
                                    <LogoutOutlined style={{ marginLeft: '8px', fontSize: '18px' }} />
                                </Button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div 
                            style={{
                                flex: 1,
                                padding: '32px',
                                background: 'white',
                                overflow: 'auto',
                            }}
                        >
                            {/* Content Header */}
                            <div style={{ marginBottom: '32px' }}>
                                <h1 
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        margin: '0 0 8px',
                                        letterSpacing: '-0.5px',
                                    }}
                                >
                                    {menuSelected.menutext}
                                </h1>
                                <p 
                                    style={{
                                        fontSize: '14px',
                                        color: '#64748b',
                                        margin: 0,
                                    }}
                                >
                                    Quản lý thông tin cá nhân của bạn
                                </p>
                            </div>

                            {/* Dynamic Component */}
                            <div>{menuSelected.component}</div>
                        </div>
                    </div>
                </Paper>
            </div>

            {/* Global Styles */}
            <style>{`
                /* Smooth transitions */
                * {
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* Menu hover effect */
                .MuiMenuItem-root {
                    transition: all 0.2s ease !important;
                }

                /* Scrollbar styling */
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                ::-webkit-scrollbar-track {
                    background: #f8fafc;
                }

                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Paper smooth shadow */
                .MuiPaper-root {
                    transition: box-shadow 0.3s ease !important;
                }

                /* Button smooth transitions */
                .MuiButton-root {
                    transition: all 0.2s ease !important;
                }

                /* Remove default focus outline */
                .MuiMenuItem-root:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default ManageProfilePage;