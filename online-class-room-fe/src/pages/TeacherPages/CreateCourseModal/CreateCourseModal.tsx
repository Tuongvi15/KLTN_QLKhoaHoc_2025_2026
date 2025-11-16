import { Modal, Steps, Button, message } from "antd";
import { useState, useEffect } from "react";
import Step1_BasicInfo from "./Step1_BasicInfo";
import Step2_MediaUpload from "./Step2_MediaUpload";
import Step3_Pricing from "./Step3_Pricing";
import Step4_Confirm from "./Step4_Confirm";
import { CategoryRespone } from "../../../types/Course.type";
import { useUpdateCourseMutation } from "../../../services/course.services";

import { useAddNewCourseMutation } from "../../../services/course.services";
import {
    useGetAllFieldsQuery,
    useGetCategoriesByFieldIdQuery
} from "../../../services/placementtest.services";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    setCourseMode,
    CouseMode,
    setCourseCreatedData,
} from "../../../slices/courseSlice";

import { useNavigate } from "react-router-dom";

interface CreateCourseModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateCourseModal({ open, onClose }: CreateCourseModalProps) {
    const [current, setCurrent] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((s: RootState) => s.user);

    const [addCourse, { isLoading }] = useAddNewCourseMutation();


    const addCourseState = useSelector((s: RootState) => s.course.addCourse.courseCreatedData);
    const mode = useSelector((s: RootState) => s.course.currentMode);

    const [updateCourse] = useUpdateCourseMutation();

    useEffect(() => {
        if (open && mode === CouseMode.UPDATE) {
            setCurrent(0);

            // load field
            setSelectedFieldId(
                addCourseState.courseCategories?.[0]?.category?.fieldCategories?.[0]?.field?.fieldId ?? null
            );


            // load level
            setSelectedLevels((addCourseState.suitableLevels || "").split("|"));
        }
    }, [open]);

    // FIELD + CATEGORY
    const { data: fieldList = [] } = useGetAllFieldsQuery();
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

    const {
        data: categoriesResp,
        refetch: refetchCategories = () => { }
    } = useGetCategoriesByFieldIdQuery(selectedFieldId!, {
        skip: !selectedFieldId
    });

    const categories: CategoryRespone[] = categoriesResp?.dataObject || [];

    // LEVEL
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

    // SYNC FIELD
    useEffect(() => {
        dispatch(setCourseCreatedData({
            ...addCourseState,
        } as any));
        // eslint-disable-next-line
    }, [selectedFieldId]);

    // SYNC LEVEL ("1|2|3")
    useEffect(() => {
        dispatch(setCourseCreatedData({
            ...addCourseState,
            suitableLevels: selectedLevels.join("|")
        } as any));
        // eslint-disable-next-line
    }, [selectedLevels]);

    const steps = [
        {
            title: "Thông tin cơ bản",
            content: (
                <Step1_BasicInfo
                    mode={mode}
                    fieldList={fieldList}
                    selectedFieldId={selectedFieldId}
                    setSelectedFieldId={setSelectedFieldId}
                    categories={categories}
                    refetchCategories={refetchCategories}
                    selectedLevels={selectedLevels}
                    setSelectedLevels={setSelectedLevels}
                />
            )
        },
        { title: "Hình ảnh & video", content: <Step2_MediaUpload /> },
        { title: "Giá & giảm giá", content: <Step3_Pricing /> },
        { title: "Hoàn tất", content: <Step4_Confirm /> }
    ];

    const handleNext = () => {
        if (current === 0) {
            if (!selectedFieldId) return message.warning("Vui lòng chọn lĩnh vực!");
            if (!addCourseState.title?.trim()) return message.warning("Vui lòng nhập tiêu đề!");
            if (!addCourseState.courseCategories?.length)
                return message.warning("Chọn ít nhất 1 category!");
            if (!selectedLevels.length) return message.warning("Chọn cấp độ phù hợp!");
        }
        if (current === 1) {
            if (!addCourseState.imageUrl) return message.warning("Vui lòng tải ảnh!");
        }
        setCurrent((p) => p + 1);
    };

    const handlePrev = () => setCurrent((p) => p - 1);

