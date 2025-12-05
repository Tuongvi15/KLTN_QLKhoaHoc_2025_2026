import { Account } from '../../../../types/Account.type';
import Table, { ColumnType } from 'antd/es/table';
import { Button, Input, Modal, Pagination, Tag, Tooltip, message, Badge, Space } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { PagingParam } from '../../../../types/TableParam';
import { useAccountAll } from '../../../../hooks/useAccountAll';
import { useEffect, useState } from 'react';
import { useDeleteAccountMutation, useGetAccountDetailQuery, useRestoreAccountMutation } from '../../../../services/account.services';

type GetAllAccountProps = {
    pagination: { current: number; total: number };
    displayData: number;
};

const getRoleVietnamese = (role: string): string => {
    switch (role) {
        case 'Admin': return 'Quản trị viên';
        case 'Staff': return 'Nhân viên';
        case 'Student': return 'Học viên';
        case 'Teacher': return 'Giảng viên';
        default: return 'Không xác định';
    }
};
const getRoleColor = (role: string): string => {
    switch (role) {
        case 'Admin': return 'red';
        case 'Staff': return 'orange';
        case 'Student': return 'blue';
        case 'Teacher': return 'green';
        default: return 'default';
    }
};
const columns = ({
    pagination,
    displayData,
    handleDelete,
    handleView,
    openRestoreModal
}: GetAllAccountProps & {
    handleDelete: (id: string) => void,
    handleView: (id: string) => void,
    openRestoreModal: (id: string) => void
}): ColumnType<Account>[] => [


        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, index) => {
                const currentPage = pagination.current;
                const pageSize = displayData;
                const calculatedIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span>{calculatedIndex}</span>
                    </div>
                );
            },
            width: '3%',
        },
        {
            title: 'Tên tài khoản',
            dataIndex: ['firstName', 'lastName'],
            render: (_, record) => (
                <div>
                    <span>{`${record.firstName} ${record.lastName}`}</span>
                </div>
            ),
            width: '10%',
        },
        {
            title: 'Hình đại diện',
            dataIndex: 'profileImg',
            render: (profileImg) => {
                const fallback =
                    profileImg && profileImg !== ""
                        ? profileImg
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // ảnh default

                return (
                    <img
                        src={fallback}
                        alt="Avatar"
                        style={{ width: 50, height: 50, borderRadius: '50%', objectFit: "cover" }}
                    />
                );
            },
            width: '8%',
        }
        ,
        {
            title: 'Email',
            dataIndex: 'email',
            width: '10%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            width: '8%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: '8%',
        },
        {
            title: <div className="font-semibold">Vai trò</div>,
            dataIndex: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)} className="font-medium px-3 py-1">
                    {getRoleVietnamese(role)}
                </Tag>
            ),
            width: '130px',
            align: 'center',
        },
        {
            title: 'Giới tính',
            dataIndex: 'sex',
            render: (sex) => (
                <Tag color={sex === 'Male' ? 'green' : 'blue'}>
                    {sex === 'Male' ? 'Nam' : 'Nữ'}
                </Tag>
            ),
            width: '5%',
        },
        {
            title: <div className="font-semibold">Trạng thái</div>,
            dataIndex: 'status',
            render: (status) => (
                <Tag color={status.trim() === 'Active' ? 'green' : 'red'}>
                    {status.trim() === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
            width: '140px',
        },
        {

            title: 'Hành động',
            dataIndex: 'id',
            render: (_, record) => (
                <Space align="center" size="middle" style={{ justifyContent: "left", width: "100%" }}>
                    <Tooltip title="Xem chi tiết">
                        <Button type="link" onClick={() => handleView(record.id)}>
                            <EyeOutlined style={{ fontSize: 20 }} />
                        </Button>
                    </Tooltip>

                    {record.status.trim() === "Active" ? (
                        <Tooltip title="Hủy hoạt động">
                            <Button danger type="link" onClick={() => handleDelete(record.id)}>
                                <DeleteOutlined style={{ fontSize: 20 }} />
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Khôi phục tài khoản">
                            <Button
                                type="primary"
                                onClick={() => openRestoreModal(record.id)}
                                className="bg-[#1664a3] text-white"
                                size="small"
                            >
                                Kích hoạt
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];


const AccountDetailModalContent = ({ accountId }: { accountId: string }) => {

    const { data, isLoading } = useGetAccountDetailQuery(accountId);

    if (isLoading) return <p>Đang tải...</p>;
    if (!data) return <p>Không có dữ liệu</p>;
    const avatar =
        data.profileImg && data.profileImg !== ""
            ? data.profileImg
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return (
        <div className="space-y-3">
            <div className="flex gap-4 items-center">
                <img
                    src={avatar}
                    className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                    <h2 className="text-xl font-bold">{data.fullName}</h2>
                    <p>Email: {data.email}</p>
                    <p>SĐT: {data.phoneNumber}</p>
                    <p>
                        Vai trò: <Tag color="blue">{data.role}</Tag>
                    </p>
                </div>
            </div>

            {data.role.includes("Teacher") && (
                <div className="mt-5">
                    <h3 className="font-semibold mb-2">Danh sách khóa học giảng viên tạo:</h3>

                    <Table
                        rowKey={(r) => r.courseId}
                        dataSource={data.courses}
                        pagination={false}
                        columns={[
                            {
                                title: "Tên khóa học",
                                dataIndex: "title",
                            },
                            {
                                title: "Ảnh",
                                dataIndex: "imageUrl",
                                render: (img) => (
                                    <img
                                        src={img}
                                        className="w-16 h-16 rounded object-cover"
                                    />
                                ),
                            },
                            {
                                title: "Giá gốc",
                                dataIndex: "originalPrice",
                                render: (p) => <span>{p?.toLocaleString()} đ</span>,
                            },
                            {
                                title: "Giá giảm",
                                dataIndex: "finalPrice",
                                render: (p) => <span>{p?.toLocaleString()} đ</span>,
                            },

                            // ⭐ THÊM NGÀY TẠO
                            {
                                title: "Ngày tạo",
                                dataIndex: "createAt",
                                render: (d) =>
                                    d ? (
                                        <span>
                                            {new Date(d).toLocaleDateString("vi-VN")}{" "}
                                            {new Date(d).toLocaleTimeString("vi-VN")}
                                        </span>
                                    ) : (
                                        "-"
                                    ),
                            },

                            // ⭐ THÊM NGÀY CẬP NHẬT
                            {
                                title: "Cập nhật gần nhất",
                                dataIndex: "updateAt",
                                render: (d) =>
                                    d ? (
                                        <span>
                                            {new Date(d).toLocaleDateString("vi-VN")}{" "}
                                            {new Date(d).toLocaleTimeString("vi-VN")}
                                        </span>
                                    ) : (
                                        "-"
                                    ),
                            },

                            {
                                title: "Public",
                                dataIndex: "isPublic",
                                render: (isPublic) =>
                                    isPublic ? (
                                        <Tag color="green">Đã xuất bản</Tag>
                                    ) : (
                                        <Tag color="red">Chưa</Tag>
                                    ),
                            },
                        ]}
                    />

                </div>
            )}
        </div>
    );
};




const GetAllAccount = () => {
    const [database, setDatabase] = useState<Account[]>([]);
    const displayData = 10;
    const [searchValue, setSearchValue] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        total: 0,
    });

    const { Search } = Input;

    // Modal XÓA
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const [deleteAccount] = useDeleteAccountMutation();
    const [restoreAccount] = useRestoreAccountMutation();
    // Modal KHÔI PHỤC
    const [restoreModalVisible, setRestoreModalVisible] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    const openRestoreModal = (accountId: string) => {
        setRestoringId(accountId);
        setRestoreModalVisible(true);
    };

    const confirmRestore = async () => {
        if (!restoringId) return;

        try {
            await restoreAccount({ accountId: restoringId }).unwrap();

            message.success("Tài khoản đã được kích hoạt!");

            // cập nhật UI
            const updated = database.map(acc =>
                acc.id === restoringId ? { ...acc, status: "Active" } : acc
            );
            setDatabase(updated);

        } catch (err) {
            message.error("Khôi phục tài khoản thất bại!");
        }

        setRestoreModalVisible(false);
    };

    const cancelRestore = () => setRestoreModalVisible(false);


    // Modal XEM CHI TIẾT
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const input: PagingParam = {
        pageSize: displayData,
        pageNumber: pagination.current,
        search: searchValue,
    };

    const { state, response } = useAccountAll(input);

    useEffect(() => {
        if (response) {
            const filteredAccounts = response.accounts.filter(
                (account) => account.role?.trim().toLowerCase() !== 'admin'
            );

            setDatabase(filteredAccounts);
            setPagination({
                ...pagination,
                total: filteredAccounts.length,
            });
        }
    }, [response]);

    const handlePageChange = (page: number) => {
        setPagination({ ...pagination, current: page });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && response) {
            setDatabase(response.accounts);
            setPagination({
                ...pagination,
                total: response.totalAccounts,
            });
        }
    };

    const handleDelete = (accountId: string) => {
        setDeletingItemId(accountId);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingItemId) return;

        setDeleteModalVisible(false);
        try {
            await deleteAccount(deletingItemId);
            const updatedAccounts = database.map((account) =>
                account.id === deletingItemId ? { ...account, status: 'false' } : account
            );
            setDatabase(updatedAccounts);
            message.success('Bạn đã xóa thành công tài khoản này');
        } catch {
            message.error('Xóa tài khoản thất bại');
        }
    };

    const cancelDelete = () => setDeleteModalVisible(false);

    const handleView = (id: string) => {
        setSelectedId(id);
        setViewModalVisible(true);
    };

    const tableColumns: ColumnType<Account>[] = columns({
        pagination,
        displayData,
        handleDelete,
        handleView,
        openRestoreModal,
    });


    return (
        <div className="mx-auto w-[99%] space-y-4">

            <div className="flex items-center justify-between">
                <h1 className="mb-5 text-2xl font-bold text-gray-800">Danh sách các tài khoản:</h1>
                {/* <Button type="primary" className="bg-blue-500">
                    <Link to={'/admin/createAccount/'}>Thêm tài khoản STAFF</Link>
                </Button> */}
            </div>

            <Search
                placeholder="Nhập tên để tìm kiếm"
                className="w-[30%]"
                size="large"
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
                value={searchValue}
            />

            <Table
                columns={tableColumns}
                rowKey={(record) => record.id}
                dataSource={database}
                pagination={false}
            />

            <Pagination
                className="flex justify-end"
                disabled={state.isFetching}
                current={pagination.current}
                total={pagination.total}
                onChange={handlePageChange}
            />

            {/* MODAL XÓA */}
            <Modal
                title="Xác nhận hủy hoạt động tài khoản"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okButtonProps={{ className: 'bg-blue-500 text-white' }}
                cancelButtonProps={{ className: 'bg-red-500 text-white' }}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn hủy hoạt động tài khoản này không?</p>
            </Modal>
            {/* MODAL KHÔI PHỤC */}
            <Modal
                title="Xác nhận kích hoạt tài khoản"
                open={restoreModalVisible}
                onOk={confirmRestore}
                onCancel={cancelRestore}
                okButtonProps={{ className: 'bg-green-600 text-white' }}
                cancelButtonProps={{ className: 'bg-red-500 text-white' }}
                okText="Kích hoạt"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn kích hoạt lại tài khoản này không?</p>
            </Modal>

            {/* MODAL XEM CHI TIẾT */}
            <Modal
                title="Chi tiết tài khoản"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={950}
            >
                {selectedId && <AccountDetailModalContent accountId={selectedId} />}
            </Modal>

        </div>
    );
};

export default GetAllAccount;
