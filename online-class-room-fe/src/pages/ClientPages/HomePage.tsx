import { Button, Container } from '@mui/material';
import { CourseTabs } from '../../components';
import { Carousel } from 'antd';
import { useEffect, useState } from 'react';
import { Course } from '../../types/Course.type';
import {
    useGetCoursesBaseRatingQuery,
    useGetCoursesBaseSalesQuery,
    useGetCoursesBaseStudentJoinedQuery,
} from '../../services/course.services';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Star, Zap } from 'lucide-react';

const bannerSlides = [
    {
        image: 'https://assets.hongkiat.com/uploads/skills-working-on-the-web/know-basic-html.jpg',
        title: 'Master Web Development',
        subtitle: 'Công nghệ định hình tương lai',
        description: 'Học HTML, CSS, JavaScript từ cơ bản đến nâng cao. Xây dựng các dự án thực tế cùng các chuyên gia hàng đầu.',
        stats: { students: '50 +', rating: '4.8', courses: '8+' },
        accent: 'from-blue-600 to-cyan-600',
        bgGradient: 'from-blue-100 via-cyan-50 to-blue-50'
    },
    {
        image: 'https://contentstatic.techgig.com/photo/82258796/3-reasons-of-using-javascript-for-machine-learning.jpg?53968',
        title: 'AI & Machine Learning',
        subtitle: 'Công nghệ nhân tạo là tương lai',
        description: 'Kết hợp JavaScript với ML, tạo ra những ứng dụng thông minh. Tổ chức dự án AI từ A-Z với hướng dẫn chi tiết.',
        stats: { students: '80+', rating: '4.9', courses: '11+' },
        accent: 'from-emerald-600 to-teal-600',
        bgGradient: 'from-emerald-100 via-teal-50 to-emerald-50'
    },
];

