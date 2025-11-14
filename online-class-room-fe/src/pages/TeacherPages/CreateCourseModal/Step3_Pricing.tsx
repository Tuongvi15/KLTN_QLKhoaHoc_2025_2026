import { InputNumber, Card, Slider, message, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { setCourseCreatedData } from "../../../slices/courseSlice";
import { useEffect, useState } from "react";

export default function Step3_Pricing() {
    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    const [price, setPrice] = useState(course.price || 0);
    const [discount, setDiscount] = useState(course.salesCampaign || 0);

    const finalPrice = Math.max(0, price - (price * discount) / 100);

    useEffect(() => {
        dispatch(setCourseCreatedData({ ...course, price, salesCampaign: discount }));
    }, [price, discount]);

    const handleValidatePrice = () => {
        if (price < 10000) {
            message.warning("💡 Giá khóa học nên từ 10.000₫ trở lên để đảm bảo giá trị!");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái - nhập liệu */}
            <div className="flex flex-col gap-6">
                <div>
                    <p className="font-semibold mb-2 text-[#1677ff]">Giá gốc (₫)</p>
                    <InputNumber
                        value={price}
                        min={0}
                        step={1000}
                        max={100000000}
                        className="w-full"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => (value ? Number(value.replace(/₫\s?|,/g, "")) : 0)}
                        onChange={(val) => setPrice(val || 0)}
                        onBlur={handleValidatePrice}
                    />
                </div>

                <div>
                    <p className="font-semibold mb-2 text-[#1677ff] flex justify-between">
                        Giảm giá (%)
                        <Tag color="green">{discount}%</Tag>
                    </p>
                    <Slider
                        min={0}
                        max={90}
                        step={5}
                        value={discount}
                        onChange={(val) => setDiscount(val)}
                        tooltip={{ open: true }}
                    />
                </div>
            </div>

            {/* Cột phải - Preview */}
            <Card
                title={<span className="text-[#1677ff] font-semibold">Tổng quan giá</span>}
                bordered
                className="shadow-md rounded-xl"
            >
                <div className="space-y-4">
                    <p>
                        <span className="text-gray-500">Giá gốc:</span>{" "}
                        <span className="font-medium">{price.toLocaleString()} ₫</span>
                    </p>

                    <p>
                        <span className="text-gray-500">Giảm:</span>{" "}
                        <span className="text-green-600 font-medium">-{discount}%</span>
                    </p>

                    <p className="text-xl font-bold text-[#52c41a]">
                        Giá sau giảm: {finalPrice.toLocaleString()} ₫
                    </p>

                    {discount >= 70 && (
                        <p className="text-red-500 text-sm">
                            ⚠️ Giảm trên 70% có thể ảnh hưởng tới doanh thu — hãy cân nhắc.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}
