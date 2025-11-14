import { Modal, Steps, Button, message } from "antd";
import { useState, useEffect } from "react";
import Step1_BasicInfo from "./Step1_BasicInfo";
import Step2_MediaUpload from "./Step2_MediaUpload";
import Step3_Pricing from "./Step3_Pricing";
import Step4_Confirm from "./Step4_Confirm";
import { CategoryRespone } from "../../../types/Course.type";

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

    // FIELD + CATEGORY
    const { data: fieldList = [] } = useGetAllFieldsQuery();
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

    const {
        data: categoriesResp,
        refetch: refetchCategories = () => {}
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
            // remove fieldId sync (backend không cần)
        } as any));
        // eslint-disable-next-line
    }, [selectedFieldId]);

    // SYNC LEVEL ("1|2|3")
    useEffect(() => {
        dispatch(setCourseCreatedData({
            ...addCourseState,
            suitableLevels: selectedLevels.join("|") // ⭐ dùng |
        } as any));
        // eslint-disable-next-line
    }, [selectedLevels]);

    const steps = [
        {
            title: "Thông tin cơ bản",
            content: (
                <Step1_BasicInfo
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
                suitableLevels: selectedLevels.join("|"),       // ⭐ chuẩn
                accountId: user.id,
                isPublic: false,
                courseIsActive: false,
                totalDuration: 0,
                knowdledgeDescription: addCourseState.knowdledgeDescription,
                linkCertificated: addCourseState.linkCertificated
            };

            const result = await addCourse(payload).unwrap();

            message.success("Tạo khóa học thành công!");

            // ⭐ CHUẨN HÓA KẾT QUẢ TỪ BE
            const normalized = {
                ...result,
                suitableLevels: result.courseLevel ?? result.suitableLevels ?? "",
            };

            dispatch(setCourseCreatedData(normalized));
            dispatch(setCourseMode(CouseMode.UPDATE));
            onClose();

            navigate(`/teacher/update-course/${normalized.courseId}`);

        } catch (err) {
            console.error(err);
            message.error("Không thể tạo khóa học!");
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={960}
            centered
            destroyOnClose
        >
            <Steps current={current} items={steps.map((s) => ({ title: s.title }))} className="mb-6" />

            {steps[current].content}

            <div className="flex justify-end mt-8 gap-3">
                {current > 0 && <Button onClick={handlePrev}>Quay lại</Button>}
                {current < steps.length - 1 && <Button type="primary" onClick={handleNext}>Tiếp tục</Button>}
                {current === steps.length - 1 && (
                    <Button type="primary" loading={isLoading} onClick={handleFinish}>
                        Hoàn tất & Tạo khóa học
                    </Button>
                )}
            </div>
        </Modal>
    );
}
