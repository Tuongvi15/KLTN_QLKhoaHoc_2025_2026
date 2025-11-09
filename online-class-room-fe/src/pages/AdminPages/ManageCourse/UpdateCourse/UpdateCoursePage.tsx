import { useEffect } from 'react';
import { useGetCourseIDQuery } from '../../../../services';
import { useDispatch, useSelector } from 'react-redux';
import { CouseMode, setCourseMode, setCourseUpdate } from '../../../../slices/courseSlice';
import { RootState } from '../../../../store';
import CourseContent from '../AddCourse/CourseContent';
import { Skeleton } from 'antd';
import { useLocation } from 'react-router-dom';
import { RoleType } from '../../../../slices/authSlice';

const UpdateCoursePage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const role = useSelector((state: RootState) => state.auth.currentRole);
    const courseMode = useSelector((state: RootState) => state.course.currentMode);
    const courseId = location.pathname.split('/').pop();

    // ✅ Lấy dữ liệu khóa học
    const { currentData, isSuccess, isLoading } = useGetCourseIDQuery(courseId ?? '');

    useEffect(() => {
        if (isSuccess && currentData) {
            dispatch(setCourseUpdate(currentData));
            dispatch(setCourseMode(CouseMode.UPDATE));
        }
    }, [isSuccess, currentData]);

    // ✅ Admin chỉ được xem, không được chỉnh sửa
    const isReadOnly = role === RoleType.ADMIN;

    return (
        <div>
            {!isLoading && courseMode === CouseMode.UPDATE && (
                <CourseContent isReadOnly={isReadOnly} />
            )}
            {isLoading && <Skeleton active />}
        </div>
    );
};

export default UpdateCoursePage;
