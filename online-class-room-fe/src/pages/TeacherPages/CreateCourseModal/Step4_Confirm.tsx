import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Card, Tag, Typography, Row, Col, Space, Divider, Image } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useGetCategoryQuery } from "../../../services/categoryService";
import draftToHtml from "draftjs-to-html";

const { Text, Title, Paragraph } = Typography;

export default function Step4_Confirm() {
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);
    const { data: allCategories = [] } = useGetCategoryQuery();

    const categoryNames =
        course.courseCategories
            ?.map((c) => {
                const cat = allCategories.find((x: any) => x.catgoryId === c.categoryId);
                return cat?.name;
            })
            .filter(Boolean)
            .join(", ") || "Chưa chọn";

    const firstCategory = course.courseCategories?.[0] as any; // mở rộng type tạm thời

    const firstField =
        firstCategory?.field?.name ||
        firstCategory?.category?.fieldName ||
        "Không có";

    let descriptionHtml = "<em>Chưa có mô tả</em>";

    try {
        if (course.description) {
            // Nếu description là JSON Draft.js
            const parsed = JSON.parse(course.description);
            descriptionHtml = draftToHtml(parsed);
        }
    } catch {
        // Nếu chỉ là text thuần → hiển thị thẳng
        descriptionHtml = course.description;
    }


    const levelNames = (course.suitableLevels || "")
        .split("|")
        .filter(Boolean)
        .map((l) => {
            if (l === "1") return "🌱 Fresher";
            if (l === "2") return "🚀 Junior";
            if (l === "3") return "⭐ Master";
            return l;
        })
        .join(", ");

    const priceAfterDiscount = Math.max(
        0,
        (course.price || 0) - ((course.price || 0) * (course.salesCampaign || 0)) / 100
    );

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <Space direction="vertical" size={8}>
                    <Title level={3} style={{ margin: 0, color: '#fff' }}>
                        {course.title || "Khóa học chưa có tiêu đề"}
                    </Title>
                    <Space>
                        <Tag icon={<ClockCircleOutlined />} color="default" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>
                            Trạng thái: Nháp
                        </Tag>
                        <Tag color="default" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>
                            {course.totalDuration || 0} phút
                        </Tag>
                    </Space>
                </Space>
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={10}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {course.imageUrl && (
                            <Card bordered={false} style={{ borderRadius: 12, overflow: 'hidden' }}>
                                <Image src={course.imageUrl} alt="Ảnh khóa học" style={{ width: '100%', borderRadius: 8 }} />
                            </Card>
                        )}

                        {course.videoPreviewUrl && (
                            <Card bordered={false} style={{ borderRadius: 12 }}>
                                <video src={course.videoPreviewUrl} controls style={{ width: '100%', borderRadius: 8 }} />
                            </Card>
                        )}
                    </Space>
                </Col>

                <Col xs={24} lg={14}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <Title level={5} style={{ margin: 0 }}>Thông tin cơ bản</Title>

                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Mô tả</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: descriptionHtml
                                            }}
                                        />


                                    </div>
                                </div>

                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Lĩnh vực</Text>
                                        <Tag color="blue" style={{ marginTop: 4 }}>{firstField}</Tag>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Cấp độ</Text>
                                        <Text style={{ marginTop: 4, display: 'block' }}>{levelNames || "Chưa chọn"}</Text>
                                    </Col>
                                </Row>

                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Thể loại</Text>
                                    <Text style={{ marginTop: 4 }}>{categoryNames}</Text>
                                </div>
                            </Space>
                        </Card>

                        <Card bordered={false} style={{ borderRadius: 12, background: '#f8f9fa' }}>
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <Title level={5} style={{ margin: 0 }}>Giá</Title>

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>Giá gốc</Text>
                                        <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>
                                            {course.price?.toLocaleString()} ₫
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>Giảm giá</Text>
                                        <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4, color: '#52c41a' }}>
                                            -{course.salesCampaign || 0}%
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>Giá cuối</Text>
                                        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: '#1677ff' }}>
                                            {priceAfterDiscount.toLocaleString()} ₫
                                        </div>
                                    </Col>
                                </Row>
                            </Space>
                        </Card>

                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <Space>
                                    <CheckCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                                    <Title level={5} style={{ margin: 0 }}>Mục tiêu khóa học</Title>
                                </Space>

                                {course.knowdledgeDescription ? (
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {course.knowdledgeDescription
                                            .split("|")
                                            .filter(Boolean)
                                            .map((item, i) => (
                                                <li key={i} style={{ marginBottom: 8 }}>
                                                    <Text>{item}</Text>
                                                </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <Text type="secondary">Chưa có mục tiêu</Text>
                                )}
                            </Space>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </Space>
    );
}