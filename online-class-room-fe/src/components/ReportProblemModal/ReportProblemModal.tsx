import { Modal, Button, Tag, message } from "antd";
import {
  useGetReportDetailQuery,
  useResolveReportMutation,
} from "../../services/reportProblem.services";

interface ReportProblemModalProps {
  reportId: number;
  open: boolean;
  onClose: () => void;
  refetchList: () => void;
}

export default function ReportProblemModal({
  reportId,
  open,
  onClose,
  refetchList,
}: ReportProblemModalProps) {
  const { data, isLoading } = useGetReportDetailQuery(reportId);
  const [resolveReport] = useResolveReportMutation();

  const handleResolve = async (status: "DeleteContent" | "Reject") => {
    try {
      await resolveReport({
        reportId,
        status,
        adminResponse:
          status === "Reject" ? "Không vi phạm" : "Nội dung đã bị xóa",
      }).unwrap();

      message.success("Xử lý thành công!");
      refetchList();
      onClose();
    } catch (e) {
      console.error(e);
      message.error("Lỗi xử lý report");
    }
  };

  return (
    <Modal open={open} footer={null} onCancel={onClose} width={900}>
      <h2 className="text-xl font-bold mb-3">Báo cáo #{reportId}</h2>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Tag color="blue">{data?.type}</Tag>
            <Tag color="purple">{data?.reportStatus}</Tag>
          </div>

          {/* ⭐ LÝ DO BÁO CÁO */}
          {data?.description && (
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <p className="font-semibold text-red-600">Lý do báo cáo:</p>
              <p className="mt-1">{data.description}</p>
            </div>
          )}

          {/* NỘI DUNG BÀI VIẾT */}
          {data?.article && (
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-bold text-lg">{data.article.title}</h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: data.article.contentHtml,
                }}
              ></div>
            </div>
          )}

          {/* NỘI DUNG COMMENT */}
          {data?.comment && (
            <div className="bg-gray-50 p-4 rounded border">
              <p>
                <b>Bình luận:</b> {data.comment.content}
              </p>
              <p className="text-sm text-gray-500">
                (Thuộc bài viết: {data.comment.article?.title})
              </p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          {data?.reportStatus === "Pending" && (
            <div className="flex gap-3 mt-4">
              <Button danger onClick={() => handleResolve("DeleteContent")}>
                Xóa nội dung
              </Button>

              <Button onClick={() => handleResolve("Reject")}>
                Từ chối báo cáo
              </Button>
            </div>
          )}

          {data?.reportStatus !== "Pending" && (
            <div className="mt-4 text-gray-500 italic">
              Báo cáo đã được xử lý — không thể thao tác thêm.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
