import { Button, Card, Row, Col, Space, Typography, Tooltip, message, Empty, Badge } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../store';
import { useNavigate } from "react-router-dom";

import {
    useAddSectionMutation,
    useDeleteSectionMutation,
    useUpdateSectionMutation
} from '../../services/section.services';

import SectionCreator from "./SectionCreator";
import { Section } from "../../types/Course.type";
import { setSectionList } from "../../slices/courseSlice";

import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
    PlusOutlined,
    ArrowLeftOutlined,
    BookOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Curriculum() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const course = useSelector(
        (state: RootState) => state.course.addCourse.courseCreatedData
    );

    const existingSections = course.sections || [];

    const [sections, setSections] = useState<Section[]>(existingSections);
    // collapsedMap value: true => collapsed (content hidden), false => expanded (shown)
    const [collapsedMap, setCollapsedMap] = useState<Record<number, boolean>>({});
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [hoveredSection, setHoveredSection] = useState<number | null>(null);

    const [addSection, { isLoading: isAdding }] = useAddSectionMutation();
    const [updateSection] = useUpdateSectionMutation();
    const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();

    useEffect(() => {
        // Update local sections from store
        setSections(existingSections);

        // Preserve previous collapsed states for sections that remain.
        // For newly added sections, default to `allCollapsed`.
        setCollapsedMap(prev => {
            const nextMap: Record<number, boolean> = {};
            (existingSections || []).forEach(s => {
                if (prev && Object.prototype.hasOwnProperty.call(prev, s.sectionId)) {
                    nextMap[s.sectionId] = prev[s.sectionId];
                } else {
                    // If no previous value, follow current allCollapsed state
                    nextMap[s.sectionId] = allCollapsed;
                }
            });
            return nextMap;
        });

        // NOTE: keep allCollapsed as it is (do not force to false)
        // so we don't override user's "Thu gọn tất cả" choice.
    }, [course]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAddSection = async () => {
        try {
            const newSection = await addSection({
                courseId: course.courseId,
                title: "Chương mới",
                position: sections.length + 1
            }).unwrap();

            const next = [...sections, newSection];
            setSections(next);
            dispatch(setSectionList(next));

            // For the new section, set its collapsed state to current `allCollapsed`
            setCollapsedMap(prev => ({ ...prev, [newSection.sectionId]: allCollapsed }));

            message.success("Đã thêm chương mới!");
        } catch {
            message.error("Không thể thêm chương!");
        }
    };

    const handleUpdateSectionTitle = async (sectionId: number, title: string) => {
        try {
            const idx = sections.findIndex(s => s.sectionId === sectionId);
            const position = idx >= 0 ? sections[idx].position : sections.length + 1;

            const updated = await updateSection({
                sectionId,
                title,
                position
            }).unwrap();

            const newList = sections.map(s =>
                s.sectionId === sectionId ? updated : s
            );

            setSections(newList);
            dispatch(setSectionList(newList));

            message.success("Đã cập nhật tên chương!");
        } catch {
            message.error("Cập nhật tên chương thất bại!");
        }
    };

    const handleDeleteSection = async (sectionId: number) => {
        try {
            await deleteSection(sectionId).unwrap();

            const newList = sections.filter(s => s.sectionId !== sectionId);
            const reindexed = newList.map((sec, idx) => ({ ...sec, position: idx + 1 }));

            setSections(reindexed);
            dispatch(setSectionList(reindexed));

            // Remove the deleted section from collapsedMap but KEEP other entries intact.
            setCollapsedMap(prev => {
                const copy = { ...prev };
                delete copy[sectionId];
                return copy;
            });

            message.success("Đã xóa chương!");
        } catch {
            message.error("Không thể xóa chương!");
        }
    };

    const toggleSectionCollapsed = (sectionId: number) => {
        setCollapsedMap(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const toggleAll = () => {
        const nextAll = !allCollapsed;
        const map: Record<number, boolean> = {};
        sections.forEach(s => (map[s.sectionId] = nextAll));
        setCollapsedMap(map);
        setAllCollapsed(nextAll);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
                padding: '24px',
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div
                    style={{
                        background: 'white',
                        padding: '28px 32px',
                        borderRadius: '20px',
                        marginBottom: '24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: '1px solid #f1f5f9',
                    }}
                >
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col xs={24} lg={14}>
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <BookOutlined style={{ fontSize: '22px', color: '#3b82f6' }} />
                                </div>
                                <div>
                                    <Title level={3} style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
                                        Chương trình học
                                    </Title>
                                    <Text style={{ color: '#64748b', fontSize: '14px' }}>
                                        Khóa học: <strong style={{ color: '#1e293b' }}>{course.title || '(Chưa đặt tên)'}</strong>
                                    </Text>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Space wrap className="w-full justify-end">
                                <Button
                                    onClick={toggleAll}
                                    icon={allCollapsed ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                    style={{
                                        borderRadius: '10px',
                                        height: '40px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        color: '#475569',
                                    }}
                                >
                                    {allCollapsed ? "Mở tất cả" : "Thu gọn tất cả"}
                                </Button>

                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/teacher/getAllCourse')}
                                    style={{
                                        borderRadius: '10px',
                                        height: '40px',
                                        fontSize: '14px',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        color: '#475569',
                                    }}
                                >
                                    Quay lại
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                    {sections.length === 0 && (
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: '20px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <Text style={{ fontSize: '15px', color: '#64748b' }}>
                                            Chưa có chương nào trong khóa học
                                        </Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            Nhấn nút "Thêm chương" bên dưới để bắt đầu
                                        </Text>
                                    </div>
                                }
                            />
                        </Card>
                    )}

                    {sections.map((section, index) => (
                        <Card
                            key={section.sectionId || `s-${index}`}
                            bordered={false}
                            onMouseEnter={() => setHoveredSection(section.sectionId)}
                            onMouseLeave={() => setHoveredSection(null)}
                            style={{
                                borderRadius: '16px',
                                boxShadow: hoveredSection === section.sectionId
                                    ? '0 4px 16px rgba(0,0,0,0.08)'
                                    : '0 2px 8px rgba(0,0,0,0.04)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid #f1f5f9',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Section Header */}
                            <div
                                style={{
                                    padding: '20px 24px',
                                    background: collapsedMap[section.sectionId] ? '#fafbfc' : 'white',
                                    borderBottom: collapsedMap[section.sectionId] ? 'none' : '1px solid #f1f5f9',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <Row align="middle" justify="space-between" gutter={[16, 16]}>
                                    <Col xs={24} md={16}>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                count={index + 1}
                                                style={{
                                                    backgroundColor: '#3b82f6',
                                                    minWidth: '32px',
                                                    height: '32px',
                                                    lineHeight: '32px',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                                }}
                                            />
                                            <div>
                                                <Title
                                                    level={5}
                                                    style={{
                                                        margin: 0,
                                                        fontSize: '17px',
                                                        fontWeight: '600',
                                                        color: '#0f172a',
                                                    }}
                                                >
                                                    {section.title || "(Chưa đặt tên)"}
                                                </Title>
                                                <Space size={8} style={{ marginTop: '4px' }}>
                                                    <Text
                                                        style={{
                                                            fontSize: '13px',
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        {section.steps?.length || 0} bài học
                                                    </Text>
                                                    <span style={{ color: '#cbd5e1' }}>•</span>
                                                    <Text
                                                        style={{
                                                            fontSize: '13px',
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        Vị trí: {section.position || index + 1}
                                                    </Text>
                                                </Space>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col xs={24} md={8}>
                                        <Space wrap className="w-full justify-end">
                                            <Tooltip title={collapsedMap[section.sectionId] ? "Mở chương" : "Thu gọn chương"}>
                                                <Button
                                                    size="middle"
                                                    icon={collapsedMap[section.sectionId] ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                    onClick={() => toggleSectionCollapsed(section.sectionId)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        height: '36px',
                                                        fontSize: '13px',
                                                        background: '#eff6ff',
                                                        border: '1px solid #bfdbfe',
                                                        color: '#3b82f6',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#dbeafe';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#eff6ff';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                />
                                            </Tooltip>

                                            <Tooltip title="Xóa chương">
                                                <Button
                                                    size="middle"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDeleteSection(section.sectionId)}
                                                    loading={isDeleting}
                                                    style={{
                                                        borderRadius: '8px',
                                                        height: '36px',
                                                        background: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        color: '#dc2626',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#fee2e2';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#fef2f2';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                />
                                            </Tooltip>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>

                            {/* Section Content */}
                            {!collapsedMap[section.sectionId] && (
                                <div
                                    style={{
                                        padding: '24px',
                                        background: 'white',
                                        animation: 'fadeIn 0.3s ease',
                                    }}
                                >
                                    <SectionCreator
                                        index={index}
                                        section={section}
                                        onUpdateTitle={handleUpdateSectionTitle}
                                        onDelete={handleDeleteSection}
                                        collapsed={!!collapsedMap[section.sectionId]}
                                        onToggleCollapsed={() => toggleSectionCollapsed(section.sectionId)}
                                    />
                                </div>
                            )}
                        </Card>
                    ))}

                    {/* Add Section Button */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '16px',
                            paddingBottom: '32px',
                        }}
                    >
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleAddSection}
                            loading={isAdding}
                            style={{
                                borderRadius: '12px',
                                height: '48px',
                                fontSize: '15px',
                                fontWeight: '600',
                                paddingLeft: '32px',
                                paddingRight: '32px',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                backgroundColor: '#3B82F6',
                                color: '#fff',
                            }}
                        >
                            Thêm chương mới
                        </Button>

                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Smooth scroll behavior */
                html {
                    scroll-behavior: smooth;
                }

                /* Button hover effects */
                button {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* Card animations */
                .ant-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* Input focus effects */
                .ant-input:focus,
                .ant-input-focused {
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
                    transition: all 0.2s ease !important;
                }

                /* Ant Design override for smoother transitions */
                * {
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* Badge animation */
                .ant-badge {
                    animation: scaleIn 0.3s ease;
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                /* Empty state animation */
                .ant-empty {
                    animation: fadeIn 0.5s ease;
                }

                /* Message animation enhancement */
                .ant-message {
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
