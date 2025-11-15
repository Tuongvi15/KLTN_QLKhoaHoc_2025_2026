import { InputNumber, Card, Slider, message, Tag, Space, Typography, Row, Col, Statistic } from "antd";
import { DollarOutlined, PercentageOutlined, TagOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { setCourseCreatedData } from "../../../slices/courseSlice";
import { useEffect, useState } from "react";

const { Text, Title } = Typography;

export default function Step3_Pricing() {
    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    const [price, setPrice] = useState(course.price || 0);
    const [discount, setDiscount] = useState(course.salesCampaign || 0);

    const finalPrice = Math.max(0, price - (price * discount) / 100);

    useEffect(() => {
        dispatch(setCourseCreatedData({ ...course, price, salesCampaign: discount }));
    }, [price, discount]);

    const handleValidatePrice = () => {
        if (price < 10000) {
            message.warning("💡 Giá khóa học nên từ 10.000₫ trở lên để đảm bảo giá trị!");
        }
    };

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <Space>
                                <DollarOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                                <Text strong style={{ fontSize: 15 }}>Giá gốc</Text>
                            </Space>
                            <InputNumber
                                value={price}
                                min={0}
                                step={10000}
                                max={100000000}
                                style={{ width: '100%' }}
                                size="large"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value) => (value ? Number(value.replace(/₫\s?|,/g, "")) : 0)}
                                onChange={(val) => setPrice(val || 0)}
                                onBlur={handleValidatePrice}
                                addonAfter="₫"
                            />
                        </Space>
                    </Card>

                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space>
                                    <PercentageOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                                    <Text strong style={{ fontSize: 15 }}>Giảm giá</Text>
                                </Space>
                                <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                                    {discount}%
                                </Tag>
                            </Space>
                            <Slider
                                min={0}
                                max={90}
                                step={5}
                                value={discount}
                                onChange={(val) => setDiscount(val)}
                                tooltip={{ open: false }}
                                marks={{
                                    0: '0%',
                                    30: '30%',
                                    50: '50%',
                                    70: '70%',
                                    90: '90%'
                                }}
                            />
                            {discount >= 70 && (
                                <Text type="danger" style={{ fontSize: 13 }}>
                                    ⚠️ Giảm trên 70% có thể ảnh hưởng tới doanh thu
                                </Text>
                            )}
                        </Space>
                    </Card>
                </Space>
            </Col>

            <Col xs={24} lg={12}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '100%',
                    }}
                >
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <Space>
                            <TagOutlined style={{ fontSize: 20, color: '#fff' }} />
                            <Title level={4} style={{ margin: 0, color: '#fff' }}>
                                Tổng quan giá
                            </Title>
                        </Space>

                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: 8,
                            padding: 20,
                            backdropFilter: 'blur(10px)',
                        }}>
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <div>
                                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                                        Giá gốc
                                    </Text>
                                    <div style={{ fontSize: 24, color: '#fff', fontWeight: 500 }}>
                                        {price.toLocaleString()} ₫
                                    </div>
                                </div>

                                <div>
                                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                                        Giảm giá
                                    </Text>
                                    <div style={{ fontSize: 20, color: '#52c41a', fontWeight: 500 }}>
                                        -{discount}%
                                    </div>
                                </div>

                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.2)',
                                    paddingTop: 16,
                                }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                                        Giá cuối cùng
                                    </Text>
                                    <div style={{ fontSize: 32, color: '#fff', fontWeight: 600 }}>
                                        {finalPrice.toLocaleString()} ₫
                                    </div>
                                </div>
                            </Space>
                        </div>

                        {price > 0 && (
                            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                                💰 Bạn sẽ nhận được {(finalPrice * 0.7).toLocaleString()} ₫ sau khi trừ phí nền tảng (30%)
                            </Text>
                        )}
                    </Space>
                </Card>
            </Col>
        </Row>
    );
}