# MindX — Đối soát bảng lương

Gói cập nhật tiếp nối MindX-Settings-Monthly-Classes-UX-CHANGED-ONLY.zip. Chỉ chứa các file mới/thay đổi; không phải source đầy đủ. Không thay header/sidebar hoặc giao diện lớp học đã chốt.

## Cài đặt

Trong Terminal tại thư mục dự án (nơi có package.json):

```bash
unzip -o ~/Downloads/MindX-Payroll-Reconciliation-CHANGED-ONLY.zip -d .
npm run build
npm run dev
```

Không cần thêm thư viện. Nếu source hiện tại đã được sửa riêng sau bản nền trên, đối chiếu các file trùng trước khi ghi đè.

## Dùng hàng tháng

1. Mở Thống kê → Đối soát bảng lương.
2. Copy bảng từ trung tâm gồm hàng tiêu đề; dán nguyên văn. Hỗ trợ các ô phân cách bằng tab, ghi chú nhiều dòng, ngày GMT+0700 như mẫu đã gửi.
3. Chọn tháng công, giáo viên và các cơ sở. Chỉ bật “Tôi đã copy đủ cả tháng” khi dữ liệu thực sự đầy đủ cho các cơ sở đã chọn. Nếu chỉ dán một phần, ứng dụng không kết luận thiếu buổi hoặc so tổng toàn tháng.
4. Kiểm tra tên cơ sở/lớp tương ứng. C4K và ROB được bỏ khi so mã lớp; VHRS, LB và hậu tố HB cần người dùng xác định, không tự suy đoán.
5. Ưu tiên nhóm “Cần kiểm tra”. Mở từng dòng để so hai phía, ghép buổi thủ công, ghi chú “Cần hỏi” hoặc đánh dấu đã xử lý. Đánh dấu xử lý cần ghi chú.
6. Sao chép danh sách cần hỏi trung tâm. Thao tác này chỉ copy văn bản, không tự gửi.
7. Lưu lần đối soát để mở lại. Khi lịch trên web thay đổi, dùng “Đối chiếu lại dữ liệu web”. Đánh dấu cũ chỉ còn hiệu lực nếu dữ liệu so sánh không thay đổi.

## Logic và giới hạn

- Tách dạy chính / dạy thay / dạy bù; loại chưa biết cần tự phân loại. Dòng trùng không tự ghép.
- Ghép tự động theo cơ sở, lớp, ngày, giờ và loại công việc, theo quan hệ một-một. Lệch giờ chỉ gợi ý để người dùng xác nhận.
- Kiểm tra số giờ, tiền, đơn giá, sĩ số ở lịch phát sinh có dữ liệu và trạng thái. CHECKED không đồng nghĩa đã nhận tiền.
- Dạy bù đối chiếu theo quy tắc lương sẵn có của ứng dụng. Dòng STT 10993 trong mẫu: bảng trung tâm 320.000đ; nếu web áp dụng 120.000đ/giờ × 2 giờ thì hiển thị chênh +80.000đ để kiểm tra, không kết luận bên nào sai.
- Không tự thêm lịch hay sửa lương từ bảng dán. Nút mở form thêm/sửa dùng form hiện tại, người dùng kiểm tra và lưu riêng.
- Lưu bản chụp dữ liệu đối chiếu, ghi chú và quy tắc mã vào settings của tài khoản Firebase hiện tại. Có kiểm tra phiên bản để tránh ghi đè bản đã đổi ở tab khác.
- Hiển thị 30 lần lưu gần nhất; không tự xóa lịch sử cũ. JSON sao lưu/khôi phục ở Cài đặt bao gồm lịch sử và quy tắc đối soát.
- Bản đang chỉnh được giữ tạm trong sessionStorage theo tài khoản, cùng tab. Cần bấm lưu để giữ lâu dài và dùng ở thiết bị khác.
- Giới hạn mỗi lần dán: 1.500 dòng, 3 MB văn bản; giới hạn bản lưu 750 KB. Có báo lỗi và giữ kết quả đang xem nếu không lưu được.
- Chưa hỗ trợ tải trực tiếp file XLSX hoặc xuất Excel riêng cho đối soát trong bản này; đầu vào là bảng copy/paste, đầu ra trao đổi là văn bản và lịch sử/JSON.

## Kiểm tra đã thực hiện

- 62 kiểm thử Node đều đạt, gồm đọc 50 dòng / 97 giờ / 15.400.000đ, chênh 80.000đ, dòng trùng, ghép thủ công, phạm vi một phần, giữ đánh dấu sau đổi thứ tự, JSON backup.
- Kiểm tra trình duyệt ở 375/768/1440 px: xem trước, đối chiếu, copy, ghi chú, lưu/mở lịch sử, dán lại bản sửa và lỗi lưu, không tràn ngang.
- Build production đạt. Có cảnh báo dung lượng bundle lớn và các cảnh báo lint hiện có; luồng giữ bản tạm có cảnh báo set-state-in-effect khi thông báo lỗi lưu trình duyệt.
- Kiểm thử giao diện dùng bộ lưu Firebase giả lập. Chưa xác minh quyền Firestore với tài khoản thật; rules hiện tại cần cho chủ tài khoản đọc/ghi users/{uid}/settings. Không thay rules hay ghi dữ liệu thật trong quá trình kiểm thử.

## Các module

- SalaryPage: tab Thống kê / Đối soát, giữ phần thống kê trong StatisticsOverview.
- reconciliation/parser: đọc bảng, tiền, ngày và báo lỗi dòng.
- reconciliation/model: chuẩn hóa, ghép, kiểm tra chênh lệch, quyết định và nội dung hỏi.
- reconciliation/expected: chuyển dữ liệu hiện tại thành các buổi dùng đối chiếu.
- reconciliation/storage + validation: lưu lịch sử, quy tắc và kiểm tra dữ liệu.
- ImportPreview / Results / RowDetails / ReconciliationPage: giao diện theo từng bước.
- PageContent / useIncomeApp: nối dữ liệu tài khoản và form lịch hiện có.
- backupModel / DataSettings: đưa lịch sử vào sao lưu JSON.

Chạy bộ kiểm thử trong dự án: `node --test tests/*.test.js`.
