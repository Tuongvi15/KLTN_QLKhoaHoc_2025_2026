import { IconButton, Paper } from '@mui/material';
import { Steps, Tag, message, Input, Button } from 'antd';
import {
    EditableText,
    MultipleInput,
    RenderRichText,
    RichTextEditor,
    UploadFileCustom,
} from '../../../../components';
import { UploadFileType } from '../../../../components/UploadFile/UploadFileCustom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import Curriculum from './Curriculum/Curriculum';
import { motion } from 'framer-motion';
import CreateIcon from '@mui/icons-material/Create';
import {
    CouseMode,
    setCourseContentCurrent,
    setCourseCreatedData,
    setCourseDescription,
    setCourseKnowledge,
    setCourseMode,
    setSaveAndQuit,
    updateCourseCategory,
    updateCourseImageUrl,
    updateCoursePreviewUrl,
} from '../../../../slices/courseSlice';
import {
    useUpdateCourseMutation,
    useGetCourseIDQuery,
} from '../../../../services/course.services';
import {
    CategoryRespone,
    CourseCategory,
    UpdateCourseRequest,
} from '../../../../types/Course.type';
import {
    useAddCategoryMutation,
    useDeleteCategoryMutation,
    useGetCategoriesByFieldQuery,
} from '../../../../services/categoryService';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import Publication from './Publication';
import { useUpdateStepMutation } from '../../../../services/step.services';
import { useNavigate } from 'react-router-dom';

const { CheckableTag } = Tag;

