import { useEffect, useState } from 'react';
import { Button, Tag, Typography, Card, Image, Space, Descriptions, Row, Col, Divider } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useGetCourseIDQuery } from '../../../../services';
import { Course, Section } from '../../../../types/Course.type';
import { FormatType, secondsToTimeString } from '../../../../utils/TimeFormater';
import { formatNumberWithCommas } from '../../../../utils/NumberFormater';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { RoleType } from '../../../../slices/authSlice';
import {
    EyeOutlined,
    EditOutlined,
    ClockCircleOutlined,
    BookOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    GlobalOutlined,
    PoweroffOutlined
} from "@ant-design/icons";

const ViewCourseDetails = () => {
    const { Title, Text, Paragraph } = Typography;
    const [courseId, setCourseId] = useState('');
    const location = useLocation();
    const role = useSelector((state: RootState) => state.auth.currentRole);
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        const getCourseId = location.pathname.split('/').pop();
        if (getCourseId) {
            setCourseId(getCourseId);
        }
    }, []);

    const { data, isSuccess } = useGetCourseIDQuery(courseId);

    useEffect(() => {
        if (data) setCourse(data);
    }, [isSuccess, data]);

    const formattedTime = secondsToTimeString(course?.totalDuration, FormatType.HH_MM, ['h', 'm']);

    const handleCalLession = (sections: Section[]) => {
        let totalLession = 0;
        sections?.forEach((section) => {
            totalLession += section?.steps?.length || 0;
        });
        return totalLession;
    };

    const getDescriptionText = () => {
        try {
            const descObj = JSON.parse(course?.description || '{}');
            return descObj.blocks?.map((b: any) => b.text).join(' ') || '';
        } catch {
            return course?.description || '';
        }
    };

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    const totalSections = course?.sections?.length || 0;
    const totalLessons = handleCalLession(course?.sections || []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Title level={2} className="mb-1 text-gray-800">
                        Chi tiết khóa học
                    </Title>
                    <Text type="secondary">Thông tin chi tiết về khóa học</Text>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Sidebar */}
                    <Col xs={24} lg={8}>
                        <div className="space-y-4">
                            {/* Image Card */}
                            <Card className="shadow-sm">
                                <div className="relative">
                                    <Image
                                        src={course?.imageUrl}
                                        alt={course?.title}
                                        className="rounded-lg w-full"
                                        style={{ height: '240px', objectFit: 'cover' }}
                                    />
                                </div>
                            </Card>

                            {/* Status Card */}
                            <Card className="shadow-sm">
                                <Space direction="vertical" size="middle" className="w-full">
                                    <div>
                                        <Text type="secondary" className="text-xs block mb-2">Trạng thái xuất bản</Text>
                                        <Tag
                                            icon={<GlobalOutlined />}
                                            color={course?.isPublic ? 'success' : 'default'}
                                            className="w-full text-center py-1"
                                        >
                                            {course?.isPublic ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                        </Tag>
                                    </div>
                                    <div>
                                        <Text type="secondary" className="text-xs block mb-2">Trạng thái hoạt động</Text>
                                        <Tag
                                            icon={<PoweroffOutlined />}
                                            color={course?.courseIsActive ? 'processing' : 'error'}
                                            className="w-full text-center py-1"
                                        >
                                            {course?.courseIsActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                        </Tag>
                                    </div>
                                </Space>
                            </Card>

                            {/* Stats Card */}
                            <Card className="shadow-sm">
                                <Space direction="vertical" size="small" className="w-full">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <Space>
                                            <BookOutlined className="text-blue-500" />
                                            <Text type="secondary">Học phần</Text>
                                        </Space>
                                        <Text strong className="text-lg">{totalSections}</Text>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <Space>
                                            <FileTextOutlined className="text-green-500" />
                                            <Text type="secondary">Bài học</Text>
                                        </Space>
                                        <Text strong className="text-lg">{totalLessons}</Text>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <Space>
                                            <ClockCircleOutlined className="text-orange-500" />
                                            <Text type="secondary">Thời lượng</Text>
                                        </Space>
                                        <Text strong className="text-lg">{formattedTime}</Text>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <Text type="secondary">Giá khóa học</Text>
                                        <Text strong className="text-lg text-red-500">
                                            {formatNumberWithCommas(course?.price)} ₫
                                        </Text>
                                    </div>
                                </Space>
                            </Card>

                            {/* Action Buttons */}
                            <Card className="shadow-sm">
                                <Space direction="vertical" size="middle" className="w-full">
                                    <Link to={role === RoleType.TEACHER ? '/teacher/getAllCourse' : '/admin/getAllCourse'} className="block">
                                        <Button
                                            danger
                                            size="large"
                                            block
                                        >
                                            Quay lại
                                        </Button>
                                    </Link>

                                    {role === RoleType.TEACHER ? (
                                        <Link to={`/teacher/updateCourse/${courseId}`} className="block">
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                size="large"
                                                block
                                            >
                                                Thay đổi thông tin khóa học
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link to={`/admin/updateCourse/${courseId}`} className="block">
                                            <Button
                                                type="primary"
                                                icon={<EyeOutlined />}
                                                size="large"
                                                block
                                                className="h-12 text-base font-medium bg-[#1677ff] hover:!bg-[#4096ff] border-none"
                                            >
                                                Xem thông tin khóa học
                                            </Button>
                                        </Link>

                                    )}
                                </Space>
                            </Card>
                        </div>
                    </Col>

                    {/* Right Content */}
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size="large" className="w-full">
                            {/* Basic Info */}
                            <Card className="shadow-sm">
                                <Title level={4} className="mb-4 text-gray-800">
                                    {course?.title}
                                </Title>

                                <div className="mb-4">
                                    <Text type="secondary" className="text-xs block mb-2">Thể loại</Text>
                                    <Space wrap size="small">
                                        {course?.courseCategories?.map((category) => (
                                            <Tag
                                                key={category.courseCategoryId}
                                                className="px-3 py-1"
                                            >
                                                {category.category.name}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>

                                <Divider className="my-4" />

                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Ngày tạo">
                                        {course?.createAt ? new Date(course?.createAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật lần cuối">
                                        {course?.updateAt ? new Date(course?.updateAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '-'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            {/* Description */}
                            <Card
                                title={<span className="text-base font-semibold">Mô tả khóa học</span>}
                                className="shadow-sm"
                            >
                                <Paragraph className="text-gray-700 whitespace-pre-line mb-0">
                                    {getDescriptionText()}
                                </Paragraph>
                            </Card>

                            {/* Knowledge */}
                            <Card
                                title={<span className="text-base font-semibold">Kiến thức đạt được</span>}
                                className="shadow-sm"
                            >
                                <Space direction="vertical" size="small" className="w-full">
                                    {course?.knowdledgeDescription
                                        ?.split('|')
                                        .filter(item => item.trim())
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                                            >
                                                <CheckCircleOutlined className="text-green-500 text-base mt-0.5 flex-shrink-0" />
                                                <Text className="text-gray-700">
                                                    {item.trim()}
                                                </Text>
                                            </div>
                                        ))}
                                </Space>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ViewCourseDetails;