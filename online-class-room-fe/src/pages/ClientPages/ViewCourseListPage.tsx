import { Checkbox, Select, Tag, Typography, Card, Badge, Empty, Button } from 'antd';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import CategoryIcon from '@mui/icons-material/Category';
import { DefaultOptionType } from 'antd/es/select';
import { useGetCourselistPaginationQuery } from '../../services/course.services';
import { useEffect, useState } from 'react';
import { CourselistPaginationRequest, CourselistPaginationRespone } from '../../types/Course.type';
import { formatNumberWithCommas } from '../../utils/NumberFormater';
import moment from 'moment/min/moment-with-locales';
import { FormatType, secondsToTimeString } from '../../utils/TimeFormater';
import { Link } from 'react-router-dom';
import { useGetCategoryQuery } from '../../services/categoryService';

const options: DefaultOptionType[] = [
    { label: 'Mới nhất', value: 'Mới nhất' },
    { label: 'Phổ biến', value: 'Phổ biến' },
    { label: 'Đánh giá cao', value: 'Đánh giá cao' },
];

const ViewCourseListPage = () => {
    const [courselistPaginationRequest, setCourselistPaginationRequest] =
        useState<CourselistPaginationRequest>({});
    const [coursesRepsone, setCoursesRespone] = useState<CourselistPaginationRespone>();
    const [category, setCategory] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('Mới nhất');

    const { data, isSuccess, isLoading, refetch } = useGetCourselistPaginationQuery(
        courselistPaginationRequest,
    );
    const { data: categoryData } = useGetCategoryQuery();

    useEffect(() => {
        if (isSuccess && data) {
            setCoursesRespone(data);
        }
    }, [isSuccess, data]);

    const handleOnCategoryChange = (checkedValue: number[]) => {
        setCategory(checkedValue);
    };

    const onFilterClick = () => {
        setCourselistPaginationRequest({ categoryIds: category.length > 0 ? category : undefined });
        setCurrentPage(1);
        refetch();
    };

    // Helper function để tính giá sale
    const calculateSalePrice = (price: number, salesCampaign?: number) => {
        if (salesCampaign && salesCampaign > 0) {
            return Math.round(price * (1 - salesCampaign));
        }
        return price;
    };

    const filteredCourses = coursesRepsone?.courses.filter((course) => course.isPublic) || [];
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <Typography.Title level={2} className="!mb-2 !text-gray-800">
                        Tất cả khóa học
                    </Typography.Title>
                    <p className="text-gray-600">
                        Khám phá {filteredCourses.length} khóa học chất lượng cao
                    </p>
                </div>

                {/* Sort Bar */}
                <div className="mb-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        <FilterListIcon className="text-blue-600" />
                        <span className="font-semibold">Sắp xếp theo:</span>
                    </div>
                    <Select
                        value={sortBy}
                        onChange={setSortBy}
                        options={options}
                        className="!w-[180px]"
                    />
                </div>

                <div className="flex gap-6">
                    {/* Sidebar Filter */}
                    <div className="w-72 shrink-0">
                        <div className="sticky top-4 rounded-xl bg-white p-6 shadow-md">
                            <div className="mb-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <CategoryIcon className="text-blue-600" />
                                    <Typography.Title level={4} className="!mb-0">
                                        Thể loại
                                    </Typography.Title>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    <Checkbox.Group
                                        className="flex flex-col gap-3"
                                        options={categoryData?.map((category) => ({
                                            label: (
                                                <span className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                                    {category.name}
                                                </span>
                                            ),
                                            value: category.catgoryId,
                                        }))}
                                        onChange={handleOnCategoryChange}
                                        value={category}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={onFilterClick}
                                type="primary"
                                size="large"
                                block
                                className="!h-12 !bg-gradient-to-r !from-blue-600 !to-blue-700 !font-semibold !shadow-lg"
                            >
                                Áp dụng bộ lọc
                            </Button>

                            {category.length > 0 && (
                                <Button
                                    onClick={() => {
                                        setCategory([]);
                                        setCourselistPaginationRequest({});
                                        refetch();
                                    }}
                                    type="link"
                                    block
                                    className="!mt-2 !text-gray-600"
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Course List */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} loading className="!shadow-md" />
                                ))}
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <Card className="!shadow-md">
                                <Empty description="Không tìm thấy khóa học nào" />
                            </Card>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {paginatedCourses.map((course, index) => {
                                        const hasSale = course.salesCampaign && course.salesCampaign > 0;
                                        const salePrice = calculateSalePrice(course.price, course.salesCampaign);
                                        const discountPercent = hasSale ? Math.round((course.salesCampaign || 0) * 100) : 0;

                                        return (
                                            <Link
                                                key={index}
                                                to={'/courses/' + course.courseId}
                                                className="block"
                                            >
                                                <Card
                                                    hoverable
                                                    className="!overflow-hidden !shadow-lg !transition-all !duration-300 hover:!shadow-2xl hover:!-translate-y-1 !border-0"
                                                >
                                                    <div className="flex gap-6">
                                                        {/* Course Image */}
                                                        <div className="relative h-[200px] w-[320px] shrink-0 overflow-hidden rounded-xl">
                                                            <img
                                                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                                                                src={course.imageUrl}
                                                                alt={course.title}
                                                            />
                                                            {hasSale && (
                                                                <div className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1.5 font-bold text-white shadow-lg">
                                                                    -{discountPercent}%
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                        </div>

                                                        {/* Course Info */}
                                                        <div className="flex flex-1 flex-col justify-between py-2">
                                                            <div>
                                                                {/* Title */}
                                                                <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-800 transition-colors hover:text-blue-600">
                                                                    {course.title}
                                                                </h3>

                                                                {/* Instructor */}
                                                                {course.accountName && (
                                                                    <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-600">
                                                                        <span className="text-xs font-semibold uppercase tracking-wide">GIẢNG DẠY BỞI:</span>
                                                                        <span className="font-bold text-gray-800">{course.accountName}</span>
                                                                    </p>
                                                                )}

                                                                {/* Categories */}
                                                                <div className="mb-3 flex flex-wrap gap-2">
                                                                    {course.courseCategory
                                                                        .split(',')
                                                                        .slice(0, 3)
                                                                        .map((value, idx) => (
                                                                            <Tag
                                                                                key={idx}
                                                                                color="blue"
                                                                                className="!m-0 !rounded-full !border-0 !px-3 !py-1 !text-xs"
                                                                            >
                                                                                {value.trim()}
                                                                            </Tag>
                                                                        ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-end justify-between">
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <UpdateIcon className="!text-base text-blue-500" />
                                                                        <span>
                                                                            {moment(course.updateAt)
                                                                                .locale('vi')
                                                                                .format('DD/MM/YYYY')}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <AccessTimeIcon className="!text-base text-green-500" />
                                                                        <span>
                                                                            {secondsToTimeString(
                                                                                course.totalDuration,
                                                                                FormatType.HH_MM,
                                                                                [' Giờ', ' Phút'],
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Price Box */}
                                                                <div className="shrink-0 text-right">
                                                                    {hasSale ? (
                                                                        <>
                                                                            <div className="mb-1 text-2xl font-bold text-orange-600">
                                                                                {formatNumberWithCommas(salePrice)} ₫
                                                                            </div>
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <span className="text-sm text-gray-400 line-through">
                                                                                    {formatNumberWithCommas(course.price)} ₫
                                                                                </span>
                                                                                <Badge 
                                                                                    count={`-${discountPercent}%`}
                                                                                    className="[&_.ant-badge-count]:!bg-red-500 [&_.ant-badge-count]:!text-xs [&_.ant-badge-count]:!font-bold [&_.ant-badge-count]:!px-2"
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-2xl font-bold text-blue-600">
                                                                            {formatNumberWithCommas(course.price)} ₫
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-3">
                                        {/* Nút Trước */}
                                        <Button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            className="!min-w-[90px] !h-[38px] !rounded-md font-medium"
                                            type="default"
                                        >
                                            ← Trước
                                        </Button>

                                        {/* Danh sách số trang */}
                                        <div className="flex items-center gap-2">
                                            {[...Array(totalPages)].map((_, idx) => {
                                                const pageNumber = idx + 1;
                                                const isActive = currentPage === pageNumber;

                                                return (
                                                    <Button
                                                        key={pageNumber}
                                                        type={isActive ? "primary" : "default"}
                                                        onClick={() => setCurrentPage(pageNumber)}
                                                        className={`!min-w-[40px] !h-[38px] !rounded-md font-medium transition-all duration-200
                                                            ${isActive ? "!bg-blue-600 !border-blue-600 !text-white shadow-sm" : "!bg-white !text-gray-800 hover:!bg-gray-100"}
                                                        `}
                                                    >
                                                        {pageNumber}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        {/* Nút Sau */}
                                        <Button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            className="!min-w-[90px] !h-[38px] !rounded-md font-medium"
                                            type="default"
                                        >
                                            Sau →
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCourseListPage;