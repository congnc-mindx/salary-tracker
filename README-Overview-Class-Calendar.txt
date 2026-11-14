MindX — Tổng quan và lịch dạy

Áp dụng trên bản source hiện tại sau patch Review-Template-Filters-FIX.
Giải nén ZIP vào thư mục dự án chứa package.json; ghi đè các file cùng tên.
Không có node_modules, .env.local hoặc dữ liệu Firebase trong bản vá.

Thay đổi:
- Lớp học của tôi: hai mục Lịch dạy (mặc định) / Các lớp. Lịch tháng và các thao tác ngày giữ nguyên.
- Tổng quan: giữ hàng thu nhập. Bên dưới là lịch hôm nay/ngày mai và mốc cần chú ý.
- Từ 19:00 giờ Việt Nam hiển thị ngày mai; cập nhật mỗi 15 giây hoặc khi quay lại cửa sổ.
- Mốc cần chú ý: buổi 5/9/14 chưa bắt đầu trong 14 ngày tới.
- Hàng dưới: phát sinh tuần này, tuần sau, ngày nghỉ/điều chỉnh từ hôm nay đến hết tuần sau.
- Giới hạn: 4 ca ngày chính; thêm 1 ca của ngày dạy kế tiếp; 4 mốc; 3 mục mỗi khối hàng dưới.
- Vượt giới hạn có số mục còn lại và Xem tất cả mở popup. Các ngày trong lịch tháng giữ giới hạn 2 mục.
- Tổng quan là lịch thời gian thực; bộ chọn tháng điều khiển thu nhập. Lịch tháng ở Lớp học của tôi theo tháng đã chọn.
- Đã qua giờ là nhãn thời gian, không phải xác nhận đã dạy/đã nhận lương. Không sửa dữ liệu trạng thái hoặc phép tính thu nhập.

Kiểm tra: 71/71 Node tests; Vite production build đạt. Đã kiểm tra giao diện desktop với dữ liệu mẫu, popup danh sách/chi tiết và Escape. Chưa kiểm thử với Firebase thật của người dùng. Cảnh báo bundle >500 kB có sẵn.

PowerShell:
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\MindX-Overview-Class-Calendar-CHANGED-ONLY.zip" -DestinationPath "D:\salary-tracker" -Force
Set-Location "D:\salary-tracker"
npm run dev
