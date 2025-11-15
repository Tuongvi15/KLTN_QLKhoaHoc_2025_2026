import { Input, Button, Tag, Select, message, Card, Space, Typography } from "antd";
import {
    BookOutlined,
    TagsOutlined,
    TrophyOutlined,
    BulbOutlined,
    PlusOutlined
} from '@ant-design/icons';

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    setCourseCreatedData,
    setCourseKnowledge,
    updateCourseCategory,
    CouseMode
} from "../../../slices/courseSlice";

import { useAddCategoryMutation } from "../../../services/categoryService";
import { MultipleInput, RichTextEditor } from "../../../components";
import { useEffect, useState } from "react";

const { CheckableTag } = Tag;
const { Text } = Typography;

interface Step1Props {
    mode: CouseMode;
    fieldList: any[];
    selectedFieldId: number | null;
    setSelectedFieldId: (id: number | null) => void;
    categories: any[];
    refetchCategories: () => void;
    selectedLevels: string[];
    setSelectedLevels: (levels: string[]) => void;
}

export default function Step1_BasicInfo({
    mode,
    fieldList,
    selectedFieldId,
    setSelectedFieldId,
    categories,
    refetchCategories,
    selectedLevels,
    setSelectedLevels
}: Step1Props) {

    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [addCategory] = useAddCategoryMutation();

    /** ---------------------------------------------
     * FIX QUAN TRỌNG
     * Không xoá category khi đang UPDATE!
     * --------------------------------------------- */
    useEffect(() => {
        if (mode === CouseMode.CREATE) {
            dispatch(updateCourseCategory([]));
        }
    }, [selectedFieldId, mode]);

    const handleAddCategory = async () => {
        if (!selectedFieldId) return message.warning("Vui lòng chọn lĩnh vực!");
        if (!newCategoryName.trim()) return message.warning("Nhập tên thể loại!");

        try {
            await addCategory({
                categoryName: newCategoryName,
                categoryDescription: newCategoryName,
                fieldId: selectedFieldId
            }).unwrap();

            message.success("Đã thêm thể loại mới!");
            setNewCategoryName("");
            refetchCategories();
        } catch {
            message.error("Không thể thêm thể loại!");
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>

            {/* TITLE */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <BookOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Tiêu đề khóa học</Text>
                    </Space>
                    <Input
                        placeholder="VD: Lập trình ReactJS từ A-Z"
                        value={course.title}
                        maxLength={80}
                        showCount
                        size="large"
                        onChange={(e) =>
                            dispatch(setCourseCreatedData({ ...course, title: e.target.value }))
                        }
                    />
                </Space>
            </Card>

            {/* DESCRIPTION */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <BookOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Mô tả khóa học</Text>
                    </Space>
                    <RichTextEditor
                        initialValue={course.description}
                        onChange={(val) =>
                            dispatch(setCourseCreatedData({ ...course, description: val }))
                        }
                    />
                </Space>
            </Card>

            {/* FIELD & CATEGORY */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={20} style={{ width: "100%" }}>

                    {/* FIELD */}
                    <div>
                        <Space style={{ marginBottom: 12 }}>
                            <TagsOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                            <Text strong style={{ fontSize: 15 }}>Lĩnh vực</Text>
                        </Space>

                        <Select
                            placeholder="Chọn lĩnh vực..."
                            style={{ width: "100%", maxWidth: 400 }}
                            size="large"
                            value={selectedFieldId || undefined}
                            onChange={(v) => setSelectedFieldId(v)}
                            options={fieldList.map((f: any) => ({
                                label: f.name,
                                value: f.fieldId
                            }))}
                        />
                    </div>

                    {/* CATEGORY */}
                    {selectedFieldId && (
                        <div
                            style={{
                                padding: 20,
                                background: "#fafafa",
                                borderRadius: 8,
                                border: "1px solid #f0f0f0"
                            }}
                        >
                            <Text strong style={{ fontSize: 14, color: "#262626", display: "block", marginBottom: 12 }}>
                                Thể loại
                            </Text>

                            <Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
                                {categories.length === 0 && (
                                    <Text type="secondary">Không có thể loại nào</Text>
                                )}

                                {categories.map((cat: any) => {
                                    const categoryId = cat.catgoryId ?? cat.categoryId;

                                    return (
                                        <CheckableTag
                                            key={categoryId}
                                            checked={course.courseCategories.some(
                                                (c: any) => c.categoryId === categoryId
                                            )}
                                            onChange={(checked) => {
                                                const category = {
                                                    categoryId,
                                                    courseId: course.courseId || -1,
                                                    courseCategoryId: -1,
                                                    category: cat
                                                };

                                                const next = checked
                                                    ? [...course.courseCategories, category]
                                                    : course.courseCategories.filter(
                                                        (c: any) => c.categoryId !== categoryId
                                                    );

                                                dispatch(updateCourseCategory(next));
                                            }}
                                        >
                                            {cat.name}
                                        </CheckableTag>
                                    );
                                })}
                            </Space>

                            {/* ADD NEW CATEGORY */}
                            <Space.Compact style={{ width: "100%", maxWidth: 400 }}>
                                <Input
                                    placeholder="Thêm thể loại mới..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onPressEnter={handleAddCategory}
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddCategory}
                                >
                                    Thêm
                                </Button>
                            </Space.Compact>
                        </div>
                    )}
                </Space>
            </Card>

            {/* LEVEL */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <TrophyOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Cấp độ phù hợp</Text>
                    </Space>

                    <Space wrap size={[8, 8]}>
                        {["1", "2", "3"].map((lvl) => (
                            <CheckableTag
                                key={lvl}
                                checked={selectedLevels.includes(lvl)}
                                style={{ padding: "8px 20px", fontSize: 14, borderRadius: 6 }}
                                onChange={(checked) => {
                                    const next = checked
                                        ? [...selectedLevels, lvl]
                                        : selectedLevels.filter((x) => x !== lvl);

                                    setSelectedLevels(next);
                                }}
                            >
                                {lvl === "1" && "🌱 Fresher"}
                                {lvl === "2" && "🚀 Junior"}
                                {lvl === "3" && "⭐ Master"}
                            </CheckableTag>
                        ))}
                    </Space>
                </Space>
            </Card>

            {/* KNOWLEDGE */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <BulbOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Mục tiêu khóa học</Text>
                    </Space>

                    <MultipleInput
                        maxInputItem={8}
                        maxLengthInput={120}
                        values={course.knowdledgeDescription}
                        seperator="|"
                        onDataChange={(data) => dispatch(setCourseKnowledge(data))}
                    />
                </Space>
            </Card>
        </Space>
    );
}
