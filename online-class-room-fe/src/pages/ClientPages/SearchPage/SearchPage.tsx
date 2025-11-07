import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAllCoursesQuery } from '../../../services/course.services';
import { Course } from '../../../types/Course.type';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
    const navigate = useNavigate();
    const { id: searchTerm } = useParams<{ id: string }>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const {
        data: fetchedCourses,
        isLoading,
        error,
    } = useGetAllCoursesQuery({
        pageNumber: currentPage,
        pageSize: 8,
        search: searchTerm || '',
    });

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Component cho trạng thái không tìm thấy kết quả
    const NoResultsFound = () => (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                {/* Icon tìm kiếm */}
                <div className="mx-auto mb-6 w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Tiêu đề */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Không tìm thấy khóa học
                </h2>

                {/* Mô tả */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Không tìm thấy khóa học nào phù hợp với từ khóa
                    <span className="font-medium text-gray-800"> "{searchTerm}"</span>
                </p>

                {/* Gợi ý */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">Gợi ý tìm kiếm:</h3>
                    <ul className="text-sm text-blue-700 text-left space-y-1">
                        <li>• Kiểm tra lại chính tả của từ khóa</li>
                        <li>• Thử sử dụng từ khóa ngắn gọn hơn</li>
                        <li>• Sử dụng từ đồng nghĩa hoặc từ khóa liên quan</li>
                        <li>• Thử tìm kiếm theo danh mục thay vì tên cụ thể</li>
                    </ul>
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        Về trang chủ
                    </button>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                    >
                        Xem tất cả khóa học
                    </button>
                </div>
            </div>
        </div>
    );

    // Component cho trạng thái loading
    const LoadingState = () => (
        <div className="flex items-center justify-center py-16">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Đang tìm kiếm khóa học...</p>
            </div>
        </div>
    );

    if (isLoading) return <LoadingState />;

    if (error || (fetchedCourses && fetchedCourses.courses.length === 0)) {
        return <NoResultsFound />;
    }

    return (
        <div>
            {/* Header kết quả tìm kiếm */}
            <div className="px-4 py-6 border-b bg-gray-50">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Kết quả tìm kiếm cho: "{searchTerm}"
                </h1>
                <p className="text-gray-600 mt-1">
                    Tìm thấy {fetchedCourses?.totalCourses || 0} khóa học
                </p>
            </div>

            {/* Grid khóa học */}
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {fetchedCourses?.courses.map((course: Course) => (
                    <div
                        key={course.courseId}
                        className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => navigate(`/courses/${course.courseId}`)}
                    >
                        <div className="relative">
                            <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="h-48 w-full object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-medium">
                                {Math.round(course.totalDuration / 60)} phút
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                {course.title}
                            </h3>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-blue-600">
                                    {course.price.toLocaleString()} VND
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Cập nhật: {new Date(course.updateAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {fetchedCourses && fetchedCourses.totalPages > 1 && (
                <div className="px-6 pb-8">
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Trước
                        </button>

                        {Array.from({ length: fetchedCourses.totalPages }, (_, i) => i + 1).map(
                            (page) => (
                                <button
                                    key={page}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${page === currentPage
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                                        }`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>

                            ),
                        )}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === fetchedCourses.totalPages}
                            className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;