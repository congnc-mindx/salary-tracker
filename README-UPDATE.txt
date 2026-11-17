MindX — Compact cards and payroll campus mapping
Áp dụng sau bản MindX-Settings-Campus-Class-Cards-CHANGED-ONLY.

1. Giảm padding thẻ lịch phát sinh; ghi chú cùng dòng giờ/số học sinh, tự xuống dòng khi màn hình hẹp.
2. Ô bên trái thẻ lớp hiển thị mã cơ sở và mã lớp thay cho giờ.
3. Cài đặt > Thu nhập > Cơ sở giảng dạy > Sửa: tên đầy đủ, mã viết tắt, mã bảng lương (nhiều mã cách nhau bằng dấu phẩy).
Mặc định: 505MK -> Minh Khai -> MK; 98NVC -> Nguyễn Văn Cừ -> NVC; HN-VHRS -> Long Biên -> VHRS; Oceanpark1 -> Oceanpark -> OCP.
4. Đối soát mới tự dùng thiết lập này; phần ghép cơ sở/lớp thu gọn, có thể mở để điều chỉnh. C4K/ROB được bỏ; hậu tố HB giữ nguyên.
5. Mã hiển thị LB cũ của Long Biên chuyển sang VHRS. Không sửa các bản đối soát lịch sử đã lưu; hãy nhập bảng mới để dùng cấu hình mới.

Kiểm tra: build thành công, 75 tests đạt; đã kiểm tra thẻ trên desktop và màn hình nhỏ bằng dữ liệu mẫu.
Chưa thử ghi cấu hình trên Firebase thật của người dùng.

Cài: dừng server, giải nén ZIP vào thư mục gốc source hiện tại rồi chạy npm run dev.
Không chứa .env, node_modules, dist hoặc file QA.
