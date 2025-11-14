// src/pages/TeacherDashboard/index.tsx
import { Col, Row, Skeleton, Typography } from "antd";
import KPICards from "./components/KPICards";
import RevenueChart from "./components/RevenueChart";
import TopCoursesTable from "./components/TopCoursesTable";
import RecentActivities from "./components/RecentActivities";
import QuickChecklist from "./components/QuickChecklist";
import EmptyState from "./components/EmptyState";
import { useTeacherDashboard } from "./components/useTeacherDashboard";

export default function TeacherDashboardPage() {
  const { courses, studentsPerCourse, loading } = useTeacherDashboard();

  if (loading) return <Skeleton active />;
  if (courses.length === 0) return <EmptyState />;

  // 👉 Tính KPI
  const totalCourses = courses.length;

  const totalStudents = studentsPerCourse.length;

  const totalRevenue = courses.reduce((sum, c) => {
    const studentCount = studentsPerCourse.filter(x => x.courseId === c.courseId).length;
    const price = c.price || 0;
    const sale = c.salesCampaign || 0;
    return sum + studentCount * (price - price * sale / 100);
  }, 0);

  // 👉 Tạo chart data
  const chartData = {
    labels: courses.map(c => c.title),
    datasets: [
      {
        label: "Doanh thu",
        data: courses.map(c => {
          const st = studentsPerCourse.filter(x => x.courseId === c.courseId).length;
          const price = c.price || 0;
          return st * price;
        }),
      },
    ],
  };

  // 👉 Top courses
  const topCourses = courses
    .map(c => {
      const st = studentsPerCourse.filter(x => x.courseId === c.courseId).length;
      return {
        courseId: c.courseId,
        title: c.title,
        imageUrl: c.imageUrl,
        totalStudents: st,
        revenue: st * (c.price || 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 👉 Recent students (demo)
  const recent = studentsPerCourse.slice(0, 5).map(x => ({
    studentId: x.studentId,
    name: `Student ${x.studentId}`,
    courseId: x.courseId,
    joinedAt: new Date().toISOString(),
  }));

  const checklist = [
    { title: "Thêm mô tả khóa học", percent: 100 },
    { title: "Hoàn thiện ảnh bìa", percent: 70 },
    { title: "Tạo chương học", percent: 40 },
  ];

  return (
    <div className="p-6 bg-[#f7faff] min-h-screen">
      <Typography.Title level={3} style={{ color: "#1677ff" }}>
        Dashboard Giảng viên
      </Typography.Title>

      <KPICards
        totalCourses={totalCourses}
        totalStudents={totalStudents}
        totalRevenue={totalRevenue}
      />

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <RevenueChart chartData={chartData} />
          <TopCoursesTable topCourses={topCourses} />
        </Col>

        <Col xs={24} lg={8}>
          <RecentActivities recent={recent} />
          <QuickChecklist checklist={checklist} />
        </Col>
      </Row>
    </div>
  );
}
