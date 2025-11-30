import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tag, DatePicker, Card, Descriptions, Row, Col, Statistic, Space } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
    DollarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    BankOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface TeacherPayoutItem {
    payoutId: number;
    month: number;
    year: number;
    pendingAmount: number;
    availableAmount: number;
    netAmount: number;
    status: string;
}

interface TeacherPayoutDetail {
    teacherName: string;
    teacherEmail: string;
    totalGross: number;
    pendingAmount: number;
    availableAmount: number;
    taxAmount: number;
    netAmount: number;
    bank: {
        bankName: string;
        accountNumber: string;
    } | null;
}

export default function TeacherPayoutPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TeacherPayoutItem[]>([]);
    const [detail, setDetail] = useState<TeacherPayoutDetail | null>(null);
    const [openDetail, setOpenDetail] = useState(false);
    const teacherId = useSelector((state: RootState) => state.user.id);
    const [openRuleModal, setOpenRuleModal] = useState(false);

    const now = dayjs();
    const [month, setMonth] = useState(now.month() + 1);
    const [year, setYear] = useState(now.year());

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://qlkhtt-backend-production.up.railway.app/api/payout/teacher/${teacherId}`);
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const fetchDetail = async (id: number) => {
        const res = await axios.get(`https://qlkhtt-backend-production.up.railway.app/api/payout/teacher/detail/${id}`);
        setDetail(res.data);
        setOpenDetail(true);
    };

    const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

    // Calculate statistics
    const totalPending = data.reduce((sum, item) => sum + item.pendingAmount, 0);
    const totalAvailable = data.reduce((sum, item) => sum + item.availableAmount, 0);
    const totalNet = data.reduce((sum, item) => sum + item.netAmount, 0);
    const withdrawnCount = data.filter(item => item.status === "Withdrawn").length;

    const columns = [
        {
            title: "Kỳ chi trả",
            key: "period",
            render: (_: any, record: TeacherPayoutItem) => (
                <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-blue-500" />
                    <span className="font-medium">
                        Tháng {record.month}/{record.year}
                    </span>
                </div>
            ),
            width: 150,
        },
        {
            title: "Chờ xử lý",
            dataIndex: "pendingAmount",
            render: (v: number) => (
                <span className="text-orange-600 font-medium">{formatMoney(v)}</span>
            ),
            align: 'right' as const,
        },
        {
            title: "Có thể rút",
            dataIndex: "availableAmount",
            render: (v: number) => (
                <span className="text-green-600 font-medium">{formatMoney(v)}</span>
            ),
            align: 'right' as const,
        },
        {
            title: "Thực nhận",
            dataIndex: "netAmount",
            render: (v: number) => (
                <span className="text-blue-600 font-semibold text-base">{formatMoney(v)}</span>
            ),
            align: 'right' as const,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s: string) => (
                <Tag
                    icon={s === "Withdrawn" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={s === "Withdrawn" ? "success" : "processing"}
                >
                    {s === "Withdrawn" ? "Đã chi trả" : "Đang xử lý"}
                </Tag>
            ),
            align: 'center' as const,
        },
        {
            title: "Thao tác",
            render: (_: any, r: TeacherPayoutItem) => (
                <Button
                    type="primary"
                    ghost
                    icon={<EyeOutlined />}
                    onClick={() => fetchDetail(r.payoutId)}
                >
                    Chi tiết
                </Button>
            ),
            align: 'center' as const,
            width: 120,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">Chi trả nhuận bút</h1>

                        <QuestionCircleOutlined
                            className="text-blue-500 cursor-pointer"
                            onClick={() => setOpenRuleModal(true)}
                        />
                    </div>
                    <p className="text-gray-600">Theo dõi và quản lý các khoản chi trả từ hệ thống</p>
                </div>

                {/* Filter */}
                <Card className="mb-6 shadow-sm">
                    <Space size="middle">
                        <DatePicker
                            picker="month"
                            defaultValue={dayjs()}
                            onChange={(d) => {
                                if (!d) return;
                                setMonth(d.month() + 1);
                                setYear(d.year());
                            }}
                            size="large"
                            placeholder="Chọn tháng"
                        />
                        <Button
    type="primary"
    icon={<ReloadOutlined />}
    onClick={fetchData}
    size="large"
    className="bg-blue-600 hover:bg-blue-700 text-white"
>
    Làm mới
</Button>

                    </Space>
                </Card>

                {/* Statistics */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Chờ xử lý"
                                value={totalPending}
                                prefix={<ClockCircleOutlined className="text-orange-500" />}
                                suffix="đ"
                                valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                                formatter={(value) => value.toLocaleString('vi-VN')}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Có thể rút"
                                value={totalAvailable}
                                prefix={<DollarOutlined className="text-green-500" />}
                                suffix="đ"
                                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                                formatter={(value) => value.toLocaleString('vi-VN')}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Tổng thực nhận"
                                value={totalNet}
                                prefix={<CheckCircleOutlined className="text-blue-500" />}
                                suffix="đ"
                                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                                formatter={(value) => value.toLocaleString('vi-VN')}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Đã chi trả"
                                value={withdrawnCount}
                                prefix={<CheckCircleOutlined className="text-purple-500" />}
                                suffix="lần"
                                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Table */}
                <Card className="shadow-sm">
                    <Table
                        loading={loading}
                        columns={columns}
                        dataSource={data}
                        rowKey="payoutId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} kỳ chi trả`
                        }}
                        className="payout-table"
                    />
                </Card>

                {/* Detail Modal */}
                <Modal
                    open={openDetail}
                    onCancel={() => setOpenDetail(false)}
                    footer={null}
                    title={
                        <Space>
                            <DollarOutlined className="text-blue-500" />
                            <span>Chi tiết chi trả</span>
                        </Space>
                    }
                    width={700}
                >
                    {detail && (
                        <div className="pt-4">
                            {/* Teacher Info */}
                            <Card className="mb-4 bg-blue-50 border-blue-200">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Giảng viên">
                                        <span className="font-semibold">{detail.teacherName}</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {detail.teacherEmail}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            {/* Financial Details */}
                            <Card className="mb-4">
                                <h3 className="text-base font-semibold mb-4">Thông tin tài chính</h3>
                                <Space direction="vertical" size="middle" className="w-full">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-gray-600">Tổng doanh thu:</span>
                                        <span className="font-semibold text-lg">{formatMoney(detail.totalGross)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                                        <span className="text-gray-600">Chờ xử lý:</span>
                                        <span className="font-semibold text-orange-600">{formatMoney(detail.pendingAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                                        <span className="text-gray-600">Có thể rút:</span>
                                        <span className="font-semibold text-green-600">{formatMoney(detail.availableAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                                        <span className="text-gray-600">Thuế (10%):</span>
                                        <span className="font-semibold text-red-600">-{formatMoney(detail.taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-blue-100 rounded border-2 border-blue-300">
                                        <span className="font-semibold text-gray-800">Thực nhận:</span>
                                        <span className="font-bold text-blue-700 text-xl">{formatMoney(detail.netAmount)}</span>
                                    </div>
                                </Space>
                            </Card>

                            {/* Bank Info */}
                            {detail.bank && (
                                <Card className="bg-green-50 border-green-200">
                                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                        <BankOutlined className="text-green-600" />
                                        Thông tin ngân hàng
                                    </h3>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Ngân hàng">
                                            <span className="font-semibold">{detail.bank.bankName}</span>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Số tài khoản">
                                            <span className="font-mono font-semibold">{detail.bank.accountNumber}</span>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            )}
                        </div>
                    )}
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

            <style>{`
                .payout-table .ant-table-thead > tr > th {
                    background-color: #fafafa;
                    font-weight: 600;
                }
                .payout-table .ant-table-tbody > tr:hover {
                    background-color: #f5f5f5;
                }
            `}</style>
        </div>
    );
}