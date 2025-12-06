import { Modal, Input, message } from "antd";
import React, { useState } from "react";
import { useSendReportMutation } from "../../services/reportProblem.services";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface ReportPopupProps {
    open: boolean;
    onClose: () => void;
    type: "Article" | "Comment";
    articleId?: number | null;
    commentId?: number | null;
}

export default function ReportPopup({
    open,
    onClose,
    type,
    articleId,
    commentId,
}: ReportPopupProps) {

    const [reason, setReason] = useState("");
    const [sendReport] = useSendReportMutation();

    // ⭐ LẤY USER ID CHUẨN DỰ ÁN
    const accountId = useSelector((state: RootState) => state.user.id);

    const handleSend = async () => {
        if (!reason.trim()) {
            message.error("Vui lòng nhập lý do báo cáo");
            return;
        }

        try {
            await sendReport({
                type,
                title: "Báo cáo vi phạm",
                description: reason,
                articleId: type === "Article" ? articleId ?? undefined : undefined,
                commentId: type === "Comment" ? commentId ?? undefined : undefined,
                accountId, // ⭐ GIỜ LUÔN ĐÚNG
            }).unwrap();

            message.success("Đã gửi báo cáo thành công!");
            setReason("");
            onClose();

        } catch (err) {
            console.error(err);
            message.error("Không thể gửi báo cáo");
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleSend}
            okText="Gửi báo cáo"
            cancelText="Hủy"
            centered
            okButtonProps={{
                style: { backgroundColor: "#b43747ff", borderColor: "#b43747ff" },
            }}
            cancelButtonProps={{
                style: { borderColor: "#9ca3af" },
            }}
        >
            <h2 className="text-lg font-bold mb-3">
                Báo cáo {type === "Article" ? "bài viết" : "bình luận"}
            </h2>

            <Input.TextArea
                rows={4}
                placeholder="Nhập lý do báo cáo..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
        </Modal>
    );
}
