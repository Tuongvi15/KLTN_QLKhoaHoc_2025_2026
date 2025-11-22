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
import { RoleType } from '../../../../slices/authSlice';
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
    useGetCategoryQuery,
} from '../../../../services/categoryService';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import Publication from './Publication';
import { useUpdateStepMutation } from '../../../../services/step.services';
import { useNavigate } from 'react-router-dom';

const { CheckableTag } = Tag;

const CourseContent = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
    const dispatch = useDispatch();
    const role = useSelector((state: RootState) => state.auth.currentRole);
    const addCourseState = useSelector((state: RootState) => state.course.addCourse);
    const [updateStepMutation, { isLoading: isUpdateStepLoading }] = useUpdateStepMutation();
    const [isSaveAndQuit, setIsSaveAndQuit] = useState(false);
    const navigate = useNavigate();
    const quizzList = useSelector((state: RootState) => state.quiz.quizList);
    const [addCategoryMutation] = useAddCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
    const [tagsData, setTagsData] = useState<CategoryRespone[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    const courseCategories = addCourseState.courseCreatedData.courseCategories;
    const courseId = addCourseState.courseCreatedData.courseId;

    const {
        data: getCategoryData,
        isSuccess: isGetCategorySuccess,
        refetch,
    } = useGetCategoryQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    useEffect(() => {
        if (isGetCategorySuccess && getCategoryData) {
            setTagsData(getCategoryData);
        }
    }, [isGetCategorySuccess, getCategoryData]);

    // --- Thêm category ---
    const handleAddNewCategory = async () => {
        if (isReadOnly) return message.warning('Admin chỉ được xem, không thể thêm thể loại!');
        if (!newCategoryName.trim()) return message.error('Vui lòng nhập tên thể loại!');
        try {
            const newCategory = await addCategoryMutation({
                categoryName: newCategoryName,
                categoryDescription: newCategoryName,
            }).unwrap();

            setTagsData((prev) => [...prev, newCategory]);
            message.success('Thêm loại thành công!');
            setNewCategoryName('');
            refetch();
        } catch (err) {
            console.error(err);
            message.error('Thêm loại thất bại!');
        }
    };

    // --- Xóa category ---
    const handleDeleteCategory = async (categoryId: number) => {
        if (isReadOnly) return message.warning('Admin chỉ được xem, không thể xóa thể loại!');
        try {
            await deleteCategory(categoryId).unwrap();
            message.success('Xóa loại thành công!');

            setTagsData((prev) => prev.filter((c) => c.catgoryId !== categoryId));
            const updatedCourseCategories = courseCategories.filter(
                (c) => c.categoryId !== categoryId
            );
            dispatch(updateCourseCategory(updatedCourseCategories));
        } catch (err) {
            console.error(err);
            message.error('Xóa loại thất bại!');
        }
    };

    // --- Chọn/deselect category ---
    const handleTagChange = (categoryId: number, checked: boolean) => {
        if (isReadOnly) return;
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
        if (isReadOnly) return message.warning('Admin không được chỉnh sửa ảnh!');
        if (courseCreatedData.courseId) {
            const data = getUpdateCourseRequest();
            updatecourse({ ...data, imageUrl: dowloadUrl });
        }
    };
    const handleOnUploadVideoPreviewSuccess = (dowloadUrl: string) => {
        if (isReadOnly) return message.warning('Admin không được chỉnh sửa video!');
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
            suitableLevels: courseCreatedData.suitableLevels ?? "",

        };
    };

    const handleOnSaveAll = () => {
        // ✅ Nếu admin → chỉ được xuất bản
        if (isReadOnly) {
            // const data = getUpdateCourseRequest();
            // updatecourse({ ...data, isPublic: true });
            //message.success('Khóa học đã được xuất bản!');
            navigate('/admin/getAllCourse/');
        }

        // ✅ Teacher có thể chỉnh sửa
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
                }
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
                        currentMode === CouseMode.CREATE ? CouseMode.UPDATE : CouseMode.CREATE
                    )
                );
                if (role === RoleType.TEACHER) {
                    navigate('/teacher/getAllCourse');
                } else {
                    navigate('/admin/getAllCourse/');
                }
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
                    {'Quay Lại'}
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
                                        {isReadOnly ? (
                                            <span className="font-medium text-gray-700">
                                                {addCourseState.courseCreatedData.title || '(Không có tiêu đề)'}
                                            </span>
                                        ) : (
                                            <EditableText
                                                onChage={(value) => {
                                                    dispatch(
                                                        setCourseCreatedData({
                                                            ...addCourseState.courseCreatedData,
                                                            title: value + '',
                                                        })
                                                    );
                                                }}
                                                onDoneClick={() => { }}  // ✅ thêm dòng này để fix lỗi TS2741
                                                maxLength={60}
                                                value={addCourseState.courseCreatedData.title}
                                            />
                                        )}


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
                                                        (c) => c.categoryId === category.catgoryId
                                                    ) >= 0
                                                }
                                                onChange={(checked) =>
                                                    handleTagChange(category.catgoryId, checked)
                                                }
                                            >
                                                {category.name}
                                                {!isReadOnly && (
                                                    <span
                                                        style={{
                                                            marginLeft: 4,
                                                            cursor: 'pointer',
                                                            color: 'red',
                                                            fontWeight: 'bold',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory(category.catgoryId);
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                )}
                                            </CheckableTag>
                                        ))}
                                    </div>

                                    {/* Thêm thể loại mới */}
                                    {!isReadOnly && (
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
                                    )}
                                </div>

                                {/* Mô tả & mục tiêu */}
                                <div>
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Mô tả khóa học:
                                    </p>
                                    {isReadOnly ? (
                                        <RenderRichText jsonData={courseCreatedData.description} />
                                    ) : (
                                        <RichTextEditor
                                            initialValue={courseCreatedData.description}
                                            onSave={(value) => {
                                                dispatch(setCourseDescription(value));
                                            }}
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Mục tiêu khóa học:
                                    </p>
                                    {isReadOnly ? (
                                        <ul className="list-disc pl-6 text-gray-700">
                                            {courseCreatedData.knowdledgeDescription
                                                ?.split('|')
                                                .map((item: string, idx: number) => (
                                                    <li key={idx}>{item.trim()}</li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <MultipleInput
                                            maxInputItem={8}
                                            maxLengthInput={160}
                                            seperator="|"
                                            onDataChange={(data) => dispatch(setCourseKnowledge(data))}
                                            values={courseCreatedData.knowdledgeDescription}
                                            size="middle"
                                        />
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                    {((currentMode === CouseMode.CREATE && current === 0) ||
                        (currentMode === CouseMode.UPDATE && current === 1)) && (
                            <div>
                                <p className="text-xl font-bold text-[#1677ff]">Hiển thị</p>
                                <div className="mt-8 flex flex-col gap-4 bg-[#f7f9fa] px-4 py-2">
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Thumbnail khóa học
                                    </p>

                                    {isReadOnly ? (
                                        <img
                                            src={courseCreatedData.imageUrl}
                                            alt="Course Thumbnail"
                                            className="max-w-md rounded-lg border"
                                        />
                                    ) : (
                                        <UploadFileCustom
                                            onUploadFileSuccess={(url) => {
                                                const data = getUpdateCourseRequest();
                                                updatecourse({ ...data, imageUrl: url });
                                                dispatch(updateCourseImageUrl(url));
                                            }}
                                            onUploadFileError={(e) => console.error('Upload ảnh lỗi:', e)}
                                            fileName={`course${courseCreatedData.courseId}`}
                                            fileType={UploadFileType.IMAGE}
                                            showPreview
                                            imgLink={courseCreatedData.imageUrl}
                                            storePath="images/courseThumbnail/"
                                            buttonText="Lưu"
                                        />
                                    )}

                                </div>
                                <div className="mt-8 flex flex-col gap-4 bg-[#f7f9fa] px-4 py-2">
                                    <p className="text-base font-medium text-[#1677ff]">
                                        Video giới thiệu
                                    </p>
                                    {isReadOnly ? (
                                        <video
                                            controls
                                            className="max-w-md rounded-lg border"
                                            src={courseCreatedData.videoPreviewUrl}
                                        />
                                    ) : (
                                        <UploadFileCustom
                                            onUploadFileSuccess={handleOnUploadVideoPreviewSuccess}
                                            onUploadFileError={(e) => console.error('Upload video lỗi:', e)}
                                            fileName={`course${courseCreatedData.courseId}`}
                                            fileType={UploadFileType.VIDEO}
                                            showPreview
                                            imgLink={courseCreatedData.videoPreviewUrl}
                                            storePath="videos/coursesPreview/"
                                            buttonText="Lưu"
                                        />
                                    )}

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