const HomePage = () => {
    const [topCoursesJoined, setTopCoursesJoined] = useState<Course[] | undefined>([]);
    const [topCoursesRating, setTopCoursesRating] = useState<Course[] | undefined>([]);
    const [topCoursesSales, setTopCoursesSales] = useState<Course[] | undefined>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const {
        data: coursesBaseJoined,
        isFetching: coursesBaseJoinedIsFetching,
        isSuccess: coursesBaseJoinedIsSuccess,
    } = useGetCoursesBaseStudentJoinedQuery(10);

    const {
        data: coursesBaseRating,
        isFetching: coursesBaseRatingIsFetching,
        isSuccess: coursesBaseRatingIsSuccess,
    } = useGetCoursesBaseRatingQuery(10);

    const {
        data: coursesBaseSales,
        isFetching: coursesBaseSalesIsFetching,
        isSuccess: coursesBaseSalesIsSuccess,
    } = useGetCoursesBaseSalesQuery(10);

    useEffect(() => {
        if (coursesBaseJoinedIsSuccess) {
            setTopCoursesJoined(coursesBaseJoined);
        }
    }, [coursesBaseJoinedIsSuccess]);

    useEffect(() => {
        if (coursesBaseRatingIsSuccess) {
            setTopCoursesRating(coursesBaseRating);
        }
    }, [coursesBaseRatingIsSuccess]);

    useEffect(() => {
        if (coursesBaseSalesIsSuccess) {
            setTopCoursesSales(coursesBaseSales);
        }
    }, [coursesBaseSalesIsSuccess]);

    const slide = bannerSlides[currentSlide];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                * {
                    font-family: 'Be Vietnam Pro', 'Roboto', 'Arial', sans-serif !important;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-slide-left {
                    animation: slideInLeft 0.8s ease-out forwards;
                }
                .animate-slide-right {
                    animation: slideInRight 0.8s ease-out forwards;
                }
                .animate-fade-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.6s ease-out forwards;
                }
                .hover-lift {
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }
                .stat-box {
                    transition: all 0.3s ease;
                }
                .stat-box:hover {
                    transform: translateY(-4px);
                }
            `}</style>

            {/* Hero Section */}
            <section className={`relative overflow-hidden pt-12 pb-16 bg-gradient-to-br ${slide.bgGradient}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <Container maxWidth="xl" className="relative">
                    <Carousel
                        autoplay
                        autoplaySpeed={7000}
                        effect="fade"
                        dotPosition="bottom"
                        beforeChange={(_, next) => setCurrentSlide(next)}
                    >
                        {bannerSlides.map((slide, index) => (
                            <div key={index}>
                                <div className="grid lg:grid-cols-2 gap-12 items-center py-8">
                                    {/* Content */}
                                    <div className="space-y-8 animate-slide-left">
                                        <div className="space-y-6">
                                            <div className="inline-block">
                                                <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest bg-blue-100 px-4 py-2 rounded-full">
                                                    {slide.subtitle}
                                                </span>
                                            </div>

                                            <h1 className="text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                                                {slide.title}
                                            </h1>

                                            <p className="text-xl text-gray-700 leading-relaxed max-w-xl font-medium">
                                                {slide.description}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-8 pt-6 flex-wrap">
                                            <div className="stat-box border-l-4 border-blue-600 pl-6 bg-blue-50/50 pr-6 py-4 rounded-lg">
                                                <div className="text-4xl font-black text-blue-600">{slide.stats.students}</div>
                                                <div className="text-sm text-gray-600 font-semibold mt-2">Học viên</div>
                                            </div>
                                            <div className="stat-box border-l-4 border-amber-500 pl-6 bg-amber-50/50 pr-6 py-4 rounded-lg">
                                                <div className="text-4xl font-black text-amber-600">{slide.stats.rating}/5</div>
                                                <div className="text-sm text-gray-600 font-semibold mt-2">Đánh giá</div>
                                            </div>
                                            <div className="stat-box border-l-4 border-emerald-600 pl-6 bg-emerald-50/50 pr-6 py-4 rounded-lg">
                                                <div className="text-4xl font-black text-emerald-600">{slide.stats.courses}</div>
                                                <div className="text-sm text-gray-600 font-semibold mt-2">Khóa học</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className="relative group animate-slide-right">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} rounded-2xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-float`}></div>
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="relative w-full h-[500px] object-cover rounded-2xl shadow-2xl group-hover:shadow-none transition-all duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </Container>
            </section>

            {/* Popular Courses */}
            <section className="relative py-24 bg-gradient-to-b from-white via-blue-50 to-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full filter blur-3xl"></div>
                <Container maxWidth="xl" className="relative">
                    <div className="mb-16 animate-fade-up">
                        <div className="inline-flex items-center gap-3 mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-full shadow-lg">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Đang hot</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
                            Khóa học nổi bật
                        </h2>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl">
                            Được <span className="text-blue-600 font-bold">5,000+ học viên</span> lựa chọn mỗi tháng
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 lg:p-12 backdrop-blur-lg bg-opacity-80">
                        <CourseTabs
                            isLoading={coursesBaseJoinedIsFetching}
                            tabsTitle=""
                            courseList={topCoursesJoined}
                        />
                    </div>
                </Container>
            </section>

            {/* Highly Rated */}
            <section className="relative py-24 bg-gradient-to-b from-white via-emerald-50 to-white">
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full filter blur-3xl"></div>
                <Container maxWidth="xl" className="relative">
                    <div className="mb-16 animate-fade-up">
                        <div className="inline-flex items-center gap-3 mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full shadow-lg">
                            <Star className="w-4 h-4 fill-white" />
                            <span className="text-sm font-bold uppercase tracking-wider">Top rated</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
                            Chất lượng đỉnh cao
                        </h2>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl">
                            Đạt trung bình <span className="text-emerald-600 font-bold">4.9/5 sao</span> từ cộng đồng học viên
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 lg:p-12 backdrop-blur-lg bg-opacity-80">
                        <CourseTabs
                            isLoading={coursesBaseRatingIsFetching}
                            tabsTitle=""
                            courseList={topCoursesRating}
                        />
                    </div>
                </Container>
            </section>

            {/* Best Deals */}
            <section className="relative py-24 bg-gradient-to-b from-white via-amber-50 to-white">
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-300/10 rounded-full filter blur-3xl"></div>
                <Container maxWidth="xl" className="relative">
                    <div className="mb-16 animate-fade-up">
                        <div className="inline-flex items-center gap-3 mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full shadow-lg">
                            <Zap className="w-4 h-4 fill-white" />
                            <span className="text-sm font-bold uppercase tracking-wider">Flash sale</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
                            Ưu đãi đặc biệt
                        </h2>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl">
                            Giảm giá <span className="text-amber-600 font-bold">lên đến 50%</span> cho các khóa học premium
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 lg:p-12 backdrop-blur-lg bg-opacity-80">
                        <CourseTabs
                            isLoading={coursesBaseSalesIsFetching}
                            tabsTitle=""
                            courseList={topCoursesSales}
                        />
                    </div>
                </Container>
            </section>

            <section className="relative overflow-hidden py-32 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
                <div className="absolute inset-0 opacity-15">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <Container maxWidth="lg" className="relative">
                    <div className="text-center space-y-6 max-w-5xl mx-auto px-6">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight animate-fade-up break-words">
                            Sẵn sàng nâng tầm kỹ&nbsp;năng?
                        </h2>
                        <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed font-medium animate-fade-up max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}>
                            Hàng nghìn khóa học từ các chuyên gia hàng đầu đang chờ bạn. Bắt đầu hôm nay và thay đổi sự nghiệp của bạn.
                        </p>

                        <div className="pt-6 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                            <Link to="/courses/">
                                <Button
                                    endIcon={<ChevronRight size={24} />}
                                    className="!bg-gradient-to-r !from-blue-400 !to-cyan-400 !text-gray-900 !px-12 !py-4 !text-lg !font-black !rounded-xl hover:!from-blue-300 hover:!to-cyan-300 !transition-all !duration-300 !shadow-2xl hover:!shadow-blue-500/50 hover:!scale-110"
                                >
                                    Khám phá ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default HomePage;