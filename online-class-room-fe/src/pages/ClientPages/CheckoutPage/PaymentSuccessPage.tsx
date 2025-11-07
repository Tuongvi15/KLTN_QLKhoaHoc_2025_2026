import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';

// ==========================
//  ✅ Payment Success Page
// ==========================
export const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(30);
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        const orderCode = searchParams.get("orderCode");
        if (!orderCode) {
            navigate("/payment-failed?errorMessage=Thiếu mã đơn hàng");
            return;
        }

        // 1️⃣ Lấy thông tin đơn hàng từ PayOS
        fetch(`https://localhost:7005/api/payos/GetOrderByPayOS?orderCode=${orderCode}`)
            .then((res) => res.json())
            .then(async (res) => {
                console.log("Response từ PayOS:", res); // 🧠 debug thật dữ
                // Nếu res có status hoặc orderCode -> coi như hợp lệ
                if (res?.status === "PAID" || res?.orderCode) {
                    setPaymentData(res); // <---- sửa dòng này
                    await fetch(`https://localhost:7005/api/payos/ConfirmPayment?orderCode=${orderCode}&status=Completed`, {
                        method: "POST",
                    });
                } else {
                    navigate(`/payment-failed?orderCode=${orderCode}&errorMessage=Không tìm thấy đơn hàng hoặc chưa thanh toán`);
                }
            })

            .catch(() => {
                navigate(`/payment-failed?orderCode=${orderCode}&errorMessage=Lỗi khi kiểm tra trạng thái thanh toán`);
            });
    }, [searchParams, navigate]);

    // Auto redirect sau 30s
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    if (!paymentData)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600 text-lg">Đang xử lý thanh toán...</p>
            </div>
        );

    const { amount, description, orderCode } = paymentData;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_0.6s_ease-out]">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-10 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h1>
                    <p className="text-white/90">Mã đơn hàng: {orderCode}</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Sản phẩm</span>
                            <span className="font-semibold">{description || "Khóa học trực tuyến"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Số tiền</span>
                            <span className="font-bold text-purple-600">{formatCurrency(amount)}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-center mb-6 text-white">
                        <p className="text-lg font-semibold mb-2">Cảm ơn bạn đã thanh toán!</p>
                        <p>Hãy bắt đầu học ngay bây giờ 🌟</p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            Tự động chuyển về trang chủ sau{" "}
                            <span className="bg-purple-600 text-white px-2 py-1 rounded">{countdown}</span> giây
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            Về trang chủ ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PaymentSuccessPage;