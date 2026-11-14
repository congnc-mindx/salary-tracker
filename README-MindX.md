# MindX — bản vá UI và prototype thống kê

Bản vá CHANGED-ONLY dùng trên source mới nhất đã áp dụng Reviews-Schedule-UX-FIX. Chỉ thay 3 file trong src; giữ các file khác. Không chứa .env.local hoặc dữ liệu tài khoản.

- Ngày nghỉ: bỏ Thẻ cũ và bộ chọn chế độ; giữ thẻ hiện tại, tối đa 3 thẻ/hàng.
- Nhận xét: bỏ nút chuẩn hóa; Lấy mẫu → Cập nhật → Lưu nháp → Sao chép; màu riêng. Sao chép vẫn lưu nháp.
- Tổng quan/Thống kê: theo brief, là prototype HTML độc lập trong design, chưa ghi đè màn React. Mở HTML bằng trình duyệt, không cần npm hay mạng. Đọc đặc tả Markdown cùng thư mục.

## Windows PowerShell

Dừng Vite bằng Ctrl+C rồi chạy tại D:\salary-tracker:

```powershell
Set-Location "D:\salary-tracker"
$backupName = "MindX-src-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Compress-Archive -Path ".\src" -DestinationPath "$env:USERPROFILE\Downloads\$backupName"
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\MindX-Statistics-Prototype-UI-CHANGED-ONLY.zip" -DestinationPath "." -Force
npm run dev
```

Mở bản duyệt:

```powershell
Start-Process ".\design\MindX-Statistics-Prototype.html"
```

Không thêm dependency. Build và 65 test hiện có đã qua. Vite còn cảnh báo bundle lớn; không liên quan các chỉnh UI này. Prototype đã xem desktop Light/Dark, khung 360 Light và 390 Dark; mở modal/Escape, loading/empty/error và thử lại. Đây chưa phải kiểm thử Firebase hay thiết bị di động thật.
