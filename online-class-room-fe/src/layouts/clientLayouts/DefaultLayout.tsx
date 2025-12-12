import { useSelector } from 'react-redux';
import { Footer, Header } from '.';
import { ChatBox } from '../../components';
import { RoleType } from '../../slices/authSlice';
import { RootState } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';

export interface DefaultLayoutProps {
    children: React.ReactNode;
    requireRole?: RoleType;
    whenRoleUnMatchNavTo?: string;
    hideLayout?: boolean;
}

const DefaultLayout = ({ children, requireRole, whenRoleUnMatchNavTo }: DefaultLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentRole = useSelector((state: RootState) => state.auth.currentRole);

    // ✅ Check role logic giữ nguyên
    if (currentRole && currentRole !== requireRole && whenRoleUnMatchNavTo) {
        navigate(whenRoleUnMatchNavTo);
    }

    // ✅ Ẩn Header/Footer nếu là trang làm bài test
    const isPlacementTestPage = location.pathname.startsWith('/placement-test/start');
    const isLearningPage = location.pathname.startsWith('/learn/');
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            {!isPlacementTestPage && !isLearningPage && <Header />}

            {/* Main */}
            <main className={`${isPlacementTestPage || isLearningPage ? '' : 'mt-4 py-4 flex-1'}`}>
                {children}
            </main>

            {/* Footer */}
            {!isPlacementTestPage && !isLearningPage && <Footer />}

            {/* Chat */}
            {!isPlacementTestPage && !isLearningPage && <ChatBox />}
        </div>
    );

};

export default DefaultLayout;
