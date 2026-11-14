# MindX — cập nhật trạng thái lịch và UX nhận xét

Áp dụng SAU MindX-Payroll-Reconciliation-CHANGED-ONLY.zip. Gói chỉ gồm file mới/thay đổi, giữ chức năng đối soát, header/sidebar, cấu hình Firebase và dữ liệu hiện có.

## Windows PowerShell

Dừng server bằng Ctrl+C. Tại D:\salary-tracker:

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\MindX-Reviews-Schedule-UX-FIX-CHANGED-ONLY.zip" -DestinationPath . -Force
npm run build
npm run dev
```

Không thêm dependency. Không cần sửa .env.local. Giải nén bản này sau cùng; các bản cũ có thể ghi đè file đã sửa.

## 5 thay đổi

1. Lịch phát sinh Dự kiến tự được tính là Đã thực hiện sau GIỜ KẾT THÚC, không chỉ sau ngày bắt đầu. Lịch qua nửa đêm chờ đủ thời lượng. Lịch nghỉ/hủy/người khác dạy thay không bị đổi. Tổng quan, thống kê, lịch phát sinh và các luồng dùng chung hàm xử lý ngày nghỉ sử dụng trạng thái tính toán này. Tự cập nhật tổng quan/thống kê mỗi phút và khi quay lại tab. Không ghi hàng loạt vào Firebase, không coi là đã nhận tiền. Form sửa lấy bản gốc để khi chuyển lịch dự kiến cũ sang tương lai, lịch lại trở về Dự kiến.
2. Popup nhận xét theo buổi: Lưu nháp, Cập nhật mẫu, Chuẩn hóa dấu, Lấy lại mẫu, Sao chép và lưu nháp nằm cùng thanh thao tác phía trên (tự xuống hàng trên màn hình nhỏ). Sao chép thành công sẽ lưu nháp nhưng giữ popup mở. Không tự tích Hoàn thành. Lỗi copy/lưu được phân biệt; phần soạn vẫn được giữ khi lỗi. Bài tập về nhà có nhãn Có nội dung/Cần bổ sung dựa trên văn bản đang dùng, kể cả bài tập mặc định.
3. Nút Cập nhật mẫu ngay trong popup dùng nội dung bài học và bài tập đang soạn để cập nhật đúng học phần/buổi. Có xác nhận phạm vi mẫu dùng chung. KHÔNG đưa nhận xét học sinh vào mẫu. Muốn lưu bản riêng của lớp, dùng Lưu nháp hoặc Sao chép và lưu nháp. Các bản nhận xét đã lưu của lớp khác không bị thay thế.
4. Ngày nghỉ: giữ thiết kế Dòng thời gian với ô ngày và nội dung, xếp 3 thẻ/hàng từ 1280px, 2 thẻ từ 768px, 1 thẻ trên điện thoại. Giữ lựa chọn Thẻ cũ.
5. Lớp học: bỏ hai nút Theo tháng/Tất cả thời gian. Bộ chọn tháng trên header tiếp tục lọc lớp; vẫn hiển thị lớp đã hoàn thành nếu có buổi dạy trong tháng đó.

## Kiểm thử

65 kiểm thử Node đạt; build production đạt (vẫn có cảnh báo bundle lớn). Kiểm thử popup ở 375/768/1440px: copy kèm lưu, cập nhật mẫu không kèm comments, nhãn bài tập, lỗi lưu, vị trí nút. Kiểm tra bố cục ngày nghỉ 3 cột, bỏ nút phạm vi lớp nhưng vẫn hiển thị lớp tháng cũ. Kiểm thử tổng quan với 6 lịch phát sinh đã qua giờ, tổng 1.040.000đ: Còn dự kiến = 0, Đã thực hiện = 1.040.000đ.

UI sử dụng callback lưu giả lập; chưa ghi thử vào Firebase thật. Source nối lại callback lưu mẫu và lưu nhận xét hiện có của dự án.

Lưu ý: nếu ca quá khứ thực tế chưa dạy hoặc đã hủy, hãy sửa ngày giờ hoặc xóa/hủy lịch. Việc suy ra Đã thực hiện dựa trên thời điểm kết thúc theo đồng hồ/múi giờ máy, giống cách nhập ngày giờ hiện tại của ứng dụng. Không đối chiếu dữ liệu thật của tài khoản trong lúc kiểm thử.
