import { useEffect, useState } from "react";
import { Card, DatePicker, Table, Button, Tag, message } from "antd";
import axios from "axios";
const { MonthPicker } = DatePicker;

export default function PayoutListPage() {
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatMoney = (v: number) => v.toLocaleString("vi-VN") + " đ";

  const fetchData = async () => {
    if (!month || !year) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/payout/list`,
        { params: { month, year } }
      );
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month && year) fetchData();
  }, [month, year]);

  const onMonthChange = (v: any) => {
    if (!v) {
      setMonth(null);
      setYear(null);
    } else {
      setMonth(v.month() + 1);
      setYear(v.year());
    }
  };

  const markPaid = async (id: number) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/payout/mark-paid/${id}`
      );
      message.success("Đã đánh dấu chi trả!");
      fetchData();
    } catch (err) {
      message.error("Không thể đánh dấu chi trả.");
    }
  };

  const columns = [
    { title: "Giảng viên", dataIndex: "teacher", render: (t: any) => t?.firstName + " " + t?.lastName },
    { title: "Thu nhập", dataIndex: "totalIncome", render: (v: any) => formatMoney(v) },
    { title: "Thuế (10%)", dataIndex: "taxAmount", render: (v: any) => formatMoney(v) },
    { title: "Thực nhận", dataIndex: "netIncome", render: (v: any) => formatMoney(v) },
    { title: "Tài khoản", dataIndex: "bankAccountNumber" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) =>
        s === "Paid" ? <Tag color="green">Đã trả</Tag> : <Tag color="orange">Chờ trả</Tag>,
    },
    {
      title: "Hành động",
      render: (row: any) =>
        row.status === "Paid" ? (
          <Button disabled>Đã trả</Button>
        ) : (
          <Button type="primary" onClick={() => markPaid(row.payoutId)}>
            Đánh dấu đã trả
          </Button>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">💰 Danh sách chi trả nhuận bút</h2>

      <Card className="p-4 shadow-sm">
        <MonthPicker placeholder="Chọn tháng" onChange={onMonthChange} />
      </Card>

      <Card className="shadow-sm">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey="payoutId"
        />
      </Card>
    </div>
  );
}
