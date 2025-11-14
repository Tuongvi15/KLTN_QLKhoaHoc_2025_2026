import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetCourseIDQuery } from '../../services/course.services';
import { setCourseUpdate, CouseMode, setCourseMode } from '../../slices/courseSlice';
import { Skeleton } from 'antd';
import Curriculum from './Curriculum'; // <--- path relative to this file

export default function UpdateCourseTeacher() {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const { data, isSuccess, isLoading } = useGetCourseIDQuery(id ?? '');

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCourseUpdate(data));
      dispatch(setCourseMode(CouseMode.UPDATE));
    }
  }, [isSuccess, data, dispatch]);

  if (isLoading) return <Skeleton active />;

  // Render only Curriculum (Teacher editor)
  return <Curriculum />;
}
