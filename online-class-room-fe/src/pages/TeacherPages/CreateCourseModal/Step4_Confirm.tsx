import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Descriptions, Image, Divider, Card, Tag, Typography } from "antd";
import { useGetCategoryQuery } from "../../../services/categoryService";

const { Text, Title } = Typography;

export default function Step4_Confirm() {
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);
    const { data: allCategories = [] } = useGetCategoryQuery();

    // CATEGORY NAMES
    const categoryNames =
        course.courseCategories
            ?.map((c) => {
                const cat = allCategories.find((x: any) => x.catgoryId === c.categoryId);
                return cat?.name;
            })
            .filter(Boolean)
            .join(", ") || "Chưa chọn";

    // FIELD NAME (theo category)
    const firstField =
        course.courseCategories?.[0]?.category?.fieldCategories?.[0]?.field?.name || "Không có";

    // LEVELS FORMAT (1|2|3 → Fresher, Junior, Master)
    const levelNames = (course.suitableLevels || "")
        .split("|")
        .filter(Boolean)
        .map((l) => {
            if (l === "1") return "Fresher";
            if (l === "2") return "Junior";
            if (l === "3") return "Master";
            return l;
        })
        .join(", ");

    const priceAfterDiscount = Math.max(
        0,
        (course.price || 0) - ((course.price || 0) * (course.salesCampaign || 0)) / 100
    );

    return (
        <div className="flex flex-col md:flex-row gap-8">

            {/* LEFT COLUMN */}
            <div className="md:w-1/2 space-y-4">
                {course.imageUrl && (
                    <Card bordered hoverable className="rounded-xl overflow-hidden">
                        <Image src={course.imageUrl} alt="Ảnh khóa học" width="100%" />
                    </Card>
                )}

                {course.videoPreviewUrl && (
                    <Card bordered className="rounded-xl">
                        <video src={course.videoPreviewUrl} controls className="w-full rounded-lg" />
                    </Card>
                )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="md:w-1/2">
                <Title level={4} className="text-[#1677ff]">
                    Thông tin khóa học
                </Title>

                <Descriptions bordered column={1} size="small">

                    <Descriptions.Item label="Tiêu đề">
                        {course.title || "(Chưa có tiêu đề)"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Mô tả">
                        <div dangerouslySetInnerHTML={{ __html: course.description || "" }} />
                    </Descriptions.Item>

                    <Descriptions.Item label="Lĩnh vực">
                        {firstField}
                    </Descriptions.Item>

                    <Descriptions.Item label="Cấp độ phù hợp">
                        {levelNames || "Chưa chọn"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Thể loại">
                        {categoryNames}
                    </Descriptions.Item>

                    <Descriptions.Item label="Giá gốc">
                        {course.price?.toLocaleString()} ₫
                    </Descriptions.Item>

                    <Descriptions.Item label="Giảm giá">
                        {course.salesCampaign || 0}%
                    </Descriptions.Item>

                    <Descriptions.Item label="Giá sau giảm">
                        <Text strong className="text-green-600">
                            {priceAfterDiscount.toLocaleString()} ₫
                        </Text>
                    </Descriptions.Item>

                    {/* <Descriptions.Item label="Chứng chỉ (Link)">
                        {course.linkCertificated || "Không có"}
                    </Descriptions.Item> */}
                </Descriptions>

                <Divider />

                <Card bordered className="rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">Mục tiêu khóa học:</p>

                    {course.knowdledgeDescription ? (
                        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                            {course.knowdledgeDescription
                                .split("|")
                                .filter(Boolean)
                                .map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                        </ul>
                    ) : (
                        <Text type="secondary">Chưa có mục tiêu</Text>
                    )}
                </Card>

                <Divider />

                <div className="mt-4">
                    <Tag color="blue">
                        Tổng thời lượng: {course.totalDuration || 0} phút
                    </Tag>

                    <Tag color="default">Trạng thái: Nháp</Tag>
                </div>
            </div>
        </div>
    );
}
