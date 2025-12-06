import { Skeleton } from 'antd';
import { Container } from '@mui/material';
import CourseSection from '../../components/CourseSection/CourseSection';
import {
    CourseBanner,
    CourseCardPreview,
    RatingCourseItem,
    RenderRichText,
} from '../../components';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayLessonIcon from '@mui/icons-material/PlayLesson';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import InfoIcon from '@mui/icons-material/Info';
import { FormatType, secondsToTimeString } from '../../utils/TimeFormater';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetCourseIDQuery } from '../../services';
import { Course, Section } from '../../types/Course.type';
import RatingCourseList from "../../components/RatingCourseItem/RatingCourseItem";

const CourseDetailsPage = () => {
    const location = useLocation();
    const [course, setCourse] = useState<Course>();
    const courseId = location.pathname.split('/').pop();
    const { data, isLoading } = useGetCourseIDQuery(courseId ? courseId : '');

    useEffect(() => {
        if (data) setCourse(data);
    }, [data]);

    const handleCalTotalTime = (sections: Section[]) => {
        let totalTimeLession = 0;
        sections.forEach((section) => {
            section?.steps.forEach((step) => {
                totalTimeLession += step?.duration;
            });
        });
        return secondsToTimeString(totalTimeLession, FormatType.HH_MM, ['h', 'm']);
    };

    const handleCalLession = (sections: Section[]) => {
        let totalLession = 0;
        sections.forEach((section) => {
            totalLession += section?.steps?.length;
        });
        return totalLession;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="h-80 bg-gray-100 animate-pulse" />
                <Container maxWidth="lg" className="py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton active paragraph={{ rows: 6 }} />
                            <Skeleton active paragraph={{ rows: 4 }} />
                        </div>
                        <div className="lg:col-span-1">
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <>
            {course && (
                <div className="min-h-screen bg-white">
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        * {
                            font-family: 'Inter', 'Roboto', 'Arial', sans-serif !important;
                        }
                    `}</style>

                    {/* Banner Section */}
                    <div className="bg-gray-900">
                        <CourseBanner isLoading={isLoading} course={course} />
                    </div>

                    {/* Main Content */}
                    <Container maxWidth="lg" className="py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* What You'll Learn */}
                                <section className="border border-gray-200 p-6">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                        Bạn sẽ học được gì?
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {course.knowdledgeDescription
                                            .split('|')
                                            .filter((value) => value.trim().length > 0)
                                            .map((text, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <CheckOutlinedIcon className="text-gray-700 text-base mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">
                                                        {text}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </section>

                                {/* Course Content */}
                                <section>
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                        Nội dung khóa học
                                    </h2>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FolderIcon className="text-base" />
                                            <span>{course?.sections?.length} học phần</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-2">
                                            <PlayLessonIcon className="text-base" />
                                            <span>{handleCalLession(course?.sections)} bài học</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-2">
                                            <AccessTimeIcon className="text-base" />
                                            <span>{handleCalTotalTime(course?.sections)} tổng thời lượng</span>
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div className="border border-gray-200">
                                        <CourseSection
                                            isWrap={false}
                                            active={false}
                                            courseSections={course?.sections}
                                        />
                                    </div>
                                </section>

                                {/* Course Description */}
                                <section>
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                        Mô tả
                                    </h2>
                                    <div className="text-gray-700 prose max-w-none">
                                        <RenderRichText jsonData={course?.description} />
                                    </div>
                                </section>

                                {/* Reviews */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <StarIcon className="text-orange-500 text-3xl" />
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Đánh giá học viên
                                        </h2>
                                    </div>
                                    <RatingCourseList courseId={course.courseId} />
                                </section>
                            </div>

                            {/* Right Column - Course Card */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24">
                                    <CourseCardPreview course={course} />
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            )}
        </>
    );
};

export default CourseDetailsPage;