import { useState } from "react";
import { Card, DatePicker, Button, message } from "antd";
import axios from "axios";
const { MonthPicker } = DatePicker;

export default function GeneratePayoutPage() {
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const applyGenerate = async () => {
    if (!month || !year) {
      message.warning("Vui lòng chọn tháng");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/payout/generate`,
        {},
        { params: { month, year } }
      );
      message.success("Đã tạo danh sách chi trả!");
    } catch (err) {
      message.error("Lỗi khi tạo danh sách chi trả");
    }
  };

  const onMonthChange = (v: any) => {
    if (!v) {
      setMonth(null);
      setYear(null);
    } else {
      setMonth(v.month() + 1);
      setYear(v.year());
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📅 Tính nhuận bút theo tháng</h2>

      <Card className="shadow-sm p-4 max-w-lg">
        <MonthPicker className="mb-4" onChange={onMonthChange} placeholder="Chọn tháng" />

        <Button
          type="primary"
          size="large"
          className="bg-blue-600"
          onClick={applyGenerate}
        >
          Tính nhuận bút
        </Button>
      </Card>
    </div>
  );
}
