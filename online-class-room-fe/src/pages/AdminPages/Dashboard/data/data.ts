import { FaUsersLine, FaDiscourse, FaMoneyBillTrendUp } from "react-icons/fa6";
import { BsCartCheckFill } from "react-icons/bs";

export const cards = [
  {
    id: 1,
    title: "Người dùng",
    change: +12,
    icon: FaUsersLine,
    iconColor: "#1e81b0",
    backgroundColor: "bg-blue-100",
  },
  {
    id: 2,
    title: "Khóa học",
    change: +2,
    icon: FaDiscourse,
    iconColor: "#5619b3",
    backgroundColor: "bg-purple-100",
  },
  {
    id: 3,
    title: "Doanh thu",
    change: +18,
    icon: FaMoneyBillTrendUp,
    iconColor: "#eab308",
    backgroundColor: "bg-yellow-100",
  },
  {
    id: 4,
    title: "Đơn hàng",
    change: -21,
    icon: BsCartCheckFill,
    iconColor: "#02b88a",
    backgroundColor: "bg-green-100",
  },
];
