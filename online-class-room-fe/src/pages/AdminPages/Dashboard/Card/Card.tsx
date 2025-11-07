import React from "react";
import { FaRegIdCard } from "react-icons/fa6";
import { IconType } from "react-icons/lib";
import { Spin } from "antd";
import {
  useTotalIncomeQuery,
  useTotalOrderQuery,
} from "../../../../services/order.services";
import { useCountTotalAccountsQuery } from "../../../../services/account.services";
import { useCountTotalCoursesQuery } from "../../../../services/course.services";

interface CardItem {
  id: number;
  title: string;
  number?: number;
  change: number;
  icon?: IconType;
  iconColor?: string;
  iconSize?: number;
  backgroundColor?: string;
}

interface CardProps {
  item: CardItem;
}

const Card: React.FC<CardProps> = ({ item }) => {
  const IconComponent = item.icon || FaRegIdCard;

  const { data: doanhThu, isLoading: loadingDoanhThu } = useTotalIncomeQuery();
  const { data: donHang, isLoading: loadingDonHang } = useTotalOrderQuery();
  const { data: nguoiDung, isLoading: loadingNguoiDung } = useCountTotalAccountsQuery();
  const { data: khoaHoc, isLoading: loadingKhoaHoc } = useCountTotalCoursesQuery();

  const isLoading =
    loadingDoanhThu || loadingDonHang || loadingNguoiDung || loadingKhoaHoc;

  // Giả định tỷ giá USD -> VND
  const exchangeRateUSDToVND = 23000;

  let value = 0;
  switch (item.title) {
    case "Doanh thu":
      value = (doanhThu || 0) ;
      break;
    case "Đơn hàng":
      value = donHang || 0;
      break;
    case "Người dùng":
      value = nguoiDung || 0;
      break;
    case "Khóa học":
      value = khoaHoc || 0;
      break;
    default:
      value = item.number || 0;
  }

  if (isLoading)
    return (
      <div className="flex h-[150px] w-full items-center justify-center rounded-xl bg-white shadow-md">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <div className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Thông tin */}
      <div className="flex flex-col gap-2">
        <span className="text-base font-semibold text-gray-700">{item.title}</span>
        <span className="text-3xl font-bold text-[#1677ff]">
          {item.title === "Doanh thu"
            ? `${value.toLocaleString("vi-VN")} ₫`
            : value.toLocaleString("vi-VN")}
        </span>
        <span className="text-sm text-gray-500">
          <span
            className={`font-medium ${
              item.change < 0 ? "text-red-500" : "text-green-600"
            }`}
          >
            {item.change > 0 ? "+" : ""}
            {item.change}%
          </span>{" "}
          so với tuần trước
        </span>
      </div>

      {/* Icon */}
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          item.backgroundColor || "bg-blue-100"
        }`}
      >
        <IconComponent
          size={item.iconSize || 28}
          color={item.iconColor || "#1677ff"}
        />
      </div>
    </div>
  );
};

export default Card;