    const handleFinish = async () => {
        try {
            const payload = {
                title: addCourseState.title,
                description: addCourseState.description || "",
                imageUrl: addCourseState.imageUrl,
                videoPreviewUrl: addCourseState.videoPreviewUrl,
                price: addCourseState.price || 0,
                salesCampaign: addCourseState.salesCampaign || 0,
                categoryList: addCourseState.courseCategories.map((c) => c.categoryId),
                suitableLevels: selectedLevels.join("|"),
                accountId: user.id,
                isPublic: false,
                courseIsActive: false,
                totalDuration: 0,
                knowdledgeDescription: addCourseState.knowdledgeDescription,
                linkCertificated: addCourseState.linkCertificated
            };

            if (mode === CouseMode.UPDATE) {
                // ⭐ UPDATE
                await updateCourse({
                    courseId: addCourseState.courseId,
                    ...payload
                }).unwrap();

                message.success("Cập nhật khóa học thành công!");

            } else {
                // ⭐ CREATE
                const result = await addCourse(payload).unwrap();
                message.success("Tạo khóa học thành công!");

                dispatch(setCourseMode(CouseMode.UPDATE));
            }

            onClose();
            navigate(`/teacher/getAllCourse`);

        } catch (err) {
            console.error(err);
            message.error("Có lỗi xảy ra!");
        }
    };


    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            destroyOnClose
            styles={{
                body: { padding: '32px 40px' },
                header: { borderBottom: 'none' }
            }}
            className="modern-course-modal"
        >
            {/* Custom Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {mode === CouseMode.UPDATE ? "Cập nhật khóa học" : "Tạo khóa học mới"}
                </h2>

                <p className="text-sm text-gray-500">
                    {mode === CouseMode.UPDATE
                        ? `Hoàn thành ${current + 1}/${steps.length} bước để cập nhật khóa học của bạn`
                        : `Hoàn thành ${current + 1}/${steps.length} bước để tạo khóa học của bạn`}
                </p>

            </div>

            {/* Modern Steps */}
            <Steps
                current={current}
                items={steps.map((s) => ({ title: s.title }))}
                className="mb-10"
                style={{
                    fontWeight: 500
                }}
            />

            {/* Content Area with smooth transition */}
            <div className="min-h-[380px] transition-all duration-300 ease-in-out">
                {steps[current].content}
            </div>

            {/* Modern Footer */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    {current < steps.length - 1 && (
                        <span>Bước {current + 1} / {steps.length}</span>
                    )}
                </div>

                <div className="flex gap-3">
                    {current > 0 && (
                        <Button
                            onClick={handlePrev}
                            size="large"
                            style={{
                                height: '42px',
                                padding: '0 28px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                color: '#6B7280',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#D1D5DB';
                                e.currentTarget.style.color = '#374151';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.color = '#6B7280';
                            }}
                        >
                            ← Quay lại
                        </Button>
                    )}

                    {current < steps.length - 1 && (
                        <Button
                            type="primary"
                            onClick={handleNext}
                            size="large"
                            style={{
                                height: '42px',
                                padding: '0 32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                            }}
                        >
                            Tiếp tục →
                        </Button>
                    )}

                    {current === steps.length - 1 && (
                        <Button
                            type="primary"
                            loading={isLoading}
                            onClick={handleFinish}
                            size="large"
                            style={{
                                height: '42px',
                                padding: '0 32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(183, 188, 207, 0.3)';
                            }}
                        >
                            {mode === CouseMode.UPDATE
                                ? "✓ Hoàn tất & Cập nhật khóa học"
                                : "✓ Hoàn tất & Tạo khóa học"}
                        </Button>
                    )}

                </div>
            </div>

            <style>{`
                .modern-course-modal .ant-modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                }

                .modern-course-modal .ant-steps-item-process .ant-steps-item-icon {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                }

                .modern-course-modal .ant-steps-item-finish .ant-steps-item-icon {
                    border-color: #667eea;
                }

                .modern-course-modal .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
                    color: #667eea;
                }

                .modern-course-modal .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
                    background-color: #667eea;
                }

                .modern-course-modal .ant-modal-close {
                    top: 20px;
                    right: 20px;
                }

                .modern-course-modal .ant-modal-close-x {
                    width: 40px;
                    height: 40px;
                    line-height: 40px;
                    font-size: 16px;
                    color: #9CA3AF;
                    transition: all 0.2s;
                }

                .modern-course-modal .ant-modal-close:hover .ant-modal-close-x {
                    color: #374151;
                }
            `}</style>
        </Modal>
    );
}