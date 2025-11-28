import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { Divider, Typography, Collapse } from "antd";
import { Button } from "@mui/material";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { secondsToTimeString, FormatType } from "../../../utils/TimeFormater";
import { formatNumberWithCommas } from "../../../utils/NumberFormater";
import { useState } from "react";

const { Panel } = Collapse;

const PaymentPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { CourseData, addOrderRespone } = useSelector(
        (state: RootState) => state.order.preOrderData
    );
    const [loading, setLoading] = useState(false);

    const handlePayWithPayOS = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://localhost:7005/api/payos/CreatePaymentLink?orderId=${addOrderRespone.orderId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Không thể tạo link thanh toán");
            }

            const checkoutUrl = await response.text();
            window.location.href = checkoutUrl;
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="w-full flex justify-start px-10 mt-4">
                <Button
                    variant="text"
                    startIcon={<KeyboardArrowLeftOutlinedIcon />}
                    onClick={() => navigate("/courses/" + CourseData.courseId)}
                    className="!text-[#007fff] !font-medium hover:!bg-blue-50"
                >
                    Quay lại
                </Button>
            </div>


            <div className="min-w-screen flex grow justify-center pb-20">
                <div className="w-[50%] bg-[#f8fafb] px-10 py-10">
                    <div className="flex flex-col gap-8">
                        <p className="text-2xl font-bold text-[#007fff]">
                            Khóa học {CourseData.title}
                        </p>

                        <div className="flex gap-8">
                            <div className="max-w-[350px]">
                                <img src={CourseData.imageUrl} alt="" />
                            </div>

                            <div>
                                <Typography.Title className="!text-[#007fff]" level={5}>
                                    Khóa học này bao gồm:
                                </Typography.Title>

                                <div className="mt-3 flex flex-col gap-2 text-sm">
                                    <div className="flex items-center">
                                        <OndemandVideoIcon className="mr-4" fontSize="inherit" />
                                        <p>
                                            {secondsToTimeString(
                                                CourseData.totalDuration,
                                                FormatType.HH_MM,
                                                [" giờ", " phút"]
                                            )}{" "}
                                            thời gian học
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <PhoneAndroidIcon className="mr-4" fontSize="inherit" />
                                        <p>Có thể truy cập bằng điện thoại</p>
                                    </div>

                                    <div className="flex items-center">
                                        <AllInclusiveIcon className="mr-4" fontSize="inherit" />
                                        <p>Truy cập trọn đời</p>
                                    </div>

                                    <div className="flex items-center">
                                        <EmojiEventsOutlinedIcon className="mr-4" fontSize="inherit" />
                                        <p>Cấp chứng chỉ khi hoàn thành khóa học</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider
                            orientation="center"
                            className="!text-[#007fff]"
                            type="horizontal"
                        >
                            Khóa học này sẽ giúp bạn cải thiện
                        </Divider>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            {CourseData.knowdledgeDescription
                                .split("|")
                                .filter((value) => value.trim().length > 0)
                                .map((text, index) => (
                                    <div key={index} className="flex items-center gap-2 text-base">
                                        <CheckOutlinedIcon fontSize="inherit" />
                                        <span className="text-[14px]">{text}</span>
                                    </div>
                                ))}
                        </div>

                        {/* Quy trình thanh toán */}
                        <div className="mt-8">
                            <Typography.Title level={5} className="!text-[#007fff]">
                                Quy trình thanh toán
                            </Typography.Title>
                            <div className="flex items-center justify-between mt-6 px-4">
                                <div className="text-center flex-1">
                                    <div className="bg-[#007fff] text-white rounded-full w-14 h-14 flex items-center justify-center mx-auto text-xl font-bold shadow-md">
                                        1
                                    </div>
                                    <p className="text-sm mt-3 font-medium">Xác nhận đơn hàng</p>
                                </div>
                                <div className="flex-1 h-1 bg-gradient-to-r from-[#007fff] to-gray-300 mx-2" />
                                <div className="text-center flex-1">
                                    <div className="bg-gray-300 text-gray-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-xl font-bold">
                                        2
                                    </div>
                                    <p className="text-sm mt-3 font-medium text-gray-600">Thanh toán PayOS</p>
                                </div>
                                <div className="flex-1 h-1 bg-gray-300 mx-2" />
                                <div className="text-center flex-1">
                                    <div className="bg-gray-300 text-gray-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-xl font-bold">
                                        3
                                    </div>
                                    <p className="text-sm mt-3 font-medium text-gray-600">Truy cập khóa học</p>
                                </div>
                            </div>
                        </div>

                        {/* Chính sách & Hỗ trợ */}
                        <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-sm">
                            <Typography.Title level={5} className="!text-[#007fff] !mb-6">
                                Chính sách & Hỗ trợ
                            </Typography.Title>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <LockOutlinedIcon className="text-[#007fff] mt-1" fontSize="small" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Bảo mật thanh toán</p>
                                        <p className="text-sm text-gray-600 mt-1">Thanh toán được mã hóa SSL 256-bit</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ReplayOutlinedIcon className="text-[#007fff] mt-1" fontSize="small" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Chính sách hoàn tiền</p>
                                        <p className="text-sm text-gray-600 mt-1">Hoàn tiền 100% trong 7 ngày đầu</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <SupportAgentOutlinedIcon className="text-[#007fff] mt-1" fontSize="small" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Hỗ trợ 24/7</p>
                                        <p className="text-sm text-gray-600 mt-1">Liên hệ: support@studyhub.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <VerifiedOutlinedIcon className="text-[#007fff] mt-1" fontSize="small" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Đảm bảo chất lượng</p>
                                        <p className="text-sm text-gray-600 mt-1">Cam kết nội dung chất lượng cao</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Câu hỏi thường gặp */}
                        <div className="mt-8 mb-8">
                            <Typography.Title level={5} className="!text-[#007fff] !mb-4">
                                Câu hỏi thường gặp
                            </Typography.Title>
                            <Collapse
                                className="bg-white shadow-sm"
                                bordered={false}
                            >
                                <Panel
                                    header="Làm thế nào để truy cập khóa học sau khi thanh toán?"
                                    key="1"
                                    className="!border-b"
                                >
                                    <p className="text-gray-700">
                                        Sau khi thanh toán thành công, khóa học sẽ tự động xuất hiện trong mục
                                        <span className="font-semibold text-[#007fff]"> "Khóa học của tôi"</span>.
                                        Bạn có thể bắt đầu học ngay lập tức.
                                    </p>
                                </Panel>
                                <Panel
                                    header="Tôi có thể học trên nhiều thiết bị không?"
                                    key="2"
                                    className="!border-b"
                                >
                                    <p className="text-gray-700">
                                        Có, bạn có thể học trên mọi thiết bị (máy tính, tablet, điện thoại) với cùng một tài khoản.
                                        Tiến độ học sẽ được đồng bộ tự động.
                                    </p>
                                </Panel>
                                <Panel
                                    header="Chứng chỉ có giá trị như thế nào?"
                                    key="3"
                                    className="!border-b"
                                >
                                    <p className="text-gray-700">
                                        Chứng chỉ của eStudyHub.
                                        Bạn có thể thêm chứng chỉ vào CV hoặc LinkedIn profile.
                                    </p>
                                </Panel>
                                <Panel
                                    header="Nếu có vấn đề kỹ thuật thì làm sao?"
                                    key="4"
                                >
                                    <p className="text-gray-700">
                                        Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7. Bạn có thể liên hệ qua email
                                        <span className="font-semibold"> support@studyhub.com</span> hoặc chat trực tiếp trên website.
                                    </p>
                                </Panel>
                            </Collapse>
                        </div>
                    </div>
                </div>

                <div className="flex w-[30%] flex-col bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 py-5 text-center">
                        <h3 className="text-2xl font-bold text-white tracking-wide">Thanh toán chi tiết</h3>
                    </div>

                    {/* Nội dung */}
                    <div className="flex flex-col gap-6 p-6">
                        {/* Giá gốc + Giảm giá */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Giá gốc:</span>
                                <span className="text-gray-800 font-semibold">
                                    {formatNumberWithCommas(CourseData.price)} VND
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Giảm giá:</span>
                                <span className="text-green-600 font-semibold">
                                    {Math.round(CourseData.salesCampaign * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Phương thức thanh toán:</span>
                                <div className="flex items-center gap-2 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg">
                                    <img
                                        src="data:image/png;base64,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"
                                        alt="PayOS"
                                        className="h-6 w-auto object-contain"
                                    />
                                    <span className="text-blue-600 font-medium text-sm">PayOS</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200" />

                        {/* Tổng cộng */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                            <div className="text-lg font-semibold text-gray-700">Tổng cộng:</div>
                            <div className="text-2xl font-extrabold text-blue-700">
                                {formatNumberWithCommas(
                                    CourseData.price - CourseData.price * CourseData.salesCampaign
                                )}{" "}
                                VND
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-700">
                                💡 <span className="font-semibold">Lưu ý:</span> Sau khi thanh toán, bạn sẽ được chuyển về
                                trang xác nhận. Vui lòng không đóng trình duyệt trong quá trình thanh toán.
                            </p>
                        </div>

                        {/* Nút thanh toán */}
                        <Button
                            variant="contained"
                            color="primary"
                            className="!mt-4 !py-3 !text-base !font-semibold !bg-blue-600 hover:!bg-blue-700 transition-all duration-200"
                            onClick={handlePayWithPayOS}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? "Đang tạo link thanh toán..." : "Thanh toán với PayOS"}
                        </Button>

                        {/* Điều khoản */}
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Bằng việc thanh toán, bạn đồng ý với{" "}
                            <span className="text-blue-600 cursor-pointer hover:underline">
                                Điều khoản sử dụng
                            </span>{" "}
                            của eStudyHub
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentPage;