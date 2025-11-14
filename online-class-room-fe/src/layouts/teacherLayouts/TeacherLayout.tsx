import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  BookOutlined,
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../slices/authSlice';
import { RootState } from '../../store';
import { RoleType } from '../../slices/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface TeacherLayoutProps {
  children: React.ReactNode;
  requireRole?: RoleType;
  whenRoleUnMatchNavTo?: string;
}

const TeacherLayout = ({
  children,
  requireRole,
  whenRoleUnMatchNavTo,
}: TeacherLayoutProps): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = useSelector((state: RootState) => state.auth.currentRole);
  const userName = useSelector((state: RootState) => state.user.firstName) || 'Giảng viên';

  const [collapsed, setCollapsed] = useState(false);

  // Route protection
  if (requireRole && currentRole !== requireRole && whenRoleUnMatchNavTo) {
    navigate(whenRoleUnMatchNavTo);
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/teacher/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/teacher/dashboard">Dashboard</Link>,
    },
    {
      key: '/teacher/getAllCourse',
      icon: <BookOutlined />,
      label: <Link to="/teacher/getAllCourse">Khóa học</Link>,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'divider-1',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafbfc' }}>
      {/* Minimalist Sidebar */}
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#ffffff',
          borderRight: '1px solid #e8eaf0',
          boxShadow: 'none',
        }}
      >
        {/* Logo - Minimalist */}
        <Link to="/teacher/dashboard">
          <div
            style={{
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              borderBottom: '1px solid #e8eaf0',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <BookOutlined style={{ fontSize: 20, color: 'white' }} />
            </div>
            <Text strong style={{ fontSize: 18, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Estudy Platform
            </Text>
          </div>
        </Link>

        {/* Menu - Clean */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '16px 12px',
          }}
          className="minimal-menu"
        />

        {/* Bottom User Info */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #e8eaf0',
            background: '#fafbfc',
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'white',
                border: '1px solid #e8eaf0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f7fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{
                  background: '#3b82f6',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: 13, 
                    color: '#0f172a', 
                    display: 'block',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userName}
                </Text>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 11, 
                    lineHeight: 1.2,
                  }}
                >
                  Giảng viên
                </Text>
              </div>
              <SettingOutlined style={{ fontSize: 14, color: '#64748b' }} />
            </div>
          </Dropdown>
        </div>
      </Sider>

      {/* Main Layout */}
      <Layout 
        style={{ 
          marginLeft: collapsed ? 0 : 240,
          transition: 'margin-left 0.2s',
          background: '#fafbfc',
        }}
      >
        {/* Minimal Header */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            width: '100%',
            background: '#ffffff',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e8eaf0',
            height: 72,
            boxShadow: 'none',
          }}
        >
          {/* Page Title - Simple */}
          <div>
            <Text style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {location.pathname.includes('dashboard') && 'Dashboard'}
              {location.pathname.includes('getAllCourse') && 'Khóa học'}
              {location.pathname.includes('addCourse') && 'Tạo khóa học'}
            </Text>
          </div>

          {/* Right Actions - Minimal */}
          <Space size={8}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f7fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <UserOutlined style={{ fontSize: 18, color: '#475569' }} />
            </div>
          </Space>
        </Header>

        {/* Content - Clean */}
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: 'calc(100vh - 72px)',
            background: '#fafbfc',
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* Minimal Styles */}
      <style>{`
        /* Menu Minimalist */
        .minimal-menu .ant-menu-item {
          margin: 4px 0;
          height: 40px;
          line-height: 40px;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .minimal-menu .ant-menu-item:hover {
          background: #f5f7fa !important;
          color: #0f172a !important;
        }

        .minimal-menu .ant-menu-item-selected {
          background: #eff6ff !important;
          color: #3b82f6 !important;
          font-weight: 600;
        }

        .minimal-menu .ant-menu-item a {
          color: inherit;
        }

        .minimal-menu .ant-menu-item .anticon {
          font-size: 16px;
        }

        /* Scrollbar Minimal */
        .ant-layout-sider-children::-webkit-scrollbar {
          width: 4px;
        }

        .ant-layout-sider-children::-webkit-scrollbar-track {
          background: transparent;
        }

        .ant-layout-sider-children::-webkit-scrollbar-thumb {
          background: #e8eaf0;
          border-radius: 2px;
        }

        .ant-layout-sider-children::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        /* Remove default hover states */
        .ant-menu-item-selected:hover,
        .ant-menu-item-selected::after {
          border: none !important;
        }

        /* Dropdown clean */
        .ant-dropdown {
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Clean transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </Layout>
  );
};

export default TeacherLayout;