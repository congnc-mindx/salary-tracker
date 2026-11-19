# MindX Salary Tracker

Ứng dụng cá nhân quản lý lớp học, lịch giảng dạy, nhận xét học sinh và thu nhập tại MindX.

## Chức năng

- **Tổng quan:** lịch hôm nay/ngày mai, mốc buổi 5/9/14, lịch phát sinh và ngày nghỉ.
- **Lịch dạy:** trang riêng để xem lịch và điều chỉnh từng buổi.
- **Lớp học:** danh sách lớp, tiến độ; ẩn lớp hoàn thành mặc định.
- **Lịch phát sinh:** dạy bù, dạy thay, giám khảo và trải nghiệm.
- **Ngày nghỉ:** nghỉ cá nhân hoặc nghỉ lớp; xử lý lùi buổi và người dạy thay.
- **Thống kê:** thu nhập theo tháng/năm, đóng góp theo cơ sở và lớp.
- **Đối soát:** trang riêng, một bảng cho mỗi tháng; dán bảng mới để cập nhật. So sánh từng buổi với lịch dạy hiện tại, nhận diện thiếu, thừa và sai lệch.
- **Nhận xét:** mẫu theo bộ môn/học phần, nhận xét từng buổi và tổng kết khóa học.
- **Cài đặt:** mức lương theo thời điểm, cơ sở và mã bảng lương, xuất/khôi phục dữ liệu.

## Công nghệ

React (JavaScript), Tailwind CSS, Vite và Firebase Authentication/Firestore. Dữ liệu được phân tách theo tài khoản người dùng.

## Nguyên tắc dữ liệu

Lịch sau điều chỉnh là nguồn tính thu nhập. Dạy bù dùng 75% mức lương giờ; các khoản khác áp dụng cấu hình có hiệu lực. Trạng thái hoàn thành lịch không đồng nghĩa đã nhận tiền. Đối soát không tự sửa lịch hoặc mức lương. Chênh lệch bằng tổng bảng trung tâm trừ tổng lịch trong phạm vi đối soát; bảng chưa đủ tháng không kết luận thiếu buổi hay chênh tổng tháng.

Mã cơ sở được thiết lập tập trung. Mã lớp loại bỏ nhãn C4K/ROB, giữ các hậu tố phân biệt lớp.

## Cấu trúc

`src/pages` chứa các trang; `src/components` chứa giao diện tái sử dụng; `src/hooks` quản lý trạng thái; `src/services` xử lý dữ liệu và tính thu nhập; `src/utils` chứa hàm dùng chung; `tests` chứa kiểm thử logic.

## Phát triển

Cài dependencies bằng `npm install`, cấu hình Firebase qua `.env.local`, chạy `npm run dev`. Tạo bản production bằng `npm run build`. Chạy kiểm thử bằng `node --test tests/*.test.js`. Không đưa thông tin xác thực hoặc dữ liệu cá nhân vào repository.
