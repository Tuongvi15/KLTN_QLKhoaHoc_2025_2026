// src/pages/TeacherDashboard/hooks/useTeacherDashboard.ts
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  useGetCoursesByTeacherQuery,
  useGetStudentsInMyCoursesQuery,
} from "../../../services/course.services";

export const useTeacherDashboard = () => {
  const teacherId = useSelector((s: RootState) => s.user.id);

  const {
    data: courses = [],
    isLoading: loadingCourses
  } = useGetCoursesByTeacherQuery(teacherId!, {
    skip: !teacherId,
  });

  const courseIds = useMemo(() => courses.map(c => c.courseId), [courses]);

  const {
    data: studentsPerCourse = [],
    isLoading: loadingStudents
  } = useGetStudentsInMyCoursesQuery(
    { courseIds, teacherId },
    { skip: courseIds.length === 0 }
  );

  const loading = loadingCourses || loadingStudents;

  return { courses, studentsPerCourse, loading };
};
