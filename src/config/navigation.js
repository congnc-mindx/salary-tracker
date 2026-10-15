import {
  CalendarDays,
  Clock,
  Coins,
  GraduationCap,
  Home,
  Settings,
  Wallet,
} from "lucide-react";

export const navigationItems = [
  {
    key: "overview",
    label: "Tổng quan",
    icon: Home,
    showOnMobile: true,
  },
  {
    key: "classes",
    label: "Lớp học của tôi",
    icon: Wallet,
    mobileLabel: "Lớp",
    mobileIcon: GraduationCap,
    showOnMobile: true,
  },
  {
    key: "makeup",
    label: "Lịch phát sinh",
    icon: Clock,
  },
  {
    key: "holidays",
    label: "Ngày nghỉ",
    icon: CalendarDays,
  },
  {
    key: "salary",
    label: "Thống kê",
    icon: Coins,
    mobileLabel: "Lương",
    showOnMobile: true,
  },
  {
    key: "settings",
    label: "Cài đặt",
    icon: Settings,
    showOnMobile: true,
  },
];

export const mobileNavigationItems = navigationItems.filter(
  (item) => item.showOnMobile,
);
