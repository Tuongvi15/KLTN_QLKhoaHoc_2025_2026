import { useEffect } from "react";
import { Table, Button, Tag, message } from "antd";
import {
  useGetPendingTeachersQuery,
  useApproveTeacherMutation,
} from "../../../services/account.services";

export default function ApproveTeacherPage() {
  const { data: list, isLoading, refetch } = useGetPendingTeachersQuery();
  const [approveTeacher] = useApproveTeacherMutation();

  const approve = async (id: string) => {
    try {
      await approveTeacher({ accountId: id, status: "Active" }).unwrap();
      message.success("Đã duyệt giảng viên!");
      refetch();
    } catch {
      message.error("Lỗi khi duyệt giảng viên!");
    }
  };

  const columns = [
    {
      title: "Tên",
      render: (_: any, r: any) => r.firstName + " " + r.lastName,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Trạng thái",
      render: () => <Tag color="orange">Đang chờ duyệt</Tag>,
    },
    {
      title: "Hành động",
      render: (_: any, r: any) => (
        <Button type="primary" onClick={() => approve(r.id)}>
          Duyệt
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4 font-bold text-[#1677ff]">
        Duyệt tài khoản giảng viên
      </h2>

      <Table
        rowKey="id"
        dataSource={list || []}
        loading={isLoading}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
