import { UploadFileCustom } from "../../../components";
import { UploadFileType } from "../../../components/UploadFile/UploadFileCustom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { updateCourseImageUrl, updateCoursePreviewUrl } from "../../../slices/courseSlice";
import { message, Card, Space, Typography } from "antd";
import { FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function Step2_MediaUpload() {
    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Space>
                        <FileImageOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                        <Text strong style={{ fontSize: 15 }}>Ảnh khóa học</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Tỷ lệ khuyến nghị: 16:9 (1920x1080px)
                    </Text>
                    <UploadFileCustom
                        fileName={`thumbnail-course-${course.courseId || "temp"}`}
                        fileType={UploadFileType.IMAGE}
                        onUploadFileSuccess={(url) => {
                            dispatch(updateCourseImageUrl(url));
                            message.success("Đã tải ảnh khóa học!");
                        }}
                        onUploadFileError={(e) => {
                            console.error("❌ Lỗi tải ảnh:", e);
                            message.error("Tải ảnh thất bại, vui lòng thử lại!");
                        }}
                        storePath="images/courseThumbnail/"
                        showPreview
                        imgLink={course.imageUrl}
                    />
                </Space>
            </Card>

            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Space>
                        <VideoCameraOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                        <Text strong style={{ fontSize: 15 }}>Video giới thiệu</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Độ dài khuyến nghị: 1-3 phút, định dạng MP4
                    </Text>
                    <UploadFileCustom
                        fileName={`preview-course-${course.courseId || "temp"}`}
                        fileType={UploadFileType.VIDEO}
                        onUploadFileSuccess={(url) => {
                            dispatch(updateCoursePreviewUrl(url));
                            message.success("Đã tải video giới thiệu!");
                        }}
                        onUploadFileError={(e) => {
                            console.error("❌ Lỗi tải video:", e);
                            message.error("Tải video thất bại, vui lòng thử lại!");
                        }}
                        storePath="videos/coursePreview/"
                        showPreview
                        imgLink={course.videoPreviewUrl}
                    />
                </Space>
            </Card>
        </Space>
    );
}
