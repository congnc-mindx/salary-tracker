# MindX — Thống kê tháng / năm
Ngày 14/11/2026. Bản vá source React, không phải prototype.

## Thay đổi
- Theo tháng → Theo năm → Đối soát.
- Theo năm lấy tháng 1–12 của năm trên header. Chọn năm qua bộ chọn thời gian hiện có; chọn cột chuyển sang Theo tháng tương ứng.
- Nguồn thu dạng thanh ngang có phần đặc/gạch chéo và khối tiến độ bên phải.
- Hàng kế tiếp: cơ sở trái, lớp phải. Hiện tối đa 4 mục, không cuộn trong thẻ. Trên 4 mục: chọn phần danh sách hoặc dòng Xem tất cả để mở popup đầy đủ; chọn từng mục trong popup để xem buổi.
- Bỏ khối Chi tiết đóng góp khỏi giao diện. File component cũ có thể còn trên đĩa nhưng không được import/render.
- Lớp tổng hợp cả lớp chính và lịch phát sinh có cùng mã lớp/cơ sở. Lịch không có mã lớp vẫn thuộc tổng và nguồn thu/cơ sở, không tự gán cho lớp.

## Cài đặt
Áp dụng trên source mới nhất của chuỗi bản vá MindX. Dừng Vite bằng Ctrl+C. Không thay .env.local, package.json hoặc Firebase.
```powershell
Set-Location "D:\salary-tracker"
Compress-Archive -Path ".\src" -DestinationPath "$env:USERPROFILE\Downloads\MindX-src-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\MindX-Statistics-Month-Year-CHANGED-ONLY.zip" -DestinationPath "." -Force
npm run dev
```

## Kiểm tra
- Build thành công; 67 test qua, gồm tổng 12 tháng khớp tổng năm và nhóm đóng góp không nhân đôi dữ liệu.
- Kiểm tra component React với dữ liệu mẫu: chuyển năm/tháng, chọn cột, popup 5 cơ sở/6 lớp, chi tiết buổi và Escape; khung mobile 360 không tràn ngang toàn trang. Biểu đồ 12 tháng chỉ cuộn trong khung riêng trên màn nhỏ.
- Không kiểm tra bằng tài khoản Firebase thật. Không đổi đơn giá, trạng thái lịch, header/sidebar, đối soát, nhận xét hay cơ chế đồng bộ.
- Giữ nhãn Đã ghi nhận để đúng trạng thái nguồn; không đồng nghĩa đã nhận tiền.
- Vite vẫn có cảnh báo bundle lớn; build hoàn tất.
