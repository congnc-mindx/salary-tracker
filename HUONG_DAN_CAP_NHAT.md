# Ngày nghỉ và thư viện mẫu nội dung
Áp dụng tiếp lên MindX-Statistics-Reviews-UX-CHANGED-ONLY.zip đã cài. Gói chỉ gồm 4 file thay đổi, nội dung file đầy đủ.

Sao lưu source rồi tại thư mục chứa package.json:
```bash
unzip -o ~/Downloads/MindX-Holidays-Templates-UX-CHANGED-ONLY.zip -d .
npm run build
npm run dev
```
Không xóa thư mục src. Không thêm dependency, không đổi cấu hình Firebase hay dữ liệu.

Thay đổi:
- Ngày nghỉ: ưu tiên ngày/khoảng ngày, phân biệt màu nghỉ cá nhân/theo lớp, hiển thị lớp/cơ sở/ghi chú; chỉ báo khoảng nghỉ qua tháng và hành động xem chi tiết. Giữ nguyên lọc tháng, sửa/xóa.
- Thư viện mẫu: tìm kiếm bộ môn/mã/tên học phần, nhóm thẻ rõ ràng, hành động từng buổi/cuối khóa và trạng thái mẫu cuối khóa.
- Mẫu từng buổi: tiến độ có nội dung /13, trạng thái có nội dung/chưa soạn và xem trước nội dung từng buổi.
- Popup quản lý học phần: nút lưu và lỗi cố định ở footer khi danh sách dài; giữ xác thực, cảnh báo bỏ thay đổi và liên kết dữ liệu.
- Header, sidebar, Lớp học giữ nguyên.

Kiểm tra: production build thành công; Chromium 375/1440 px không tràn ngang, tìm kiếm/không có kết quả, mở chi tiết ngày nghỉ, popup quản lý học phần và popup mẫu buổi; dark mode. Kiểm tra dùng dữ liệu giả, chưa ghi Firebase thật. Build còn cảnh báo bundle gần 994 kB vốn có.
