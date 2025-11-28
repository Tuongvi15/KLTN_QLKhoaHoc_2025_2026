import {
  PieChartOutlined,
  MenuOutlined,
  DesktopOutlined,
  ExperimentOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import StreetviewOutlinedIcon from '@mui/icons-material/StreetviewOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import { Menu, MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

export default function MySider() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1280);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Cấu hình danh sách menu
  const getConditionalItems = (): MenuItem[] => {
    return [
      getItem('Dashboard', '1', <AnalyticsOutlinedIcon />),
      getItem('Quản lý khóa học', 'sub1', <AppsOutlinedIcon />, [
        getItem('Tất cả khóa học', '3', <PieChartOutlined />),
        getItem('Báo cáo doanh thu', 'courseRevenue', <PieChartOutlined />),
      ]),
      getItem('Quản lý tài khoản', 'sub2', <ManageAccountsOutlinedIcon />, [
        getItem('Xem tất cả tài khoản', 'accountAll', <StreetviewOutlinedIcon />),
        getItem('Duyệt giảng viên', 'approveTeacher', <PersonAddAlt1OutlinedIcon />),
      ]),
      getItem('Chi trả giảng viên', 'subPayout', <WalletOutlined />, [
        getItem('Chi trả giảng viên', 'payout', <WalletOutlined />),
      ]),

      // ✅ Thêm nhóm “Quản lý bài test đầu vào”
      getItem('Quản lý bài test đầu vào', 'sub3', <ExperimentOutlined />, [
        getItem('Bài test đầu vào', 'placementTest', <FileTextOutlined />),
      ]),
    ];
  };

  // ✅ Bản đồ key → URL
  const navUrl = new Map<string, string>();
  navUrl
    .set('1', '/admin/')
    .set('3', '/admin/getAllCourse')
    .set('4', '/admin/addCourse/')
    .set('accountAll', '/admin/getAllAccount')
    .set('createAccount', '/admin/createAccount')
    .set('fieldManager', '/admin/fields')
    .set('placementTest', '/admin/placement-tests')
    .set('courseRevenue', '/admin/course-revenue')
    .set('payout', '/admin/payout')
    .set('approveTeacher', '/admin/approve-teacher');
  ;

  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="overflow-hidden border-r-[1px] h-screen fixed left-0 top-0"
      trigger={
        <div className="w-full border-r-[1px] border-t-[1px]">
          <MenuOutlined />
        </div>
      }
      width={256}
    >

      {/* 🔹 Logo */}
      <div className="demo-logo-vertical border-r-[1px] border-gray-200">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/estudyhub-a1699.appspot.com/o/logo%2Flogo-black-tail.png?alt=media&token=e65f65a8-94a6-4504-a370-730b122ba42e"
          alt="logo"
          className={cn('mx-auto max-w-[199px] py-2', { hidden: collapsed })}
        />
        <img
          src="https://firebasestorage.googleapis.com/v0/b/estudyhub-a1699.appspot.com/o/logo%2Fe-black.png?alt=media&token=a0a401b9-6d20-4597-833c-962457c543ac"
          alt="logo"
          className={cn('mx-auto max-w-[20px] py-2', { hidden: !collapsed })}
        />
      </div>

      {/* 🔹 Menu chính */}
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1', 'sub3']} // mở sẵn 2 menu
        mode="inline"
        items={getConditionalItems()}
        onSelect={(e) => {
          const link = navUrl.get(e.key);
          if (link) {
            navigate(link);
          }
        }}
      />
    </Sider>
  );
}
