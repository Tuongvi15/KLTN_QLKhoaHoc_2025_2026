import { useNavigate } from 'react-router-dom';
import { RoleType } from '../../../slices/authSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

export interface LearningLayoutProps {
    children: React.ReactNode;
    requireRole?: RoleType;
    whenRoleUnMatchNavTo?: string;
}

const LearningLayout = ({ children, requireRole, whenRoleUnMatchNavTo }: LearningLayoutProps) => {
    const navigate = useNavigate();
    const currentRole = useSelector((state: RootState) => state.auth.currentRole);

    if (currentRole && currentRole !== requireRole && whenRoleUnMatchNavTo) {
        navigate(whenRoleUnMatchNavTo);
    }

    return (
        <div className="min-h-screen bg-[#f7f9fa]">
            {children}
        </div>
    );
};

export default LearningLayout;
