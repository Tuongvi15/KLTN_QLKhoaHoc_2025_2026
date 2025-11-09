import React from 'react';
import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../slices/authSlice';
import { RootState } from '../../store';
import { RoleType } from '../../slices/authSlice';

const { Header, Sider, Content } = Layout;

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
  const currentRole = useSelector((state: RootState) => state.auth.currentRole);

  // ✅ Bảo vệ route: nếu không đúng role, điều hướng ra ngoài
  if (requireRole && currentRole !== requireRole && whenRoleUnMatchNavTo) {
    navigate(whenRoleUnMatchNavTo);
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const menuItems = [
    // {
    //   key: '1',
    //   icon: <DashboardOutlined />,
    //   label: <Link to="/teacher/dashboard">Bảng điều khiển</Link>,
    // },
    {
      key: '2',
      icon: <BookOutlined />,
      label: <Link to="/teacher/getAllCourse">Quản lý khóa học</Link>,
    },

    {
      key: '4',
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          TEACHER
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>

      {/* Header + Content */}
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          Teacher Dashboard
        </Header>

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              background: '#fff',
              minHeight: 360,
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
