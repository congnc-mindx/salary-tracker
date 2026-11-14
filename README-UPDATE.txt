MindX — Settings / Campus / Class Cards update
Áp dụng lên source hiện tại đã cài bản MindX-Cards-Agenda-Dropdown-UX-FIX-CHANGED-ONLY.

- Hai mốc giờ dùng cùng cỡ chữ 12px.
- Nhãn hai dòng: Dạy/bù, Dạy/thay, Giám/khảo, Dạy/TN.
- Thẻ lịch phát sinh có bố cục và hàng giá/trạng thái rõ ràng.
- Thẻ lớp dùng component thời gian chung, tối đa 3 cột trên màn hình lớn.
- Bỏ tab Danh mục; cơ sở chuyển vào Thu nhập, bên trái lịch sử mức lương.
- Đổi tên Mức lương hiện tại; số tiền nằm trong vùng nền xám.
- Sửa tên/mã cơ sở, đồng bộ lớp và lịch phát sinh liên quan trong transaction.
- Nếu lưu thất bại, giữ nguyên nội dung nhập. Chặn trùng tên/mã.

Kiểm tra: build thành công; 74/74 tests pass; kiểm tra giao diện desktop và 390px.
Chưa thử ghi dữ liệu trên Firebase thật. Đổi cơ sở có trên 450 bản ghi liên quan sẽ được chặn với thông báo.

Windows PowerShell: dừng npm run dev bằng Ctrl+C, giải nén ZIP vào thư mục gốc dự án bằng Expand-Archive -Force, sau đó npm run dev.
Không chứa .env, node_modules, dist hoặc dữ liệu cá nhân.
