# Mẫu nội dung và danh mục — 14/11/2026

Áp dụng trên source mới nhất, sau bản Statistics-Month-Year.

- Nhận xét → Mẫu nội dung: chọn Bộ môn → Học phần rồi mới hiện mẫu. Bộ lọc luôn ở trên, có hai lựa chọn Từng buổi / Cuối khóa. Đổi bộ môn bỏ chọn học phần cũ.
- Hậu tố B/A/I hiển thị Basic/Advanced/Intensive, gồm SB/SA/SI, GB/GA/GI, PTB/PTA/PTI, JSB/JSA/JSI, CSB/CSA/CSI, PREB/PREA/PREI. Không đổi ID, không di chuyển hoặc ghi đè tài liệu mẫu.
- ARM cũ không có hậu tố nên giữ nhãn hiện có; không tự tạo hay đổi liên kết dữ liệu.
- Sửa bộ môn ở Nhận xét. Tên học phần tự nhận từ mã chuẩn, không phải nhập lại.
- Cài đặt: bỏ khối Bộ môn và mẫu nhận xét. Giữ danh mục cơ sở. Sửa lỗi App truyền actions gốc vào PageContent, khiến openCampus không tồn tại; nay truyền bộ actions đã bổ sung đúng như header.
- Không thay đổi logic nhận xét cá nhân, lưu nháp, lương, thống kê hay Firebase.

## Windows PowerShell
Dừng Vite bằng Ctrl+C, sau đó:
```powershell
Set-Location "D:\salary-tracker"
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\MindX-Review-Template-Filters-FIX-CHANGED-ONLY.zip" -DestinationPath "." -Force
npm run dev
```
Không thêm thư viện; không cần npm install.

## Kiểm tra
Build thành công; 68 test qua. Có kiểm tra ánh xạ tên học phần và giữ mã cũ. Chưa kiểm thử giao diện bằng trình duyệt hoặc lưu vào tài khoản Firebase thật trong lượt này. Vite vẫn có cảnh báo bundle lớn nhưng build hoàn tất.
