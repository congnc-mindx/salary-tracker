# MindX — Cài đặt dữ liệu, lớp theo tháng và thẻ thông tin
Ngày: 09/11/2026

## Cài đặt
Áp dụng tiếp lên bản MindX-Holidays-Templates-UX-CHANGED-ONLY.zip đã cài.
Gói chỉ chứa file mới/thay đổi; từng file đầy đủ nội dung, đúng đường dẫn.
Sao lưu source hiện tại. Tại thư mục gốc dự án (chứa package.json), chạy:

```bash
unzip -o ~/Downloads/MindX-Settings-Monthly-Classes-UX-CHANGED-ONLY.zip -d .
npm run build
npm run dev
```

Không xóa thư mục src. Không thêm dependency, không thay package.json, .env.local hay cấu hình Firebase.

## Phạm vi giao diện
- Giữ nguyên PageHeader, sidebar và vị trí các nút. Chỉ bật điều khiển tháng có sẵn cho trang Lớp học.
- Giữ lưới, bộ lọc và phong cách thẻ lớp. Dòng Buổi/ngày/giờ chuyển ngay dưới tên; Sắp khai giảng thay nhãn Đã học khi lớp chưa bắt đầu.
- Cài đặt chia Thu nhập / Danh mục / Dữ liệu. Bổ sung lịch sử mức lương và danh sách cơ sở kèm mã viết tắt; quản lý bộ môn dẫn tới luồng có sẵn.
- Ngày nghỉ mặc định dạng danh sách theo thời gian: ô ngày, khoảng ngày, lớp/phạm vi, lý do. Nút Thẻ cũ khôi phục cách trình bày của bản trước ngay trong trang, không cần giải nén lại.
- Lịch phát sinh hiển thị mã cơ sở–lớp, ngày/giờ nổi bật, thời lượng/số học sinh/ghi chú và tiền/trạng thái. Bộ lọc tìm được OCP-JSB14.
- Dùng chung hàm tên lớp để Ocean Park, Oceanpark và OCP đều thành OCP; không thêm tiền tố lần hai.

## Quy ước lớp theo tháng
- Chế độ mặc định Theo tháng: lớp có ít nhất một buổi planned/confirmed trong tháng, sau khi áp dụng lịch nghỉ.
- Đếm riêng số lớp và tổng buổi dạy; lớp đã kết thúc vẫn xuất hiện trong tháng có dạy.
- Buổi nghỉ, hủy, bị lùi ra tháng khác hoặc người khác dạy thay không tính vào số buổi giáo viên dạy trong tháng.
- Trạng thái và thanh tiến độ vẫn phản ánh hiện tại, không giả lập trạng thái quá khứ. Các bộ lọc Trạng thái/Buổi tiếp theo cũng theo hiện tại.
- Tất cả thời gian giữ hành vi cũ: mặc định ẩn lớp hoàn thành, có thể tìm kiếm/chọn Đã hoàn thành để xem.
- Lớp bị xóa khỏi Firebase không thể tái hiện chỉ bằng bộ lọc tháng. Dữ liệu lịch sử được tính từ dữ liệu lớp hiện còn lưu.

## Xuất Excel
- File .xlsx thật, không đổi đuôi CSV. Chọn một trong 5 năm gần nhất (năm hiện tại và 4 năm trước).
- 7 sheet: Tổng hợp tháng, Buổi học, Lịch phát sinh, Lớp học, Ngày nghỉ, Buổi lùi lịch, Hướng dẫn.
- Số tiền là ô số, văn bản là ô chuỗi; dữ liệu văn bản không được thực thi thành công thức Excel.
- Tổng được tính bằng dịch vụ lịch/lương hiện có; đã xác nhận không có nghĩa đã nhận tiền. Các tháng tương lai có thể gồm lịch dự kiến.
- Excel phục vụ đối soát. Nhận xét và toàn bộ kho mẫu được lưu trong JSON, không dùng Excel để khôi phục.

