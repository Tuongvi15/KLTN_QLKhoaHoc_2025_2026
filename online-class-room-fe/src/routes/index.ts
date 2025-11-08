import DefaultLayoutAdmin from '../layouts/adminLayouts/DefaultLayoutAdmin';
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
import { SearchPage } from '../pages/ClientPages/SearchPage';
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
import FieldManager from '../pages/AdminPages/PlacementTest/FieldManager';
import PlacementQuestionPage from '../pages/AdminPages/PlacementTest/PlacementQuestionPage';

interface LayoutProps {
    children: React.ReactNode;
    requireRole?: RoleType;
    whenRoleUnMatchNavTo?: string;
}

interface RouteProps {
    path: string;
    component: () => JSX.Element;
    layout: ({ children, requireRole, whenRoleUnMatchNavTo }: LayoutProps) => JSX.Element;
}

const publicRoutes: RouteProps[] = [
    { path: '/', component: HomePage, layout: DefaultLayout },
    { path: '/courses/:id', component: CourseDetailsPage, layout: DefaultLayout },
    { path: '/login', component: LoginPage, layout: LoginLayout },
    { path: '/register', component: RegisterPage, layout: LoginLayout },
    { path: '/register/teacher', component: RegisterTeacherPage, layout: LoginLayout },
    { path: '/search/:id', component: SearchPage, layout: DefaultLayout },
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
    { path: '/admin/fields', component: FieldManager, layout: DefaultLayoutAdmin },
    {
        path: '/admin/placement-test/:id/questions',
        component: PlacementQuestionPage,
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

const staffRoutes: RouteProps[] = [];

export { publicRoutes, privateRoutes, adminRoutes, staffRoutes, parentRoutes };
