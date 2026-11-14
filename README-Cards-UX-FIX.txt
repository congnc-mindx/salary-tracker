Áp dụng trên bản MindX-Agenda-TimeBadge-Payroll-FIX-CHANGED-ONLY.
Giải nén ghi đè vào thư mục chứa package.json. Không thay cấu hình Firebase hoặc dữ liệu.

- Tổng quan: nhãn Hoàn thành thay Đã qua giờ. Hết ca cuối hôm nay hoặc từ 19h chuyển sang ngày mai (giờ Việt Nam). Ngày không có ca cũng chuyển sang ngày mai. Không đổi trạng thái lưu trong cơ sở dữ liệu.
- TimeBadge dùng chung: hai mốc giờ bằng cỡ chữ, ô tháng giữ một dòng và căn giữa.
- Lịch phát sinh: thẻ ngang, loại lịch ở ô màu bên trái, ngày giờ/nội dung/tiền/trạng thái ở bên phải. Desktop tối đa 3 cột, màn hình hẹp 1 cột.
- Lớp đóng góp: thanh tỷ trọng và phần trăm so với tổng thu nhập kỳ đang xem, gồm phần dự kiến; áp dụng cả popup.
- Native select toàn dự án: mũi tên SVG cách mép, chừa khoảng cho chữ, áp dụng sáng/tối. Không ảnh hưởng listbox hoặc component SelectField dùng SVG riêng.

Kiểm tra: Vite build đạt; 73/73 tests đạt. Đã kiểm tra các component thay đổi bằng dữ liệu mẫu trên desktop và khung 390px, thao tác chọn năm. Không kiểm tra lại toàn bộ luồng Firebase thực tế. Cảnh báo bundle >500kB hiện có.
