// src/pages/TeacherDashboard/index.tsx
import { Col, Row, Skeleton, Typography } from "antd";
import KPICards from "./components/KPICards";
import RevenueChart from "./components/RevenueChart";
import TopCoursesTable from "./components/TopCoursesTable";
import RecentActivities from "./components/RecentActivities";
import QuickChecklist from "./components/QuickChecklist";
import EmptyState from "./components/EmptyState";
import { useTeacherDashboard } from "./components/useTeacherDashboard";
import { downloadExcel } from "../../utils/downloadExcel";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Button } from "antd";

export default function TeacherDashboardPage() {
  const { courses, studentsPerCourse, loading } = useTeacherDashboard();
  const teacherId = useSelector((state: RootState) => state.user.id);

  const handleExportRevenue = () => {
    const url = `${process.env.REACT_APP_API_URL}/Reports/ExportTeacherRevenueExcel?teacherId=${teacherId}`;
    downloadExcel(url, "RevenueReport.xlsx");
  };

  if (loading) return <Skeleton active />;
  if (courses.length === 0) return <EmptyState />;

  // 👉 Tính KPI
  const totalCourses = courses.length;

  const totalStudents = studentsPerCourse.length;
  const calcFinalPrice = (price: number, sale: number) => {
    let finalPrice = price;

    // sale = 0.2 → 20%
    if (sale > 0 && sale < 1) finalPrice = price - price * sale;
    // sale = 20 → 20%
    else if (sale >= 1 && sale <= 100) finalPrice = price - (price * sale) / 100;
    // sale = 15000 → giảm trực tiếp 15k
    else if (sale > 100) finalPrice = price - sale;

    return finalPrice;
  };

  const totalRevenue = courses.reduce((sum, c) => {
    const st = studentsPerCourse.filter(x => x.courseId === c.courseId).length;
    const finalPrice = calcFinalPrice(c.price || 0, c.salesCampaign || 0);
    return sum + st * finalPrice;
  }, 0);


  // 👉 Tạo chart data
  const chartData = {
    labels: courses.map(c => c.title),
    datasets: [
      {
        label: "Doanh thu",
        data: courses.map(c => {
          const st = studentsPerCourse.filter(x => x.courseId === c.courseId).length;
          const finalPrice = calcFinalPrice(c.price || 0, c.salesCampaign || 0);
          return st * finalPrice;
        }),

      },
    ],
  };

  // 👉 Top courses
  const topCourses = courses
    .map(c => {
      const st = studentsPerCourse.filter(x => x.courseId === c.courseId).length;

      const finalPrice = calcFinalPrice(c.price || 0, c.salesCampaign || 0);

      const revenue = st * finalPrice;
      const profit = revenue * 0.7;

      return {
        courseId: c.courseId,
        title: c.title,
        imageUrl: c.imageUrl,
        totalStudents: st,
        revenue,
        profit
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
      {/* ⭐⭐ BUTTON EXPORT Excel – dùng util ⭐⭐ */}
      <div className="flex justify-end gap-3 mb-4">
        <Button
          type="primary"
          className="bg-blue-500"
          onClick={() =>
            downloadExcel(
              `${import.meta.env.VITE_API_URL}/Reports/ExportTeacherRevenueExcel?teacherId=${teacherId}`,
              "RevenueReport.xlsx"
            )
          }
        >
          Xuất Excel Doanh thu
        </Button>

        <Button
          type="default"
          onClick={() =>
            downloadExcel(
              `${import.meta.env.VITE_API_URL}/Reports/ExportTeacherCoursesExcel?teacherId=${teacherId}`,
              "CoursesReport.xlsx"
            )
          }
        >
          Xuất Excel Khóa học
        </Button>
      </div>

      <KPICards
        totalCourses={totalCourses}
        totalStudents={totalStudents}
        totalRevenue={totalRevenue}
        totalProfit={totalRevenue * 0.7}
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
