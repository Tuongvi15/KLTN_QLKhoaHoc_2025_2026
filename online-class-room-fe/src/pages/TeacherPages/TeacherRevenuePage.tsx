import { useEffect, useState } from "react";
import { Table, DatePicker, Card, Tag } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const { MonthPicker } = DatePicker;

export default function TeacherRevenuePage() {
  const teacherId = useSelector((state: RootState) => state.user.id);

  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [filter, setFilter] = useState({
    teacherId: teacherId,
    month: null,
    year: null,
  });

  const formatMoney = (value: number) =>
    value?.toLocaleString("vi-VN") + " đ";

  const formatDiscount = (value: number) => `${value * 100}%`;

  const columns = [
    { title: "Khóa học", dataIndex: "courseTitle" },
    {
      title: "Giá gốc",
      dataIndex: "originalPrice",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Giảm giá",
      dataIndex: "salesCampaign",
      render: (v: number) => formatDiscount(v),
    },
    { title: "Số học viên", dataIndex: "totalStudents" },
    { title: "Số đơn", dataIndex: "totalOrders" },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      render: (v: number) => (
        <span className="font-semibold text-blue-600">{formatMoney(v)}</span>
      ),
    },
    {
      title: "Thu nhập GV",
      dataIndex: "teacherIncome",
      render: (v: number) => (
        <span className="text-green-600 font-semibold">{formatMoney(v)}</span>
      ),
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

  useEffect(() => {
    if (teacherId) {
      setFilter({ ...filter, teacherId });
      fetchData();
    }
  }, [teacherId]);

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

  const getFilterLabel = () => {
    if (filter.month && filter.year) {
      return `Tháng ${filter.month}/${filter.year}`;
    }
    return "Tất cả thời gian";
  };

  // Tổng thu nhập của giáo viên
  const totalIncome = revenueData.reduce(
    (sum: number, c: any) => sum + c.teacherIncome,
    0
  );

  const totalOrders = revenueData.reduce(
    (sum: number, c: any) => sum + c.totalOrders,
    0
  );

  const totalStudents = revenueData.reduce(
    (sum: number, c: any) => sum + c.totalStudents,
    0
  );

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">💰 Doanh thu của tôi</h2>

      {/* Tổng quan thu nhập */}
      <Card className="shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border">
            <p className="text-gray-600">Thu nhập của bạn</p>
            <p className="text-2xl font-bold text-blue-700">{formatMoney(totalIncome)}</p>
          </div>

          <div className="p-4 rounded-xl bg-green-50 border">
            <p className="text-gray-600">Tổng học viên</p>
            <p className="text-2xl font-bold text-green-700">{totalStudents}</p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border">
            <p className="text-gray-600">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-purple-700">{totalOrders}</p>
          </div>
        </div>
      </Card>

      {/* Bộ lọc */}
      <Card className="shadow-sm">
        <div className="flex gap-3 items-center">
          <MonthPicker onChange={onMonthChange} placeholder="Chọn tháng" />

          <button
            onClick={applyFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Lọc
          </button>

          <Tag color="blue">{getFilterLabel()}</Tag>
        </div>
      </Card>

      {/* Bảng khóa học */}
      <Card className="shadow-sm">
        <Table
          loading={loading}
          columns={columns}
          dataSource={revenueData}
          rowKey="courseId"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