## JSON và khôi phục
- Đọc trực tiếp từ server: courses, holidays, overrides, extras, settings/income và settings/sessionTemplates_*.
- Bao gồm nhận xét trong lớp, kho mẫu từng buổi/cuối khóa, cơ sở, bộ môn, lịch sử mức lương.
- Không sao lưu thông tin đăng nhập, biến môi trường, dấu nhập localStorage hoặc các bảng incomeExports sinh tự động. Bảng đồng bộ zWhisFlow được tính lại từ dữ liệu nguồn.
- Chỉ nhận định dạng mindx-teaching-backup phiên bản 1 được tạo bởi chức năng này. Không nhập JSON expense tracker hoặc JSON tự đặt cấu trúc khác.
- Chọn file → xem số bản ghi và phương án → xác nhận. Mặc định chỉ thêm bản ghi có ID chưa tồn tại; bản trùng được giữ nguyên toàn bộ, không gộp sâu từng trường/mẫu con.
- Cập nhật bản trùng ID: thay toàn bộ nội dung bản trùng bằng file. Không xóa bản ghi ngoài file; đây không phải thao tác thay toàn bộ cơ sở dữ liệu.
- Trước khi nhập, trình duyệt tải bản MindX-before-restore*.json từ dữ liệu server hiện tại. Cần giữ file này để phục hồi nếu chọn nhầm nội dung.
- Kiểm tra định dạng, ID trùng/đường dẫn, kiểu dữ liệu cơ bản, ngày giờ, số buổi, lương, kho mẫu trước khi ghi.
- Mỗi lần nhập tối đa 400 bản ghi cần ghi và 7 MB dữ liệu giao dịch; file chọn tối đa 20 MB. Nếu vượt, dừng trước khi ghi, không nhập từng phần. Xuất sao lưu không bị giới hạn 400 bản ghi.
- Ghi trong một Firestore transaction. Nếu bản ghi đích thay đổi từ lúc xem trước hoặc lỗi giao dịch, không báo thành công và yêu cầu xem trước lại. Không ghi đè im lặng lên thay đổi mới.
- Cần quyền đọc collection settings và quyền ghi các document dữ liệu của chính tài khoản theo Firebase Rules đang dùng. Chưa sửa Rules và chưa kiểm tra tài khoản thật.

## Kiểm chứng
- Production build đạt; 47/47 test logic đạt.
- Test transaction dùng giả lập lớp giao dịch: đọc trước ghi, xung đột thêm/sửa, lỗi commit không báo thành công.
- Chromium 375/1024/1440 px: xuất Excel/JSON, từ chối JSON sai, xem trước, chế độ thêm/cập nhật, xác nhận nhập, lỗi giữ popup; lớp lịch sử, lớp sắp khai giảng, đổi cách xem ngày nghỉ và tìm OCP-JSB14.
- Mở đọc các file .xlsx bằng openpyxl: 7 sheet, tổng tháng khớp 2 buổi lớp + 1 buổi dạy bù; kiểm tra ô số và mã lớp.
- Kiểm tra ảnh render light/dark. Header và sidebar đối chiếu byte không đổi.
- Lint không có lỗi chặn, không có warning mới ở module mới; các warning sẵn có ngoài phạm vi vẫn còn.
- Build còn cảnh báo bundle khoảng 1.02 MB (gzip 300 kB). Chưa tách tải theo trang.
- Chưa ghi Firebase thật, chưa kiểm thử Firebase emulator/rules, Safari/iOS hoặc Excel desktop. Kiểm tra UI dùng component thật và dữ liệu giả.

## Kiểm tra nhanh sau cài
1. Mở Cài đặt → Dữ liệu → Tải bản sao lưu; kiểm tra file có các collection và kho mẫu.
2. Xuất một năm có dữ liệu, so tổng Excel với Thống kê các tháng.
3. Chọn JSON vừa xuất ở chế độ mặc định: nếu dữ liệu chưa đổi, tất cả bản trùng phải được bỏ qua và nút nhập không hoạt động khi có 0 bản ghi cần ghi.
4. Lớp học: chọn tháng cũ, đối chiếu số lớp và buổi; chuyển Tất cả thời gian để tìm lớp tương lai.
5. Ngày nghỉ: thử Dòng thời gian/Thẻ cũ. Lịch phát sinh: thử tìm OCP-tên lớp.

## Danh sách file
- src/components/ExtraList/ExtraList.jsx
- src/components/common/CompactRecord.jsx
- src/components/dashboard/DashboardLayout.jsx
- src/components/layout/PageContent.jsx
- src/hooks/useIncomeData.js
- src/pages/ClassesPage/ClassesPage.jsx
- src/pages/ClassesPage/classesModel.js
- src/pages/ClassesPage/components/ClassFilters.jsx
- src/pages/ClassesPage/components/CourseCard.jsx
- src/pages/ClassesPage/components/CourseProgress.jsx
- src/pages/HolidaysPage/HolidaysPage.jsx
- src/pages/MakeupPage/MakeupPage.jsx
- src/pages/SettingsPage/DataSettings.jsx
- src/pages/SettingsPage/SettingsPage.jsx
- src/services/dataTransfer/backupModel.js
- src/services/dataTransfer/backupService.js
- src/services/dataTransfer/exportReport.js
- src/services/dataTransfer/xlsx.js
- src/utils/courseDisplay.js
- src/utils/extra.js
- tests/dataTransfer.test.js
- tests/restoreTransaction.test.js
