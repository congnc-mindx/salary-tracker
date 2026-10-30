# Bản sửa nhận xét — Đợt 4

## Cập nhật
Chép src vào dự án đang dùng, thay file trùng tên; giữ nguyên .env.local. Không cần nhập lại mẫu hoặc nhận xét đã lưu.

## Thay đổi mới
- Nhận xét từng buổi chỉ có buổi 1–13 cho khóa 14 buổi. Buổi cuối dùng mẫu Cuối khóa; không tạo thẻ nhận xét thường. Kho mẫu từng buổi hiện 13 ô. Mẫu buổi 14 cũ nếu có không bị xóa trong Firebase.
- Mở nhận xét từ giờ bắt đầu buổi học. Ví dụ 14h–16h: lúc 15h có thể soạn, lưu nháp; sau 16h mở lại bản đã lưu để sao chép. Không tự gửi Zalo và không khóa nút sao chép trước giờ kết thúc.
- Lưu đóng cửa sổ nhưng không tích Hoàn thành. Bản nháp tồn tại qua tải lại trang và chuyển thiết bị sau khi Firebase xác nhận lưu thành công.
- Thẻ đang trong giờ học ghi Đang học; hết giờ ghi Đã kết thúc. Chưa tích thì vẫn treo; lớp đã kết thúc toàn bộ khóa tiếp tục được ẩn theo yêu cầu trước.
- Tự nhận học phần từ mã rõ ràng, ví dụ JSB45 hoặc MK-JSB45 → JSB, PREI02 → PREI. Ưu tiên học phần đã chọn thủ công. Mã không xác định hoặc có nhiều học phần sẽ yêu cầu chọn trong Sửa lớp.
- Nhận diện mã chỉ dùng khi hiển thị, không ghi đè hàng loạt dữ liệu lớp. Khi Sửa lớp và lưu, giá trị nhận diện sẽ được lưu cùng thông tin lớp.
- Mẫu mới không ghi đè bản nhận xét của lớp đã lưu. Muốn áp dụng lại mẫu vào bản cũ, dùng Lấy lại nội dung mẫu; phần nhận xét học sinh được giữ lại.

## Kiểm tra
Build production và 24 kiểm tra logic đạt: mã JSB, thời điểm 14h/15h/16h, giữ nháp, buổi cuối, các trường hợp trước. Chưa kiểm thử tài khoản Firebase thật hoặc thao tác trực tiếp trong trình duyệt.

