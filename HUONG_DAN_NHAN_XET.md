# Bản sửa nhận xét theo tiến độ — Đợt 3

## Cập nhật
1. Sao lưu source hiện tại, chép thư mục src từ ZIP vào dự án và thay file trùng tên. Giữ nguyên .env.local và các cấu hình đang dùng.
2. Chạy npm run dev. Mở Nhận xét → Theo buổi học để xem danh sách tự động.
3. Sau khi đã lấy nhận xét, tích Hoàn thành trên thẻ. Có nút Hoàn tác cho lần đánh dấu gần nhất trong phiên xem trang.

## Danh sách chờ
- Chỉ hiện buổi đã qua giờ kết thúc, cập nhật mỗi 15 giây và khi quay lại cửa sổ.
- Mỗi thẻ là một lớp + một số buổi, lấy chính xác mẫu theo học phần/số buổi và hiển thị nội dung bài học. Bản đã lưu của lớp được ưu tiên so với mẫu chung.
- Chưa tích thì vẫn treo ở danh sách, kể cả lớp học tiếp buổi sau. Các buổi cũ đứng trước để không bị bỏ sót.
- Lưu nội dung hoặc sao chép không tự tích Hoàn thành.
- Lớp đã kết thúc buổi cuối (mặc định buổi 14, theo totalSessions và lịch đã lùi) không xuất hiện trong danh sách này, kể cả còn nhận xét chưa tích. Nhận xét đã lưu vẫn nằm trong dữ liệu; phần Cuối khóa giữ nguyên.
- Buổi hủy/nghỉ hoặc có người dạy thay không tạo việc chờ lấy nhận xét.
- Mốc giờ dùng múi giờ trình duyệt giống lịch hiện tại. Ca qua nửa đêm được xử lý đúng ngày.
- Trạng thái Đã gửi của bản cũ được hiểu là đã hoàn thành nếu chưa có cờ completed riêng. Cờ completed=false sau Hoàn tác được ưu tiên.

## Kho mẫu
- Codings ở trên: Scratch, Game, Python, JavaScript, Computer Science (có CSI).
- Robotics ở dưới: PRE và ARM.
- Mỗi bộ môn vẫn gom các cấp độ theo cột. Trên mỗi thẻ: trái là tên học phần và trạng thái mẫu cuối khóa bên dưới; phải là Mẫu từng buổi phía trên, Mẫu cuối khóa phía dưới.
- ARM vẫn là mục dự phòng, chưa tự đặt tên cấp độ.

## Lưu và đóng
- Lưu mẫu từng buổi, nhận xét từng buổi, mẫu cuối khóa hoặc bản cuối khóa thành công sẽ đóng cửa sổ chỉnh sửa.
- Nếu lưu lỗi, cửa sổ ở lại và giữ nội dung đang nhập.
- Sao chép không đóng cửa sổ. Đóng khi có sửa chưa lưu vẫn hỏi xác nhận.

## Dữ liệu
Giữ cấu trúc đợt 2. Mỗi sessionReviews[số buổi] bổ sung completed và completedAt; đánh dấu dùng transaction giữ nguyên nội dung và các buổi khác. Không sửa cách tính lương hoặc xóa dữ liệu lớp. Không cần cài thêm thư viện hay nhập lại mẫu.

## Kiểm tra
Build production và 20 kiểm tra logic đạt. Bao gồm giờ kết thúc, buổi tồn đọng, tích/hoàn tác, lớp kết thúc khóa, lùi lịch và ca qua nửa đêm. Chưa kiểm thử ghi Firebase thật hoặc thao tác trình duyệt. Cảnh báo bundle lớn của build vẫn còn.
