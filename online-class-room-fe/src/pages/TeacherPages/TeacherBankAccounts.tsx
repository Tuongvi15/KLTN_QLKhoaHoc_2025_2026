// src/pages/TeacherPages/TeacherBankAccounts.tsx
import { useState, useEffect } from 'react';
import { Select, Modal, Tag, Divider } from 'antd';
import type { BankAccountDto, BankAccountResp } from "../../services/bankAccount.service";

import {
    Button,
    Card,
    Form,
    Input,
    List,
    Radio,
    Space,
    Typography,
    message,
    Empty,
    Row,
    Col,
    Avatar,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    WalletOutlined,
    BankOutlined,
    UserOutlined,
    HomeOutlined,
    CreditCardOutlined,
} from '@ant-design/icons';

import {
    useGetMyBankAccountsQuery,
    useCreateBankAccountMutation,
    useUpdateBankAccountMutation,
    useDeleteBankAccountMutation,
} from '../../services/bankAccount.service';

const { Title, Text } = Typography;

type BankItem = {
    name: string;
    logo: string;
    shortName: string;
    code: string;
    bin: string;
};

export default function TeacherBankAccounts() {
    const { data: items = [], refetch, isFetching } = useGetMyBankAccountsQuery();
    const [createBankAccount, { isLoading: creating }] = useCreateBankAccountMutation();
    const [updateBankAccount, { isLoading: updating }] = useUpdateBankAccountMutation();
    const [deleteBankAccount, { isLoading: deleting }] = useDeleteBankAccountMutation();

    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<BankAccountResp | null>(null);
    const [form] = Form.useForm<BankAccountDto>();
    const [banks, setBanks] = useState<BankItem[]>([]);

    useEffect(() => {
        fetch("https://api.vietqr.io/v2/banks")
            .then(res => res.json())
            .then(data => setBanks(data.data ?? []))
            .catch(err => console.error(err));
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setModalVisible(true);
    };

    const openEdit = (item: BankAccountResp) => {
        setEditing(item);

        form.setFieldsValue({
            bankName: item.bankName,
            accountHolderName: item.accountHolderName,
            accountNumber: item.accountNumberMasked ?? "",
            branch: item.branch,
            isPrimary: item.isPrimary,
        });

        setModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xoá",
            content: "Bạn có chắc muốn xoá tài khoản này?",
            okText: "Xoá",
            cancelText: "Huỷ",
            okType: "danger",
            centered: true,
            onOk: async () => {
                try {
                    await deleteBankAccount(id).unwrap();
                    message.success("Đã xoá tài khoản ngân hàng");
                    refetch();
                } catch {
                    message.error("Xoá thất bại, vui lòng thử lại");
                }
            },
        });
    };

    const submitForm = async (values: BankAccountDto) => {
        try {
            if (editing) {
                await updateBankAccount({ id: editing.bankAccountId, body: values }).unwrap();
                message.success("Cập nhật thành công");
            } else {
                await createBankAccount(values).unwrap();
                message.success("Thêm tài khoản thành công");
            }

            setModalVisible(false);
            form.resetFields();
            refetch();
        } catch (error: any) {
            message.error(error?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    const onFinish = async (values: BankAccountDto) => {
        const alreadyPrimary = items.some(acc => acc.isPrimary);

        if (values.isPrimary && (!editing || !editing.isPrimary) && alreadyPrimary) {
            Modal.confirm({
                title: "Thay đổi tài khoản chính?",
                content: "Bạn đã có một tài khoản chính. Nếu tiếp tục, tài khoản này sẽ trở thành tài khoản chính mới.",
                okText: "Đồng ý",
                cancelText: "Huỷ",
                centered: true,
                okButtonProps: {
                    style: {
                        backgroundColor: '#1677ff',
                        color: '#fff',
                        fontWeight: 600,
                    }
                },
                onOk: async () => await submitForm(values)
            });

            return;
        }

        await submitForm(values);
    };

    const getBankLogo = (bankName: string) => {
        const bank = banks.find(b => b.name === bankName);
        return bank?.logo;
    };

    const loading = isFetching || creating || updating || deleting;

    return (
        <div style={{
            padding: '24px',
            maxWidth: 1200,
            margin: '0 auto',
            minHeight: '100vh',
        }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Header Section */}
                <Card
                    bordered={false}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 12,
                    }}
                >
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space direction="vertical" size={4}>
                                <Title level={3} style={{ margin: 0, color: '#fff' }}>
                                    <WalletOutlined style={{ marginRight: 12 }} />
                                    Tài khoản ngân hàng
                                </Title>
                                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                                    Quản lý thông tin tài khoản để nhận thanh toán
                                </Text>
                            </Space>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={openCreate}
                                style={{
                                    background: '#fff',
                                    borderColor: '#fff',
                                    color: '#667eea',
                                    fontWeight: 500,
                                    height: 44,
                                    borderRadius: 8,
                                }}
                            >
                                Thêm tài khoản
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Bank Accounts List */}
                <Card
                    loading={loading}
                    bordered={false}
                    style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                >
                    {items.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Space direction="vertical" size={8}>
                                    <Text style={{ fontSize: 16, color: '#8c8c8c' }}>
                                        Chưa có tài khoản ngân hàng
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        Thêm tài khoản ngân hàng để bắt đầu nhận thanh toán
                                    </Text>
                                </Space>
                            }
                            style={{ padding: '48px 0' }}
                        />
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={items}
                            split={false}
                            renderItem={(item, index) => (
                                <List.Item
                                    style={{
                                        padding: '20px 0',
                                        borderBottom: index < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}
                                    actions={[
                                        <Button
                                            key="edit"
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => openEdit(item)}
                                            style={{ color: '#1677ff' }}
                                        >
                                            Sửa
                                        </Button>,
                                        <Button
                                            key="del"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => {
                                                if (item.isPrimary) {
                                                    message.warning("Không thể xoá tài khoản chính. Hãy đặt tài khoản khác làm chính trước.");
                                                    return;
                                                }
                                                handleDelete(item.bankAccountId);
                                            }}
                                        >
                                            Xoá
                                        </Button>

                                        ,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 8,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 24,
                                                color: '#fff',
                                                fontWeight: 600,
                                            }}>
                                                <BankOutlined />
                                            </div>
                                        }
                                        title={
                                            <Space size={8} style={{ marginBottom: 4 }}>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {item.bankName}
                                                </Text>
                                                {item.isPrimary && (
                                                    <Tag
                                                        icon={<CheckCircleOutlined />}
                                                        color="success"
                                                        style={{ borderRadius: 4 }}
                                                    >
                                                        Chính
                                                    </Tag>
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                <Space size={8}>
                                                    <UserOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                                                    <Text style={{ fontSize: 14 }}>
                                                        {item.accountHolderName}
                                                    </Text>
                                                </Space>
                                                <Space size={8}>
                                                    <CreditCardOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                                                    <Text style={{ fontSize: 14, fontFamily: 'monospace' }}>
                                                        {item.accountNumberMasked || '••••••••'}
                                                    </Text>
                                                </Space>
                                                {item.branch && (
                                                    <Space size={8}>
                                                        <HomeOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                                            {item.branch}
                                                        </Text>
                                                    </Space>
                                                )}
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            </Space>

            {/* Modal Form */}
            <Modal
                title={
                    <Space>
                        <BankOutlined style={{ color: '#1677ff' }} />
                        <span>{editing ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
                centered
                width={520}
            >
                <Divider style={{ margin: '16px 0 24px' }} />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ isPrimary: false }}
                    requiredMark="optional"
                >
                    <Form.Item
                        label="Ngân hàng"
                        name="bankName"
                        rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Tìm và chọn ngân hàng"
                            loading={!banks.length}
                            size="large"
                            suffixIcon={<BankOutlined />}
                            options={banks.map(b => ({
                                value: b.name,
                                label: b.name,
                            }))}
                            optionRender={(option) => {
                                const bank = banks.find(b => b.name === option.value);
                                return bank ? (
                                    <Space>
                                        <img
                                            src={bank.logo}
                                            alt=""
                                            style={{ width: 24, height: 24, borderRadius: 4 }}
                                        />
                                        <span>{bank.name}</span>
                                    </Space>
                                ) : option.label;
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số tài khoản"
                        name="accountNumber"
                        rules={[
                            { required: !editing, message: 'Vui lòng nhập số tài khoản' },
                            {
                                validator: (_, value) => {
                                    // Nếu đang edit và ô đang chứa masked "******1234"
                                    if (editing && (value === "" || value?.includes("*"))) {
                                        return Promise.resolve();
                                    }
                                    // Chỉ validate khi user nhập số mới
                                    if (value && !/^\d+$/.test(value)) {
                                        return Promise.reject("Số tài khoản chỉ bao gồm chữ số");
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        extra={editing ? "Để trống nếu không muốn thay đổi số tài khoản" : null}
                    >
                        <Input
                            placeholder="Nhập số tài khoản"
                            size="large"
                            prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Form.Item>


                    <Form.Item
                        label="Tên chủ tài khoản"
                        name="accountHolderName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}
                    >
                        <Input
                            placeholder="Tên trên thẻ/tài khoản (viết hoa, không dấu)"
                            size="large"
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Chi nhánh"
                        name="branch"
                        tooltip="Không bắt buộc"
                    >
                        <Input
                            placeholder="Ví dụ: Chi nhánh Quận 1, TP.HCM"
                            size="large"
                            prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Form.Item>

                    <Form.Item name="isPrimary" label="Đặt làm tài khoản chính">
                        <Radio.Group>
                            <Radio value={true}>Có</Radio>
                            <Radio value={false}>Không</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Tài khoản chính sẽ được sử dụng mặc định cho thanh toán
                    </Text>





                    <Divider style={{ margin: '24px 0' }} />

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button
                                size="large"
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                }}
                            >
                                Huỷ
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                style={{
                                    minWidth: 100,
                                    backgroundColor: "#4e90f1ff",
                                    borderColor: "#1a5ec4ff"
                                }}
                            >
                                {editing ? 'Cập nhật' : 'Thêm mới'}
                            </Button>

                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
}