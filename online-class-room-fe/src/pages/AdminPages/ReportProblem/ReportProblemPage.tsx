import { Table, Tag, Button } from "antd";
import { useState } from "react";
import { useGetAllReportsQuery } from "../../../services/reportProblem.services";
import ReportProblemModal from "../../../components/ReportProblemModal/ReportProblemModal";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);

export default function ReportProblemPage() {
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 20;

    const { data, isLoading, refetch } = useGetAllReportsQuery({
        pageNumber,
        pageSize,
    });

    const reports = data?.data ?? [];
    const pagination = data?.pagination ?? {};

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const mapStatus = (status: string) => {
        switch (status) {
            case "Pending": return "Chờ xử lý";
            case "Resolved": return "Đã xử lý";
            case "Rejected": return "Đã từ chối";
            default: return status;
        }
    };
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const columns = [
        {
            title: "STT",
            render: (_: any, __: any, index: number) =>
                (pageNumber - 1) * pageSize + (index + 1),
            width: 70
        },
        { title: "Người báo cáo", dataIndex: "reporterName" },

        {
            title: "Loại",
            dataIndex: "type",
            render: (t: string) => (
                <Tag color={t === "Article" ? "blue" : "purple"}>
                    {t === "Article" ? "Bài viết" : "Bình luận"}
                </Tag>
            ),
        },

        { title: "Tiêu đề", dataIndex: "title" },

        {
            title: "Ngày tạo",
            dataIndex: "createDate",
            render: (date: string | null) =>
                date
                    ? dayjs(date).format("DD/MM/YYYY HH:mm")
                    : "—"
        },


        {
            title: "Trạng thái",
            dataIndex: "reportStatus",
            render: (s: string) => (
                <Tag color={
                    s === "Pending" ? "orange" :
                        s === "Resolved" ? "green" :
                            "red"
                }>
                    {mapStatus(s)}
                </Tag>
            ),
        },

        {
            title: "Hành động",
            render: (_: any, row: any) => (
                <>
                    {/* Luôn có nút xem chi tiết */}
                    <Button type="link" onClick={() => setSelectedId(row.reportId)}>
                        Xem chi tiết
                    </Button>
                </>
            )
        }
        ,
    ];

    return (
        <div className="p-5 min-h-screen flex flex-col">
            <h1 className="text-xl font-bold mb-4">Quản lý báo cáo</h1>

            <Table
                loading={isLoading}
                columns={columns}
                dataSource={reports}
                rowKey="reportId"
                pagination={{
                    current: pagination.CurrentPage,
                    total: pagination.TotalCount,
                    pageSize: pagination.PageSize,
                    onChange: (page) => setPageNumber(page),
                    position: ["bottomCenter"],
                }}
            />

            {selectedId && (
                <ReportProblemModal
                    reportId={selectedId}
                    open={!!selectedId}
                    refetchList={refetch}
                    onClose={() => setSelectedId(null)}
                />
            )}
        </div>
    );
}