const CourseContent = () => {
    const dispatch = useDispatch();
    const addCourseState = useSelector((state: RootState) => state.course.addCourse);
    const [updateStepMutation, { isLoading: isUpdateStepLoading }] = useUpdateStepMutation();
    const [isSaveAndQuit, setIsSaveAndQuit] = useState(false);
    const navigate = useNavigate();
    const quizzList = useSelector((state: RootState) => state.quiz.quizList);
    const [addCategoryMutation] = useAddCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
    const [tagsData, setTagsData] = useState<CategoryRespone[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    const courseCategories = addCourseState.courseCreatedData.courseCategories;
    const courseId = addCourseState.courseCreatedData.courseId;
    const [currentFieldId, setCurrentFieldId] = useState<number | null>(null);

    // ✅ Lấy chi tiết khóa học để xác định fieldId
    const { data: courseDetail, isSuccess: isCourseDetailSuccess } = useGetCourseIDQuery(
        String(courseId),
        { skip: !courseId }
    );

    useEffect(() => {
        if (isCourseDetailSuccess && courseDetail) {
            const categories = courseDetail.courseCategories || [];
            for (const cc of categories) {
                if (cc.category?.fieldCategories?.length > 0) {
                    setCurrentFieldId(cc.category.fieldCategories[0].fieldId);
                    break;
                }
            }
        }
    }, [isCourseDetailSuccess, courseDetail]);

    // ✅ Lấy danh sách category theo fieldId
    const {
        data: fieldCategories,
        isSuccess: isFieldCateSuccess,
        refetch: refetchByField,
    } = useGetCategoriesByFieldQuery(currentFieldId!, {
        skip: !currentFieldId,
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        if (isFieldCateSuccess && fieldCategories?.dataObject) {
            setTagsData(fieldCategories.dataObject);
        }
    }, [isFieldCateSuccess, fieldCategories]);

    // --- Thêm category ---
    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) return message.error('Vui lòng nhập tên thể loại!');
        if (!currentFieldId) return message.error('Không xác định được lĩnh vực của khóa học!');
        try {
            const newCategory = await addCategoryMutation({
                categoryName: newCategoryName,
                categoryDescription: newCategoryName,
                fieldId: currentFieldId,
            }).unwrap();

            setTagsData(prev => [...prev, newCategory]);
            message.success('Thêm loại thành công!');
            setNewCategoryName('');
            refetchByField();
        } catch (err) {
            console.error(err);
            message.error('Thêm loại thất bại!');
        }
    };

    // --- Xóa category ---
    const handleDeleteCategory = async (categoryId: number) => {
        try {
            await deleteCategory(categoryId).unwrap();
            message.success('Xóa loại thành công!');

            // Xóa luôn khỏi tagsData
            setTagsData(prev => prev.filter(c => c.catgoryId !== categoryId));

            // Nếu category đang được chọn, remove luôn khỏi courseCategories
            const updatedCourseCategories = courseCategories.filter(c => c.categoryId !== categoryId);
            dispatch(updateCourseCategory(updatedCourseCategories));
        } catch (err) {
            console.error(err);
            message.error('Xóa loại thất bại!');
        }
    };

    // --- Chọn/deselect category ---
    const handleTagChange = (categoryId: number, checked: boolean) => {
        const category: CourseCategory = {
            categoryId,
            courseId: -1,
            courseCategoryId: -1,
        };
        const nextSelectedTags = checked
            ? [...courseCategories, category]
            : courseCategories.filter((c) => c.categoryId !== categoryId);
        dispatch(updateCourseCategory(nextSelectedTags));
    };

    const [isEditDescription, setEditDescription] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [updatecourse, { isSuccess: isUpdateSuccess, isLoading: isUpdateLoading, data }] =
        useUpdateCourseMutation();

    const currentMode = useSelector((state: RootState) => state.course.currentMode);
    const courseCreatedData = addCourseState.courseCreatedData;

    const current = addCourseState.navStatus.findIndex((value) => value.status === 'process');
    const totalSteps = addCourseState.navStatus;
    const onStepChange = (value: number) => {
        dispatch(setCourseContentCurrent(value));
    };

    const handleOnUploadThumbnailSuccess = (dowloadUrl: string) => {
        if (courseCreatedData.courseId) {
            const data = getUpdateCourseRequest();
            updatecourse({ ...data, imageUrl: dowloadUrl });
        }
    };
    const handleOnUploadVideoPreviewSuccess = (dowloadUrl: string) => {
        if (courseCreatedData.courseId) {
            const data = getUpdateCourseRequest();
            updatecourse({ ...data, videoPreviewUrl: dowloadUrl });
        }
    };

    const getUpdateCourseRequest = (): UpdateCourseRequest => {
        const categoryList = courseCreatedData.courseCategories.map((c) => c.categoryId);
        return {
            categoryList,
            courseId: courseCreatedData.courseId,
            courseIsActive: courseCreatedData.courseIsActive,
            description: courseCreatedData.description,
            imageUrl: courseCreatedData.imageUrl,
            isPublic: courseCreatedData.isPublic,
            knowdledgeDescription: courseCreatedData.knowdledgeDescription,
            linkCertificated: courseCreatedData.linkCertificated,
            price: courseCreatedData.price,
            salesCampaign: courseCreatedData.salesCampaign,
            title: courseCreatedData.title,
            totalDuration: courseCreatedData.totalDuration,
            videoPreviewUrl: courseCreatedData.videoPreviewUrl,
        };
    };

    const handleOnSaveAll = () => {
        courseCreatedData.sections.forEach((section) => {
            section.steps.forEach(
                ({ duration, position, quizId, videoUrl, stepDescription, stepId, title }) => {
                    let durationTemp = duration;
                    if (quizId != -1) {
                        const index = quizzList.findIndex((quiz) => quiz.quizId === quizId);
                        if (index >= 0) {
                            durationTemp = quizzList[index].questions.length * 1000;
                        }
                    }
                    updateStepMutation({
                        duration: durationTemp,
                        position,
                        quizId,
                        videoUrl,
                        stepDescription,
                        stepId,
                        title,
                    });
                },
            );
        });
        const data = getUpdateCourseRequest();
        updatecourse(data);
        setIsSaveAndQuit(true);
    };

    useEffect(() => {
        if (isUpdateSuccess && data) {
            dispatch(updateCourseImageUrl(data.imageUrl));
            dispatch(updateCoursePreviewUrl(data.videoPreviewUrl));
            message.success('Lưu thành công!');
            if (isSaveAndQuit) {
                dispatch(setSaveAndQuit());
                setIsSaveAndQuit(false);
                dispatch(
                    setCourseMode(
                        currentMode === CouseMode.CREATE ? CouseMode.UPDATE : CouseMode.CREATE,
                    ),
                );
                navigate('/admin/getAllCourse/');
            }
        }
    }, [isUpdateSuccess]);

    return (
        <div className="flex">
            <div className="h-full w-fit">
                <Steps
                    type="default"
                    className="min-h-[600px]"
                    current={current}
                    onChange={onStepChange}
                    direction="vertical"
                    size="small"
                    items={totalSteps}
                />
                <LoadingButton
                    loading={isUpdateLoading || isUpdateStepLoading}
                    className="w-full"
                    onClick={handleOnSaveAll}
                    size="large"
                    variant="contained"
                >
                    Lưu & Quay Lại
                </LoadingButton>
            </div>
            <div className="p-x-4 p-y-2 ml-4 flex-1">
                <Paper elevation={1} className="h-full p-6">
                    {currentMode === CouseMode.UPDATE && current === 0 && (
                        <div className="text-[#333]">
                            <p className="text-xl font-bold text-[#1677ff]">Thông Tin cơ bản</p>
                            <div className="mt-8 flex flex-col gap-8 bg-[#f7f9fa] px-4 py-2">
                                <div className="flex items-center">
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Tiêu đề khóa học:
                                    </p>
                                    <div className="flex-1 px-4">
                                        <EditableText
                                            onChage={(value) =>
                                                dispatch(
                                                    setCourseCreatedData({
                                                        ...addCourseState.courseCreatedData,
                                                        title: value + '',
                                                    }),
                                                )
                                            }
                                            maxLength={60}
                                            onDoneClick={() => { }}
                                            showCount
                                            value={addCourseState.courseCreatedData.title}
                                        />
                                    </div>
                                </div>

                                {/* Thể loại */}
                                <div className="mt-8 flex flex-col gap-2 bg-[#f7f9fa] px-4 py-2">
                                    <p className="text-base font-medium text-[#1677ff]">Thể loại:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tagsData.map((category) => (
                                            <CheckableTag
                                                key={category.catgoryId}
                                                checked={
                                                    courseCategories.findIndex(
                                                        (c) => c.categoryId === category.catgoryId,
                                                    ) >= 0
                                                }
                                                onChange={(checked) =>
                                                    handleTagChange(category.catgoryId, checked)
                                                }
                                            >
                                                {category.name}
                                                <span
                                                    style={{
                                                        marginLeft: 4,
                                                        cursor: 'pointer',
                                                        color: 'red',
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCategory(category.catgoryId);
                                                    }}
                                                >
                                                    ×
                                                </span>
                                            </CheckableTag>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 w-full max-w-sm">
                                        <Input
                                            placeholder="Nhập tên thể loại mới"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="primary"
                                            onClick={handleAddNewCategory}
                                            className="whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            Thêm
                                        </Button>
                                    </div>
                                </div>

                                {/* Mô tả & mục tiêu */}
                                <div
                                    className={isEditDescription ? '' : 'flex flex-wrap items-center'}
                                >
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Mô tả khóa học:
                                    </p>
                                    <div
                                        className="px-4"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        {isEditDescription ? (
                                            <RichTextEditor
                                                initialValue={courseCreatedData.description}
                                                onSave={(value) => {
                                                    dispatch(setCourseDescription(value));
                                                    setEditDescription(false);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <RenderRichText
                                                    jsonData={courseCreatedData.description}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{
                                                        opacity: isHovered ? 1 : 0,
                                                        scale: isHovered ? 1 : 0.5,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        type: 'spring',
                                                    }}
                                                >
                                                    <IconButton
                                                        disabled={!isHovered}
                                                        onClick={() =>
                                                            setEditDescription(true)
                                                        }
                                                        size="small"
                                                    >
                                                        <CreateIcon />
                                                    </IconButton>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Mục tiêu khóa học:
                                    </p>
                                    <MultipleInput
                                        maxInputItem={8}
                                        maxLengthInput={160}
                                        seperator="|"
                                        placeholders={[
                                            'vd: Kiến thức OOP',
                                            'vd: Kiến thức về giải mã hóa',
                                            'vd: Kiến thức CSDL cơ bản',
                                        ]}
                                        onDataChange={(data) =>
                                            dispatch(setCourseKnowledge(data))
                                        }
                                        values={courseCreatedData.knowdledgeDescription}
                                        size="middle"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload & Curriculum & Publication */}
                    {((currentMode === CouseMode.CREATE && current === 0) ||
                        (currentMode === CouseMode.UPDATE && current === 1)) && (
                            <div>
                                <p className="text-xl font-bold text-[#1677ff]">Hiển thị</p>
                                <div className="mt-8 flex flex-col gap-4 bg-[#f7f9fa] px-4 py-2">
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Thêm Thumbnail cho khóa học
                                    </p>
                                    <UploadFileCustom
                                        onUploadFileSuccess={handleOnUploadVideoPreviewSuccess}
                                        onUploadFileError={(e) => console.error('Upload video lỗi:', e)} // ✅ thêm dòng này
                                        fileName={`course${courseCreatedData.courseId}`}
                                        fileType={UploadFileType.VIDEO}
                                        showPreview
                                        imgLink={courseCreatedData.videoPreviewUrl}
                                        storePath="videos/coursesPreview/"
                                        buttonText="Lưu"
                                        isLoading={isUpdateLoading}
                                    />

                                </div>
                                <div className="mt-8 flex flex-col gap-4 bg-[#f7f9fa] px-4 py-2">
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Thêm video giới thiệu ngắn
                                    </p>
                                    <UploadFileCustom
                                        onUploadFileSuccess={handleOnUploadVideoPreviewSuccess}
                                        onUploadFileError={(e) => console.error('Upload video lỗi:', e)} // ✅ thêm dòng này
                                        fileName={`course${courseCreatedData.courseId}`}
                                        fileType={UploadFileType.VIDEO}
                                        showPreview
                                        imgLink={courseCreatedData.videoPreviewUrl}
                                        storePath="videos/coursesPreview/"
                                        buttonText="Lưu"
                                        isLoading={isUpdateLoading}
                                    />

                                </div>
                            </div>
                        )}

                    {((currentMode === CouseMode.CREATE && current === 1) ||
                        (currentMode === CouseMode.UPDATE && current === 2)) && <Curriculum />}

                    {((currentMode === CouseMode.CREATE && current === 2) ||
                        (currentMode === CouseMode.UPDATE && current === 3)) && <Publication />}
                </Paper>
            </div>
        </div>
    );
};

export default CourseContent;
