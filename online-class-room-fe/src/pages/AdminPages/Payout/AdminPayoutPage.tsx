import { useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Table,
  Button,
  Tag,
  Modal,
  message,
  Spin,
} from "antd";
import axios from "axios";
import { QuestionCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";


const { MonthPicker } = DatePicker;

export default function AdminPayoutPage() {
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());

  const [loading, setLoading] = useState(false);
  const [payoutList, setPayoutList] = useState<any[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [openRuleModal, setOpenRuleModal] = useState(false);

  const formatMoney = (v: number) =>
    (v || 0).toLocaleString("vi-VN") + " đ";
  // Load bảng chi trả ngay khi mở trang
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch payout list
  const fetchData = async (m = month, y = year) => {
  if (!m || !y) return;

  setLoading(true);
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/payout/list`,
      { params: { month: m, year: y } }
    );
    setPayoutList(res.data);
  } finally {
    setLoading(false);
  }
};


  const onMonthChange = (v: any) => {
  if (!v) return;

  const newMonth = v.month() + 1;
  const newYear = v.year();

  setMonth(newMonth);
  setYear(newYear);

  // GỌI API NGAY SAU KHI CHỌN
  fetchData(newMonth, newYear);
};



  // Generate payout (admin click)
  const generatePayout = async () => {
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
      message.success("Đã tạo danh sách chi trả");
      fetchData();
    } catch {
      message.error("Không thể tạo danh sách chi trả");
    }
  };

  // Open popup detail
  const openDetail = async (id: number) => {
    setPopupLoading(true);
    setPopupOpen(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/payout/detail/${id}`
      );
      setPopupData(res.data);
    } catch {
      message.error("Không tải được chi tiết payout");
      setPopupOpen(false);
    } finally {
      setPopupLoading(false);
    }
  };

  // Mark paid
  const markPaid = async () => {
    if (!popupData) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/payout/mark-paid/${popupData.payoutId}`
      );
      message.success("Đã chi trả thành công");
      setPopupOpen(false);
      fetchData();
    } catch {
      message.error("Không thể chi trả");
    }
  };

  // Table columns
  const columns = [
    { title: "Giảng viên", dataIndex: "teacherName" },
    {
      title: "Gross",
      dataIndex: "totalGross",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Pending",
      dataIndex: "pendingAmount",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Available",
      dataIndex: "availableAmount",
      render: (v: number) => (
        <span className="font-bold text-green-600">
          {formatMoney(v)}
        </span>
      ),
    },
    {
      title: "Thuế",
      dataIndex: "taxAmount",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Thực nhận",
      dataIndex: "netAmount",
      render: (v: number) => (
        <span className="font-bold text-blue-600">
          {formatMoney(v)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => {
        if (s === "Withdrawn") return <Tag color="green">Đã trả</Tag>;
        if (s === "Locked") return <Tag color="red">Locked</Tag>;
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (row: any) => (
        <Button
          type="primary"
          disabled={row.status === "Withdrawn"}
          style={{
            backgroundColor: "#1677ff",   // màu bạn muốn
            borderColor: "#1677ff"
          }}
          onClick={() => openDetail(row.payoutId)}
        >
          Chi trả
        </Button>

      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Chi trả nhuận bút</h1>

        <QuestionCircleOutlined
          className="text-blue-500 cursor-pointer"
          onClick={() => setOpenRuleModal(true)}
        />
      </div>


      {/* Bộ lọc */}
      <Card className="shadow-sm p-4">
        <div className="flex items-center gap-4">
          <MonthPicker
            placeholder="Chọn tháng"
            defaultValue={dayjs()}   // <--- thêm dòng này
            onChange={onMonthChange}
          />


          <Button
            type="primary"
            className="bg-blue-600"
            onClick={generatePayout}
          >
            Tạo bảng chi trả
          </Button>

          {month && year && (
            <Tag color="blue">
              Tháng {month}/{year}
            </Tag>
          )}
        </div>
      </Card>

      {/* Bảng payout */}
      <Card className="shadow-sm">
        <Table
          loading={loading}
          columns={columns}
          dataSource={payoutList}
          rowKey="payoutId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Popup chi trả */}
      <Modal
        open={popupOpen}
        onCancel={() => setPopupOpen(false)}
        footer={null}
        width={650}
        title="Chi trả nhuận bút"
      >
        {popupLoading ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : popupData ? (
          <div className="space-y-4">
            {/* Info teacher */}
            <Card size="small">
              <h3 className="font-bold mb-2">👨‍🏫 Thông tin giảng viên</h3>
              <p><b>Họ tên:</b> {popupData.teacherName}</p>
              <p><b>Email:</b> {popupData.teacherEmail}</p>
            </Card>

            {/* Bank */}
            <Card size="small">
              <h3 className="font-bold mb-2">🏦 Tài khoản ngân hàng</h3>
              {popupData.bank ? (
                <>
                  <p><b>Ngân hàng:</b> {popupData.bank.bankName}</p>
                  <p><b>Số tài khoản:</b> {popupData.bank.accountNumber}</p>
                  <p><b>Chủ tài khoản:</b> {popupData.bank.accountHolderName}</p>
                  <p><b>Chi nhánh:</b> {popupData.bank.branch}</p>
                </>
              ) : (
                <p className="text-red-500">Giảng viên chưa thêm tài khoản ngân hàng.</p>
              )}
            </Card>

            {/* Payment summary */}
            <Card size="small">
              <h3 className="font-bold mb-2">💰 Chi tiết chi trả</h3>

              <p><b>Gross:</b> {formatMoney(popupData.totalGross)}</p>
              <p><b>Pending:</b> {formatMoney(popupData.pendingAmount)}</p>
              <p><b>Available:</b> {formatMoney(popupData.availableAmount)}</p>
              <p><b>Thuế (10%):</b> {formatMoney(popupData.taxAmount)}</p>
              <p><b>Thực nhận:</b> <span className="text-green-600 font-bold">
                {formatMoney(popupData.netAmount)}
              </span></p>

              <p><b>Chu kỳ:</b> {popupData.month}/{popupData.year}</p>
              <p><b>Tổng đơn:</b> {popupData.totalOrders}</p>
              <p><b>Tổng khóa học:</b> {popupData.totalCourses}</p>
            </Card>

            {/* Action */}
            <div className="text-right">
              <Button
                type="primary"
                className="bg-blue-600"
                disabled={
                  !popupData.bank ||
                  popupData.status === "Withdrawn" ||
                  popupData.availableAmount <= 0
                }
                onClick={markPaid}
              >
                Xác nhận chi trả
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal
        title="📘 Lưu ý khi Chi trả nhuận bút"
        open={openRuleModal}
        onCancel={() => setOpenRuleModal(false)}
        footer={null}
      >
        <ul className="list-disc pl-5 space-y-2">
          <li>Giảng viên phải liên kết <b>tài khoản ngân hàng</b> trước khi yêu cầu chi trả.</li>

          <li>Doanh thu khóa học được chuyển vào trạng thái <b>Pending</b> trong 30 ngày để kiểm soát hoàn tiền và chống gian lận.</li>

          <li>Sau <b>30 ngày</b>, khoản doanh thu sẽ tự động chuyển sang <b>Available</b> và đủ điều kiện rút.</li>

          <li>Khi tạo yêu cầu rút tiền, hệ thống sẽ ghi nhận trạng thái <b>Processing</b> (đang xử lý).</li>

          <li>Sau khi Admin thực hiện chi trả thành công, yêu cầu sẽ chuyển sang <b>Withdrawn</b> (đã thanh toán).</li>

          <li>Các khoản thu nhập từ <b>2.000.000đ trở lên</b> trong chu kỳ sẽ bị khấu trừ <b>10% thuế TNCN tại nguồn</b>.</li>

          <li>Số tiền <b>Thực nhận</b> = Tiền Available – Thuế TNCN (nếu có).</li>

          <li>Thông tin ngân hàng không chính xác sẽ khiến yêu cầu bị từ chối hoặc thất bại.</li>

          <li>Mỗi yêu cầu chi trả chỉ xử lý cho số dư Available tại thời điểm yêu cầu.</li>

          <li>Chi trả được thực hiện <b>từ ngày 1 - 5</b> hằng tháng trong giờ hành chính</li>
        </ul>
      </Modal>


    </div>
  );
}
