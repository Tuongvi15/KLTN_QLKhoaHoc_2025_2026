
import DefaultLayoutAdmin from '../layouts/adminLayouts/DefaultLayoutAdmin';
import TeacherLayout from '../layouts/teacherLayouts/TeacherLayout';
import AddCourseTeacher from '../pages/TeacherPages/AddCourseTeacher';
import { DefaultLayout } from '../layouts/clientLayouts';
import LoginLayout from '../layouts/clientLayouts/LoginLayout';
import { AddCoursePage, DashboardPage, UpdateCoursePage } from '../pages/AdminPages';
import {
    CourseDetailsPage,
    HomePage,
    LearningCoursePage,
    ManageProfilePage,
} from '../pages/ClientPages';
import LoginPage from '../pages/auth/login/LoginPage';
import RegisterPage from '../pages/auth/login/RegisterPage';
import RegisterTeacherPage from '../pages/auth/login/RegisterTeacherPage';
import NotFoundPage from '../pages/errorPage/NotFoundPage';
import PaymentPage from '../pages/ClientPages/CheckoutPage/PaymentPage';
import GetAllCourse from '../pages/AdminPages/ManageCourse/GetAllCourse/GetAllCourse';
import ViewCourseDetails from '../pages/AdminPages/ManageCourse/ViewCourseDetails/ViewCourseDetails';
import GetAllAccount from '../pages/AdminPages/ManageUser/GetAllAccount/GetAllAccount';
import LearningLayout from '../layouts/clientLayouts/LearningLayout/LearningLayout';
import CreateAccountAdmin from '../pages/AdminPages/ManageUser/CreateAccountForStaffAndAdmin/CreateAccountAdmin';
import { RoleType } from '../slices/authSlice';
import ParentMainPage from '../pages/ParentPages/ParentMainPage/ParentMainPage';
import DefaultParentLayout from '../layouts/parentLayouts/DefaultParentLayout';
import PaymentSuccessPage from '../pages/ClientPages/CheckoutPage/PaymentSuccessPage';
import PaymentFailedPage from '../pages/ClientPages/CheckoutPage/PaymentFailedPage';

import ViewCourseListPage from '../pages/ClientPages/ViewCourseListPage';
import CheckLearningProgress from '../pages/ParentPages/CheckLearningProgess/CheckLearningProgress';
import ParentManageProfilePage from '../pages/ParentPages/ParentManageProfilePage';
import PlacementTestListPage from '../pages/AdminPages/PlacementTest/PlacementTestListPage';
import PlacementQuestionPage from '../pages/AdminPages/PlacementTest/PlacementQuestionPage';
import PlacementTestPage from '../pages/ClientPages/PlacementTestPage/PlacementTestPage';
import PlacementTestStartPage from '../pages/ClientPages/PlacementTestPage/PlacementTestStartPag';
import PlacementHistoryPage from '../pages/ClientPages/PlacementTestPage/PlacementHistoryPage';
import GetAllCourseTeacher from '../pages/TeacherPages/GetAllCourseTeacher';
import UpdateCourseTeacher from '../pages/TeacherPages/UpdateCourseTeacher';
import { SearchPage } from '../pages/ClientPages/SearchPage';
import TeacherDashboard from '../pages/TeacherPages/index';
import ReviewCourseTeacher from '../pages/TeacherPages/ReviewCourseTeacher';
import TeacherBankAccounts from '../pages/TeacherPages/TeacherBankAccounts';
import AdminCourseRevenuePage from '../pages/AdminPages/ManageCourse/CourseRevenue/AdminCourseRevenuePage';
import TeacherRevenuePage from '../pages/TeacherPages/TeacherRevenuePage';
import AdminPayoutPage from '../pages/AdminPages/Payout/AdminPayoutPage';
import TeacherPayoutPage from '../pages/TeacherPages/TeacherPayoutPage';


interface LayoutProps {
    children: React.ReactNode;
    requireRole?: RoleType;
    whenRoleUnMatchNavTo?: string;
}

interface RouteProps {
    path: string;
    component: React.ComponentType<any>;
    layout: ({ children, requireRole, whenRoleUnMatchNavTo }: LayoutProps) => JSX.Element;
}
console.log("🔍 UpdateCourseTeacher mounted!");

