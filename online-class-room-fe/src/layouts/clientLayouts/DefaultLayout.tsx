import { useSelector } from 'react-redux';
import { Footer, Header } from '.';
import { RoleType } from '../../slices/authSlice';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
export interface DefaultLayoutProps {
    children : React.ReactNode;
    requireRole?: RoleType;
    whenRoleUnMatchNavTo?: string;
}

const DefaultLayout = ({ children , requireRole, whenRoleUnMatchNavTo }: DefaultLayoutProps) => {
    const navigate = useNavigate();
    const currentRole = useSelector((state: RootState) => state.auth.currentRole);
    if (currentRole && currentRole != requireRole && whenRoleUnMatchNavTo) {
        navigate(whenRoleUnMatchNavTo);
    }
    return (
        <div>
            <Header />
            <div className="mt-4 py-4">{children }</div>
            <Footer />
        </div>
    );
};

export default DefaultLayout;
