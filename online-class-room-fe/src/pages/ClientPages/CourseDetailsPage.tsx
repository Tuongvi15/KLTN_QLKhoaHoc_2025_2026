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
import SchoolIcon from '@mui/icons-material/School';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                <Container maxWidth="xl" className="py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton active paragraph={{ rows: 6 }} />
                            <Skeleton active paragraph={{ rows: 4 }} />
                            <Skeleton active paragraph={{ rows: 8 }} />
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
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
                    <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                * {
                    font-family: 'Be Vietnam Pro', 'Roboto', 'Arial', sans-serif !important;
                }

            `}</style>
                    {/* Enhanced Banner Section */}
                    <div className="relative overflow-hidden">
                        <CourseBanner isLoading={isLoading} course={course} />

                        {/* Floating Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full filter blur-3xl animate-pulse" />
                            <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <Container maxWidth="xl" className="relative py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Column - Main Content */}
                            <div className="lg:col-span-2 space-y-12">
                                {/* What You'll Learn Section */}
                                <section className="relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />

                                    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-green-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-blue-100/50 rounded-full transform translate-x-16 -translate-y-16" />

                                        <div className="relative z-10">
                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mr-4">
                                                    <SchoolIcon className="text-white text-xl" />
                                                </div>
                                                <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                                    Bạn sẽ học được gì?
                                                </h2>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {course.knowdledgeDescription
                                                    .split('|')
                                                    .filter((value) => value.trim().length > 0)
                                                    .map((text, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-all duration-300 group"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                                                                <CheckOutlinedIcon className="text-white text-sm" />
                                                            </div>
                                                            <span className="text-gray-700 font-medium leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                                                                {text}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Course Content Section */}
                                <section className="relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />

                                    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-purple-100 relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full transform -translate-x-20 translate-y-20" />

                                        <div className="relative z-10">
                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                                                    <FolderIcon className="text-white text-xl" />
                                                </div>
                                                <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                    Nội dung khóa học
                                                </h2>
                                            </div>

                                            {/* Course Stats */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center group hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                                        <FolderIcon className="text-white" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                                        {course?.sections?.length}
                                                    </div>
                                                    <div className="text-sm text-gray-600 font-medium">Học phần</div>
                                                </div>

                                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center group hover:from-emerald-100 hover:to-teal-100 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                                        <PlayLessonIcon className="text-white" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                                                        {handleCalLession(course?.sections)}
                                                    </div>
                                                    <div className="text-sm text-gray-600 font-medium">Bài học</div>
                                                </div>

                                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center group hover:from-orange-100 hover:to-red-100 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                                        <AccessTimeIcon className="text-white" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-orange-600 mb-1">
                                                        {handleCalTotalTime(course?.sections)}
                                                    </div>
                                                    <div className="text-sm text-gray-600 font-medium">Thời gian</div>
                                                </div>
                                            </div>

                                            {/* Course Sections */}
                                            <div className="bg-gray-50 rounded-2xl p-6">
                                                <CourseSection
                                                    isWrap={false}
                                                    active={false}
                                                    courseSections={course?.sections}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Course Details Section */}
                                <section className="relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />

                                    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-cyan-100 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-36 h-36 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-full transform -translate-x-18 -translate-y-18" />

                                        <div className="relative z-10">
                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-4">
                                                    <InfoIcon className="text-white text-xl" />
                                                </div>
                                                <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                                    Chi tiết khóa học
                                                </h2>
                                            </div>

                                            <div className="prose prose-lg max-w-none">
                                                <RenderRichText jsonData={course?.description} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Reviews Section */}
                                {/* Reviews Section */}
                                <section className="relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />

                                    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-yellow-100 relative overflow-hidden">
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100/50 to-orange-100/50 rounded-full transform translate-x-16 translate-y-16" />

                                        <div className="relative z-10">
                                            <div className="flex items-center mb-8">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mr-4">
                                                    <StarIcon className="text-white text-xl" />
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                                        Đánh giá học viên
                                                    </h2>
                                                </div>
                                            </div>

                                            {/* ⭐ HIỂN THỊ DANH SÁCH ĐÁNH GIÁ THẬT */}
                                            <RatingCourseList courseId={course.courseId} />
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* Right Column - Course Preview Card */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24">
                                    <div className="transform hover:scale-105 transition-transform duration-500">
                                        <CourseCardPreview course={course} />
                                    </div>

                                    {/* Additional Info Cards */}
                                    <div className="mt-8 space-y-6">
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                            <h3 className="font-bold text-green-700 mb-3 flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center mr-3">
                                                    <CheckOutlinedIcon className="text-white text-sm" />
                                                </div>
                                                Cam kết chất lượng
                                            </h3>
                                            <ul className="text-sm text-green-600 space-y-2">
                                                <li>• Hoàn tiền 100% nếu không hài lòng</li>
                                                <li>• Truy cập trọn đời</li>
                                                <li>• Cập nhật nội dung miễn phí</li>
                                                <li>• Hỗ trợ 24/7</li>
                                            </ul>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                            <h3 className="font-bold text-blue-700 mb-3">📱 Học mọi lúc, mọi nơi</h3>
                                            <p className="text-sm text-blue-600">
                                                Truy cập trên máy tính, điện thoại và tablet.
                                                Tải xuống để học offline.
                                            </p>
                                        </div>
                                    </div>
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