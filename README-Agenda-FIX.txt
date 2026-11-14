Áp dụng trên bản MindX-Overview-Class-Calendar-CHANGED-ONLY.
Giải nén ghi đè vào thư mục chứa package.json. Không thay .env.local, không ghi dữ liệu Firebase.

1. Bỏ khối Tiếp theo. Trước 19:00 hiển thị hôm nay; từ 19:00 hiển thị riêng ngày mai theo giờ Việt Nam, kể cả hôm nay đang có ca 19-21h. Ngày mai không có ca thì hiện trạng thái trống.
2. Component TimeBadge dùng chung cho giờ Tổng quan/Mốc cần chú ý/lịch phát sinh và ngày trên thẻ Ngày nghỉ.
3. Các lớp đã hoàn thành ẩn mặc định. Nút phía dưới mở lại các lớp đã hoàn thành phù hợp tháng/bộ lọc; đổi tháng tự thu gọn. Bộ lọc Đã hoàn thành vẫn cho xem trực tiếp.
4. Đối soát: bỏ limitToLast trên ID, tải dải payrollRun_ theo chiều tăng và sắp xếp createdAt ở client, giữ 30 lần gần nhất. Không sửa quyền Firebase, dữ liệu hay quy tắc đối soát. Cách này đọc toàn bộ lịch sử thuộc dải payrollRun_ trước khi lấy 30 bản, phù hợp dữ liệu cá nhân; nếu lịch sử lớn cần phân trang riêng.

Kiểm tra: production build đạt, 72 tests đạt. Chưa xác minh truy vấn với Firebase thật và chưa kiểm tra lại giao diện bản sửa trên trình duyệt. Cảnh báo bundle >500 kB hiện có.
