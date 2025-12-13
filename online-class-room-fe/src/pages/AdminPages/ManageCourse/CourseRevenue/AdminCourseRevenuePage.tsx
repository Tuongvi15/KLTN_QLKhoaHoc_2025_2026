import { useEffect, useState } from "react";
import { Table, DatePicker, Select, Card, Tag, Row, Col, Statistic, Space, Button } from "antd";
import axios from "axios";
import {
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FilterOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { downloadExcel } from "../../../../utils/downloadExcel";

const { MonthPicker } = DatePicker;

export default function AdminCourseRevenuePage() {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [filter, setFilter] = useState({
    teacherId: "",
    month: null,
    year: null,
  });

  const formatMoney = (value: number) =>
    value?.toLocaleString("vi-VN") + " đ";

  const formatDiscount = (value: number) => `${(value * 100).toFixed(0)}%`;

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "courseTitle",
      width: 250,
      fixed: 'left' as const,
    },
    {
      title: "Giá gốc",
      dataIndex: "originalPrice",
      render: (v: number) => formatMoney(v),
      align: 'right' as const,
    },
    {
      title: "Giảm giá",
      dataIndex: "salesCampaign",
      render: (v: number) => (
        <Tag color="red">{formatDiscount(v)}</Tag>
      ),
      align: 'center' as const,
    },
    {
      title: "Học viên",
      dataIndex: "totalStudents",
      align: 'center' as const,
    },
    {
      title: "Đơn hàng",
      dataIndex: "totalOrders",
      align: 'center' as const,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      render: (v: number) => (
        <span className="font-semibold text-blue-600">{formatMoney(v)}</span>
      ),
      align: 'right' as const,
    },
    {
      title: "Thu nhập GV",
      dataIndex: "teacherIncome",
      render: (v: number) => (
        <span className="font-semibold text-green-600">{formatMoney(v)}</span>
      ),
      align: 'right' as const,
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
      width: 150,
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/revenue/course-detail`,
        { params: filter }
      );
      setRevenueData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/Account/GetAllTeachers`
    );
    setTeacherList(res.data);
  };

  useEffect(() => {
    fetchTeachers();
    fetchData();
  }, []);

  const onMonthChange = (value: any) => {
    if (!value) {
      setFilter({ ...filter, month: null, year: null });
      return;
    }
    setFilter({
      ...filter,
      month: value.month() + 1,
      year: value.year(),
    });
  };

  const applyFilter = () => fetchData();

  const resetFilter = () => {
    setFilter({ teacherId: "", month: null, year: null });
    fetchData();
  };
  const handleExportExcel = () => {
    const url =
      `${import.meta.env.VITE_API_URL}/Reports/ExportTeacherRevenueExcel`
      + `?teacherId=${filter.teacherId || ""}`
      + `&month=${filter.month || ""}`
      + `&year=${filter.year || ""}`;

    downloadExcel(url, "CourseRevenueReport.xlsx");
  };

  const getFilterLabel = () => {
    if (filter.month && filter.year) {
      return `Tháng ${filter.month}/${filter.year}`;
    }
    return "Tất cả thời gian";
  };

  // Tổng quan hệ thống
  const totalRevenueAll = revenueData.reduce(
    (sum: number, c: any) => sum + c.totalRevenue,
    0
  );

  const totalStudentsAll = revenueData.reduce(
    (sum: number, c: any) => sum + c.totalStudents,
    0
  );

  const totalOrdersAll = revenueData.reduce(
    (sum: number, c: any) => sum + c.totalOrders,
    0
  );

  // Gộp theo giáo viên
  const revenueByTeacher: Record<string, any> = {};

  revenueData.forEach((c: any) => {
    if (!revenueByTeacher[c.teacherId]) {
      revenueByTeacher[c.teacherId] = {
        teacherName: c.teacherName,
        teacherIncome: 0,
        totalRevenue: 0,
        totalStudents: 0,
        totalOrders: 0,
      };
    }

    revenueByTeacher[c.teacherId].teacherIncome += c.teacherIncome;
    revenueByTeacher[c.teacherId].totalRevenue += c.totalRevenue;
    revenueByTeacher[c.teacherId].totalStudents += c.totalStudents;
    revenueByTeacher[c.teacherId].totalOrders += c.totalOrders;
  });

  const teacherRevenueList = Object.values(revenueByTeacher).sort(
    (a: any, b: any) => b.totalRevenue - a.totalRevenue
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Báo cáo doanh thu khóa học
          </h1>
          <p className="text-gray-600">Thống kê và phân tích doanh thu từ các khóa học</p>
        </div>

        {/* Filter */}
        <Card className="mb-6 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <FilterOutlined />
              <span className="font-medium">Bộ lọc:</span>
            </div>

            <Select
              style={{ width: 240 }}
              placeholder="Chọn giảng viên"
              value={filter.teacherId || undefined}
              onChange={(v) => setFilter({ ...filter, teacherId: v })}
              allowClear
              size="large"
            >
              {teacherList.map((t: any) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.fullName}
                </Select.Option>
              ))}
            </Select>

            <MonthPicker
              onChange={onMonthChange}
              placeholder="Chọn tháng"
              size="large"
            />

            <Button
              icon={<FilterOutlined />}
              onClick={applyFilter}
              size="large"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
            >
              Áp dụng
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
              size="large"
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>


            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilter}
              size="large"
            >
              Đặt lại
            </Button>

            <Tag color="blue" className="text-sm py-1 px-3">
              {getFilterLabel()}
            </Tag>
          </div>
        </Card>

        {/* Statistics Overview */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Tổng doanh thu"
                value={totalRevenueAll}
                prefix={<DollarOutlined className="text-blue-500" />}
                suffix="đ"
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                formatter={(value) => value.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Tổng học viên"
                value={totalStudentsAll}
                prefix={<UserOutlined className="text-green-500" />}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Tổng đơn hàng"
                value={totalOrdersAll}
                prefix={<ShoppingCartOutlined className="text-purple-500" />}
                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Số giảng viên"
                value={Object.keys(revenueByTeacher).length}
                prefix={<TeamOutlined className="text-orange-500" />}
                suffix="người"
                valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Teacher Revenue */}
        {teacherRevenueList.length > 0 && (
          <Card
            title={
              <span className="text-lg font-semibold">
                💰 Thu nhập theo giảng viên
              </span>
            }
            className="mb-6 shadow-sm"
          >
            <Row gutter={[16, 16]}>
              {teacherRevenueList.map((t: any, index: number) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 text-base mb-1">
                        {t.teacherName}
                      </h4>
                      <div className="h-1 w-12 bg-yellow-400 rounded"></div>
                    </div>

                    <Space direction="vertical" size="small" className="w-full">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Doanh thu:</span>
                        <span className="font-medium">{formatMoney(t.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Học viên:</span>
                        <span className="font-medium">{t.totalStudents}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đơn hàng:</span>
                        <span className="font-medium">{t.totalOrders}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-yellow-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Thu nhập GV:</span>
                          <span className="text-lg font-bold text-orange-600">
                            {formatMoney(t.teacherIncome)}
                          </span>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-sm">
          <Table
            loading={loading}
            columns={columns}
            dataSource={revenueData}
            rowKey="courseId"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} khóa học`
            }}
            scroll={{ x: 1200 }}
            className="revenue-table"
          />
        </Card>
      </div>

      <style>{`
        .revenue-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
        }
        .revenue-table .ant-table-tbody > tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}