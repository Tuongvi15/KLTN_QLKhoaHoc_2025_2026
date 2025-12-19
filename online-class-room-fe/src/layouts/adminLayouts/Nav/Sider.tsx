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
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { useLocation } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExploreIcon from '@mui/icons-material/Explore';

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
        getItem('Tất cả tài khoản', 'accountAll', <StreetviewOutlinedIcon />),
        getItem('Duyệt giảng viên', 'approveTeacher', <PersonAddAlt1OutlinedIcon />),
      ]),
      getItem('Chi trả giảng viên', 'subPayout', <WalletOutlined />, [
        getItem('Chi trả giảng viên', 'payout', <WalletOutlined />),
      ]),

      // ✅ Thêm nhóm “Quản lý bài test đầu vào”
      getItem('Quản lý bài test đầu vào', 'sub3', <ExperimentOutlined />, [
        getItem('Bài test đầu vào', 'placementTest', <FileTextOutlined />),
      ]),

      getItem("Quản lý báo cáo", "reportProblem", <FileTextOutlined />),

    ];
  };
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/admin/getAllAccount") {
      setCollapsed(true);   // ⭐ Tự động thu nhỏ khi vào trang danh sách account
    } else if (location.pathname === "/admin/getAllCourse") {
      setCollapsed(true);   // ⭐ Tự động thu nhỏ khi vào trang danh sách account
    }
  }, [location.pathname]);
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
    .set("reportProblem", "/admin/report-problems")
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
      {/* Logo */}
      <Link to="/" className="flex justify-center items-center">
        <SchoolIcon sx={{ fontSize: 30, color: '#00497cff' }} />
      </Link>


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
