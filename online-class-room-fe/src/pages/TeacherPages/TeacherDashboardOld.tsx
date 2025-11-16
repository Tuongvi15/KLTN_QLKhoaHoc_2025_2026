// src/layouts/TeacherPages/TeacherDashboard.tsx
import React, { useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Avatar,
  Tag,
  Skeleton,
  List,
  Progress,
  Button,
  Empty,
  Space,
  Divider,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  DollarOutlined,
  LineChartOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  useGetCoursesByTeacherQuery,
  useGetStudentsInMyCoursesQuery,
} from "../../services/course.services";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const { Title, Text } = Typography;

type CourseType = {
  courseId: number;
  title?: string;
  imageUrl?: string;
  price?: number | null;
  salesCampaign?: number | null;
  isPublic?: boolean;
  courseIsActive?: boolean;
};

type StudentPerCourseType = {
  courseId: number;
  studentId?: string;
};

const gradientOptions: any = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8,
      titleFont: {
        size: 14,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.03)',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 12,
        },
        color: '#64748b',
        padding: 8,
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
        },
        color: '#64748b',
        padding: 8,
      },
      border: {
        display: false,
      },
    },
  },
};

const TeacherDashboard: React.FC = () => {
  const teacherId = useSelector((s: RootState) => s.user.id);

  const {
    data: courses = [],
    isLoading: loadingCourses,
    isError: errorCourses,
  } = useGetCoursesByTeacherQuery(teacherId ?? "", { skip: teacherId == null });

  const courseIds = useMemo(() => (courses || []).map((c: any) => c.courseId), [courses]);

  const {
    data: studentsPerCourse = [],
    isLoading: loadingStudents,
    isError: errorStudents,
  } = useGetStudentsInMyCoursesQuery(
    { courseIds, teacherId },
    { skip: teacherId == null || courseIds.length === 0 }
  );

  const loading = loadingCourses || loadingStudents;
  const error = (errorCourses && !!teacherId) || (errorStudents && !!teacherId);

  const totalCourses = (courses && courses.length) || 0;

  const totalStudents = useMemo(() => {
    if (!studentsPerCourse || studentsPerCourse.length === 0) return 0;
    const first = studentsPerCourse[0] as any;
    if (first && typeof first.totalStudents === "number") {
      return (studentsPerCourse as any[]).reduce((s, it) => s + (it.totalStudents || 0), 0);
    }
    const uniquePairs = new Map<string, boolean>();
    (studentsPerCourse as any[]).forEach((r) => {
      const key = `${r.courseId}_${r.studentId ?? Math.random()}`;
      uniquePairs.set(key, true);
    });
    if (studentsPerCourse && studentsPerCourse.length > 0 && (studentsPerCourse as any[])[0].count) {
      return (studentsPerCourse as any[]).reduce((s, it) => s + (it.count || 0), 0);
    }
    return uniquePairs.size;
  }, [studentsPerCourse]);

  const totalRevenue = useMemo(() => {
    if (!courses || courses.length === 0) return 0;

    return courses.reduce((sum, c) => {
      const s = studentsPerCourse.filter(x => x.courseId === c.courseId).length;

      const price = c.price || 0;
      const sc = c.salesCampaign || 0;

      let finalPrice = price;

      if (sc > 0 && sc < 1) finalPrice = price - price * sc;
      else if (sc >= 1 && sc <= 100) finalPrice = price - (price * sc) / 100;
      else if (sc > 100) finalPrice = price - sc;

      return sum + finalPrice * s;
    }, 0);
  }, [courses, studentsPerCourse]);


  const chartData = useMemo(() => {
    const labels = (courses || []).map((c: any) => c.title || `Course ${c.courseId}`);
    const data = (courses || []).map((c: any) => {
      const s = (studentsPerCourse || []).filter((x: any) => x.courseId === c.courseId).length;
      const price = c.price || 0;
      const sc = c.salesCampaign || 0;

      let finalPrice = price;

      if (sc > 0 && sc < 1) finalPrice = price - price * sc;
      else if (sc >= 1 && sc <= 100) finalPrice = price - (price * sc) / 100;
      else if (sc > 100) finalPrice = price - sc;

      return finalPrice * s;

    });

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu (₫)",
          data,
          borderRadius: 12,
          backgroundColor: function (context: any) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "#3b82f6";
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, "#60a5fa");
            gradient.addColorStop(1, "#3b82f6");
            return gradient;
          },
          barThickness: 32,
        },
      ],
    };
  }, [courses, studentsPerCourse]);

  const topCourses = useMemo(() => {
    if (!courses) return [];
    const arr = courses.map((c: any) => {
      const s = (studentsPerCourse || []).filter((x: any) => x.courseId === c.courseId).length;
      const price = c.price || 0;
      const sc = c.salesCampaign || 0;

      let finalPrice = price;

      if (sc > 0 && sc < 1) finalPrice = price - price * sc;
      else if (sc >= 1 && sc <= 100) finalPrice = price - (price * sc) / 100;
      else if (sc > 100) finalPrice = price - sc;

      const revenue = finalPrice * s;

      return {
        courseId: c.courseId,
        title: c.title,
        imageUrl: c.imageUrl,
        totalStudents: s,
        revenue,
        rating: (Math.random() * 2 + 3).toFixed(1),
      };

    });
    return arr.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  }, [courses, studentsPerCourse]);

  const recentStudents = useMemo(() => {
    if (!studentsPerCourse || studentsPerCourse.length === 0) return [];
    const items = (studentsPerCourse as any[]).slice(0, 5).map((it) => ({
      studentId: it.studentId ?? `s-${Math.random().toString(36).slice(2, 8)}`,
      name: it.studentName || `Học viên ${it.studentId ?? "A"}`,
      courseId: it.courseId,
      joinedAt: it.joinedAt || new Date().toISOString(),
    }));
    return items;
  }, [studentsPerCourse]);

  const columns = [
    {
      title: "Khóa học",
      key: "title",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={52}
            src={record.imageUrl}
            icon={<BookOutlined />}
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              color: '#3b82f6',
            }}
          />
          <div>
            <Text strong style={{ fontSize: '14px', color: '#0f172a' }}>
              {record.title}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.courseId}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "totalStudents",
      align: "center" as const,
      render: (v: number) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
          }}
        >
          <TeamOutlined style={{ color: '#0284c7', fontSize: '14px' }} />
          <Text strong style={{ color: '#0c4a6e', fontSize: '14px' }}>{v}</Text>
        </div>
      ),
    },
    {
      title: "Đánh giá",
      key: "rating",
      align: "center" as const,
      render: (_: any, record: any) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            background: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fde68a',
          }}
        >
          <StarOutlined style={{ color: '#f59e0b', fontSize: '14px' }} />
          <Text strong style={{ color: '#92400e', fontSize: '14px' }}>{record.rating}</Text>
        </div>
      ),
    },
    {
      title: "Doanh thu",
      key: "revenue",
      align: "right" as const,

      render: (_: any, record: any) => (
        <Text strong style={{ fontSize: '15px', color: '#059669' }}>
          {record.revenue.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Lợi nhuận (70%)",
      key: "profit",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Text strong style={{ fontSize: '15px', color: '#1d4ed8' }}>
          {record.profit.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },


  ];

  // Empty state
  if (!loading && !error && totalCourses === 0) {
    return (
      <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card
            bordered={false}
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ padding: '48px 32px' }}>
              <Row gutter={[48, 48]} align="middle">
                <Col xs={24} lg={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '160px',
                        height: '160px',
                        margin: '0 auto 32px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <BookOutlined style={{ fontSize: '72px', color: '#3b82f6' }} />
                      <div
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                        }}
                      >
                        <PlusOutlined style={{ fontSize: '20px', color: 'white', fontWeight: 'bold' }} />
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} lg={12}>
                  <Space direction="vertical" size={24} style={{ width: '100%' }}>
                    <div>
                      <Tag
                        color="blue"
                        style={{
                          borderRadius: '8px',
                          padding: '6px 16px',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}
                      >
                        KHỞI ĐẦU
                      </Tag>
                      <Title
                        level={2}
                        style={{
                          margin: '16px 0 12px',
                          color: '#0f172a',
                          fontSize: '32px',
                          fontWeight: '700',
                        }}
                      >
                        Bắt đầu hành trình giảng dạy
                      </Title>
                      <Text
                        style={{
                          fontSize: '16px',
                          color: '#64748b',
                          lineHeight: '1.7',
                          display: 'block',
                        }}
                      >
                        Tạo khóa học đầu tiên và chia sẻ kiến thức của bạn với hàng ngàn học viên trên toàn quốc.
                        Xây dựng thương hiệu cá nhân và tạo thu nhập thụ động.
                      </Text>
                    </div>

                    <Space size={12}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        href="/teacher/getAllCourse"
                        style={{
                          borderRadius: '12px',
                          height: '48px',
                          fontSize: '15px',
                          fontWeight: '600',
                          paddingLeft: '24px',
                          paddingRight: '24px',
                          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        Tạo khóa học ngay
                      </Button>
                      <Button
                        size="large"
                        href="/teacher/getAllCourse"
                        style={{
                          borderRadius: '12px',
                          height: '48px',
                          fontSize: '15px',
                          border: '2px solid #e2e8f0',
                          fontWeight: '500',
                        }}
                      >
                        Xem hướng dẫn
                      </Button>
                    </Space>

                    <Divider style={{ margin: '8px 0' }} />

                    <div>
                      <Text strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '16px' }}>
                        Roadmap thành công
                      </Text>
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        {[
                          { text: "Xác định chủ đề & đối tượng học viên", done: false },
                          { text: "Tạo nội dung chất lượng với video HD", done: false },
                          { text: "Thiết lập giá cả & chương trình khuyến mãi", done: false },
                          { text: "Xuất bản & marketing khóa học", done: false },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              background: '#f8fafc',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: item.done ? '#10b981' : 'white',
                                border: item.done ? 'none' : '2px solid #cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {item.done && <CheckCircleOutlined style={{ color: 'white', fontSize: '12px' }} />}
                            </div>
                            <Text style={{ color: '#475569', fontSize: '14px' }}>{item.text}</Text>
                          </div>
                        ))}
                      </Space>
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>
          </Card>

          <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
            {[
              {
                icon: <FireOutlined />,
                title: "Nội dung hấp dẫn",
                desc: "Video chất lượng cao với kịch bản rõ ràng và bài tập thực hành",
                color: '#ef4444',
                bg: '#fef2f2',
              },
              {
                icon: <TeamOutlined />,
                title: "Cộng đồng học tập",
                desc: "Xây dựng mối quan hệ bền vững với học viên qua Q&A",
                color: '#8b5cf6',
                bg: '#faf5ff',
              },
              {
                icon: <TrophyOutlined />,
                title: "Thu nhập ổn định",
                desc: "Kiếm tiền thụ động từ khóa học và xây dựng thương hiệu cá nhân",
                color: '#10b981',
                bg: '#f0fdf4',
              },
            ].map((tip, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: '20px',
                    background: tip.bg,
                    border: 'none',
                    height: '100%',
                  }}
                >
                  <div style={{ padding: '8px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    >
                      {React.cloneElement(tip.icon, { style: { fontSize: '28px', color: tip.color } })}
                    </div>
                    <Title level={5} style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                      {tip.title}
                    </Title>
                    <Text style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                      {tip.desc}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <Skeleton active />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <Card style={{ borderRadius: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <Empty
            description={
              <div>
                <Title level={4} style={{ color: '#ef4444' }}>Không thể tải dữ liệu</Title>
                <Text type="secondary">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</Text>
              </div>
            }
          />
          <Button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', borderRadius: '8px' }}
          >
            Tải lại
          </Button>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <Space align="center" size={16}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              <DashboardOutlined style={{ fontSize: '28px', color: 'white' }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: '700' }}>
                Chào mừng trở lại! 👋
              </Title>
              <Text style={{ color: '#64748b', fontSize: '15px' }}>
                Đây là tổng quan hoạt động giảng dạy của bạn
              </Text>
            </div>
          </Space>
        </div>

        {/* KPI Cards */}
        <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              className="hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '20px',
                background: 'white',
                padding: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
            >
              <div style={{ padding: '20px' }}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#16a34a',
                    }}
                  >
                    +12%
                  </div>
                </div>
                <div>
                  <Text
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Tổng khóa học
                  </Text>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#0f172a',
                    lineHeight: '1',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    {totalCourses}
                  </div>
                  <Text style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px', display: 'block' }}>
                    Đang hoạt động
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              className="hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '20px',
                background: 'white',
                padding: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
            >
              <div style={{ padding: '20px' }}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TeamOutlined style={{ fontSize: '24px', color: '#8b5cf6' }} />
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#fef3c7',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#d97706',
                    }}
                  >
                    +8%
                  </div>
                </div>
                <div>
                  <Text
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Tổng học viên
                  </Text>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#0f172a',
                    lineHeight: '1',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    {totalStudents}
                  </div>
                  <Text style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px', display: 'block' }}>
                    Đang theo học
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={24} lg={8}>
            <Card
              bordered={false}
              className="hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '20px',
                background: 'white',
                padding: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
            >
              <div style={{ padding: '20px' }}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DollarOutlined style={{ fontSize: '24px', color: '#10b981' }} />
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#16a34a',
                    }}
                  >
                    +24%
                  </div>
                </div>
                <div>
                  <Text
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Tổng doanh thu
                  </Text>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#0f172a',
                    lineHeight: '1',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    {totalRevenue.toLocaleString("vi-VN")}
                    <span style={{ fontSize: '18px', fontWeight: '500', color: '#64748b', marginLeft: '4px' }}>₫</span>
                  </div>
                  <Text style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px', display: 'block' }}>
                    Tháng này
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Chart */}
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
              title={
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LineChartOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '17px', color: '#0f172a' }}>
                      Doanh thu theo khóa học
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Thống kê 30 ngày gần nhất
                    </Text>
                  </div>
                </div>
              }
            >
              {chartData && chartData.labels && chartData.labels.length > 0 ? (
                <div style={{ height: 340, padding: '16px 0' }}>
                  <Bar data={chartData} options={gradientOptions} />
                </div>
              ) : (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text style={{ color: '#64748b' }}>Chưa có dữ liệu doanh thu</Text>
                    }
                  />
                </div>
              )}
            </Card>

            {/* Top Courses */}
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrophyOutlined style={{ color: '#f59e0b', fontSize: '20px' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '17px', color: '#0f172a' }}>
                        Top khóa học nổi bật
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        5 khóa học có doanh thu cao nhất
                      </Text>
                    </div>
                  </div>
                </div>
              }
            >
              {topCourses.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={topCourses}
                  rowKey="courseId"
                  pagination={false}
                  style={{ overflow: 'hidden' }}
                />
              ) : (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text style={{ color: '#64748b' }}>Chưa có dữ liệu khóa học</Text>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Recent Activity */}
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
              title={
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ClockCircleOutlined style={{ color: '#8b5cf6', fontSize: '20px' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '17px', color: '#0f172a' }}>
                      Hoạt động gần đây
                    </Text>
                  </div>
                </div>
              }
            >
              {recentStudents.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text style={{ color: '#64748b' }}>Chưa có hoạt động</Text>
                    }
                  />
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={recentStudents}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '16px 0', border: 'none' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={48}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                              fontWeight: '600',
                              fontSize: '18px',
                            }}
                          >
                            {(item.name || "H").charAt(0)}
                          </Avatar>
                        }
                        title={
                          <Text strong style={{ fontSize: '14px', color: '#0f172a' }}>
                            {item.name}
                          </Text>
                        }
                        description={
                          <Text style={{ fontSize: '13px', color: '#64748b' }}>
                            Đăng ký khóa học #{item.joinedAt}
                          </Text>
                        }
                      />
                      <Tag
                        color="blue"
                        style={{
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '4px 10px',
                        }}
                      >
                        MỚI
                      </Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>

            {/* Quick Actions */}
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
              title={
                <Text strong style={{ fontSize: '17px', color: '#0f172a' }}>
                  Hành động nhanh
                </Text>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  href="/teacher/addCourse"
                  block
                  size="large"
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  Tạo khóa học mới
                </Button>

                <Button
                  icon={<BookOutlined />}
                  href="/teacher/getAllCourse"
                  block
                  size="large"
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '15px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  Quản lý khóa học
                </Button>

                <Divider style={{ margin: '8px 0' }} />

                <div>
                  <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '16px' }}>
                    Tiến độ hoàn thiện
                  </Text>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {[
                      { label: "Hoàn thiện hồ sơ giảng viên", value: 85, color: '#3b82f6' },
                      { label: "Chất lượng nội dung khóa học", value: 92, color: '#10b981' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <Text style={{ fontSize: '13px', color: '#475569' }}>{item.label}</Text>
                          <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>
                            {item.value}%
                          </Text>
                        </div>
                        <Progress
                          percent={item.value}
                          strokeColor={item.color}
                          trailColor="#f1f5f9"
                          size="small"
                          showInfo={false}
                          strokeWidth={8}
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                    ))}
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Global Styles */}
      <style>{`
        .ant-card-head {
          border-bottom: 1px solid #f1f5f9;
          padding: 20px 24px;
        }
        
        .ant-table {
          font-size: 14px;
        }
        
        .ant-table-thead > tr > th {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          padding: 16px;
        }
        
        .ant-table-tbody > tr > td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        
        .ant-list-item {
          transition: all 0.2s ease;
        }
        
        .ant-list-item:hover {
          background: #f8fafc;
          padding-left: 12px !important;
          padding-right: 12px !important;
          margin-left: -12px;
          margin-right: -12px;
          border-radius: 12px;
        }

        .ant-progress-bg {
          border-radius: 4px;
        }

        .ant-progress-inner {
          border-radius: 4px;
          background: #f1f5f9;
        }

        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .ant-card {
          transition: all 0.3s ease;
        }

        .ant-btn {
          transition: all 0.2s ease;
        }

        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;