const publicRoutes: RouteProps[] = [
    { path: '/', component: HomePage, layout: DefaultLayout },
    { path: '/courses/:id', component: CourseDetailsPage, layout: DefaultLayout },
    { path: '/login', component: LoginPage, layout: LoginLayout },
    { path: '/register', component: RegisterPage, layout: LoginLayout },
    { path: '/register/teacher', component: RegisterTeacherPage, layout: LoginLayout },
    { path: '/search/:id', component: SearchPage, layout: DefaultLayout },
    { path: '/placement-test', component: PlacementTestPage, layout: DefaultLayout },
    { path: '/placement-test/start/:id', component: PlacementTestStartPage, layout: DefaultLayout },
    { path: '/placement-test/history', component: PlacementHistoryPage, layout: DefaultLayout },
    { path: '*', component: NotFoundPage, layout: DefaultLayout },
    { path: '/courses/', component: ViewCourseListPage, layout: DefaultLayout },
];

const privateRoutes: RouteProps[] = [
    { path: '/learn/:id', component: LearningCoursePage, layout: LearningLayout },
    { path: '/user/:id', component: ManageProfilePage, layout: DefaultLayout },
    { path: '/checkout', component: PaymentPage, layout: DefaultLayout },
    { path: '/payment/success', component: PaymentSuccessPage, layout: DefaultLayout },
    { path: '/payment/failed', component: PaymentFailedPage, layout: DefaultLayout },
];


const adminRoutes: RouteProps[] = [
    { path: '/admin/', component: DashboardPage, layout: DefaultLayoutAdmin },
    { path: '/admin/addCourse/', component: AddCoursePage, layout: DefaultLayoutAdmin },
    { path: '/admin/updateCourse/:id', component: UpdateCoursePage, layout: DefaultLayoutAdmin },
    { path: '/admin/getAllCourse/', component: GetAllCourse, layout: DefaultLayoutAdmin },
    {
        path: '/admin/getAllCourse/details/:id',
        component: ViewCourseDetails,
        layout: DefaultLayoutAdmin,
    },
    { path: '/admin/getAllAccount', component: GetAllAccount, layout: DefaultLayoutAdmin },
    { path: '/admin/createAccount', component: CreateAccountAdmin, layout: DefaultLayoutAdmin },
    { path: '/admin/placement-tests', component: PlacementTestListPage, layout: DefaultLayoutAdmin },
    {
        path: '/admin/placement-test/:id/questions',
        component: PlacementQuestionPage,
        layout: DefaultLayoutAdmin
    },
    {
        path: '/admin/course-revenue',
        component: AdminCourseRevenuePage,
        layout: DefaultLayoutAdmin
    },
    {
        path: '/admin/payout',
        component: AdminPayoutPage,
        layout: DefaultLayoutAdmin
    },



];

const parentRoutes: RouteProps[] = [
    { path: '/parent/', component: ParentMainPage, layout: DefaultParentLayout },
    {
        path: '/parent/checkLearningProgress',
        component: CheckLearningProgress,
        layout: DefaultParentLayout,
    },
    {
        path: '/parent/profile',
        component: ParentManageProfilePage,
        layout: DefaultParentLayout,
    },
];

const teacherRoutes: RouteProps[] = [
    { path: '/teacher', component: TeacherDashboard, layout: TeacherLayout },
    { path: '/teacher/dashboard', component: TeacherDashboard, layout: TeacherLayout },
    { path: '/teacher/getAllCourse', component: GetAllCourseTeacher, layout: TeacherLayout }, // ✅ trang mới
    {
        path: '/teacher/viewCourseDetails/:id',
        component: ViewCourseDetails,
        layout: TeacherLayout,
    },
    {
        path: '/teacher/reviewCourse/:id',
        component: ReviewCourseTeacher,
        layout: TeacherLayout,
    },

    { path: '/teacher/addCourse', component: AddCourseTeacher, layout: TeacherLayout },

    {
        path: '/teacher/updateCourse/:id',
        component: UpdateCourseTeacher,
        layout: TeacherLayout,
    },

    {
        path: '/teacher/profile',
        component: ManageProfilePage,
        layout: TeacherLayout,
    },
    {
        path: '/teacher/bank-accounts',
        component: TeacherBankAccounts,
        layout: TeacherLayout
    },
    {
        path: '/teacher/revenue',
        component: TeacherRevenuePage,
        layout: TeacherLayout
    },
    {
        path: '/teacher/payout',
        component: TeacherPayoutPage,
        layout: TeacherLayout
    },

];


const staffRoutes: RouteProps[] = [];

export { publicRoutes, privateRoutes, adminRoutes, staffRoutes, parentRoutes, teacherRoutes };
