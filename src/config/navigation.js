import {
  CalendarDays,
  ClipboardCheck,
  MessageSquare,
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
  { key: "calendar", label: "Lịch dạy", icon: CalendarDays, mobileLabel: "Lịch", showOnMobile: true },
  {
    key: "classes",
    label: "Lớp học của tôi",
    icon: Wallet,
    mobileLabel: "Lớp",
    mobileIcon: GraduationCap,
    showOnMobile: false,
  },
  {
    key: "makeup",
    label: "Lịch phát sinh",
    icon: Clock,
  },
  {
    key: "salary",
    label: "Thống kê",
    icon: Coins,
    mobileLabel: "Lương",
    showOnMobile: false,
  },
  { key: "reconcile", label: "Đối soát", icon: ClipboardCheck, showOnMobile: true },
  {
    key: "reviews",
    label: "Nhận xét",
    icon: MessageSquare,
    showOnMobile: true,
  },
  { key: "holidays", label: "Ngày nghỉ", icon: CalendarDays },
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
