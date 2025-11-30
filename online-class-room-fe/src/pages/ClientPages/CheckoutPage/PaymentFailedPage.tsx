import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';

export const PaymentFailedPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [failureData, setFailureData] = useState<any>(null);

    useEffect(() => {
        const orderCode = searchParams.get("orderCode");
        const errorMessage = searchParams.get("errorMessage") || "Thanh toán thất bại";

        setFailureData({ orderCode, errorMessage });

        // Gọi API cập nhật trạng thái đơn hàng là Cancelled
        if (orderCode) {
            fetch(`https://qlkhtt-backend-production.up.railway.app/api/payos/ConfirmPayment?orderCode=${orderCode}&status=Cancelled`, {
                method: "POST",
            });
        }
    }, [searchParams]);

    if (!failureData)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600 text-lg">Đang xử lý kết quả thanh toán...</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-pink-600 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_0.6s_ease-out]">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-10 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thất bại!</h1>
                    <p className="text-white/90">{failureData.errorMessage}</p>
                </div>

                <div className="p-8 space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-red-500 p-5 rounded-lg">
                        <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Lỗi giao dịch</h3>
                        <p className="text-yellow-700 text-sm">
                            Mã đơn hàng: {failureData.orderCode || "Không xác định"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/courses")}
                            className="w-full bg-white text-purple-600 font-semibold px-6 py-4 rounded-xl border-2 border-purple-600 hover:bg-gray-50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại khóa học
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-white text-gray-600 font-semibold px-6 py-4 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PaymentFailedPage;