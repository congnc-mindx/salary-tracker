# MindX — đặc tả Tổng quan / Thống kê

Bản duyệt 13/11/2026. Prototype dùng **Dữ liệu mẫu**, đồng hồ cố định 14/11/2026 lúc 12:00, GMT+7. Không kết nối Firebase. Không nhập hoặc sửa dữ liệu thật.

## 1. Phân tích trước khi vẽ

| Câu hỏi | Căn cứ quan sát | Vấn đề | Thay đổi tối thiểu | Phạm vi |
|---|---|---|---|---|
| Hôm nay dạy gì? | Ảnh Tổng quan đặt bốn thẻ tiền lớn đầu trang | Lịch cần hành động chưa là điểm đọc đầu | Đưa danh sách ca theo giờ lên đầu Tổng quan | Chỉnh |
| Tháng này dạy bao nhiêu? | Source có dữ liệu buổi, thời lượng và trạng thái | Tiền nổi bật hơn khối lượng công việc | Một khối buổi/giờ, phần đã dạy và còn lại | Chỉnh |
| Đã tạo ra bao nhiêu thu nhập? | Ảnh có dự kiến, đã thực hiện, còn dự kiến | Quan hệ giữa ba khoản chưa hiển thị rõ | Tổng cả tháng kèm hai thành phần và phương trình | Thay thế cách trình bày |
| Nguồn thu nào lớn nhất? | StatisticsOverview có thành phần nguồn thu/cơ sở | Cần so giá trị và mở các buổi tạo thành số tiền | Thanh ngang giảm dần, số tiền đầy đủ, chạm mở chi tiết | Chỉnh |
| Mốc 5/9/14 ở đâu? | Yêu cầu nghiệp vụ và source có mốc buổi | Phải tìm từng lớp | Khối mốc sắp tới, ngày giờ và lớp | Bổ sung hiển thị |
| Nghỉ ảnh hưởng thế nào? | TopCards gộp giá trị nghỉ/lùi; StatisticsOverview đã phân biệt | Có thể hiểu buổi lùi là mất tiền | Phân biệt dời tháng và người khác dạy thay | Chỉnh |
| Thay đổi so tháng trước? | Source có chuỗi tháng | Tháng đang dở không thể so tổng cả tháng trước | Cùng ngày/giờ cho tháng hiện tại, cả kỳ cho tháng đã kết thúc | Chỉnh |
| Tìm lớp nhanh? | Ảnh có bộ lọc và thẻ đã chốt | Thứ tự thông tin cần dễ đọc, không cần đổi cấu trúc | Tên → buổi/ngày/giờ → tiến độ → số buổi tháng | Giữ cấu trúc |

Xác minh từ source: Light dùng maroon `#800000`, Dark dùng xanh `#2563eb`; có loại Giám khảo; dạy bù dùng tỷ lệ `0.375` của giá buổi 2 giờ, tương đương 75% giá/giờ, không nhân thêm số học sinh. Các điểm này được giữ. Ảnh không cung cấp dữ liệu xác nhận thanh toán nên không suy ra “đã nhận lương”.

Điểm chưa xác minh bằng tài khoản thật: dữ liệu Firebase, lịch sử thanh toán, toàn bộ cấu hình giá cá nhân, luồng đồng bộ thực tế. Không thay đổi các phần này.

## 2. Wireframe và tương tác

| Trang / thứ tự | Hiển thị ngay | Sau một chạm | Desktop → mobile |
|---|---|---|---|
| Tổng quan 1 — Lịch | Hôm nay: giờ bắt đầu/kết thúc, lớp, số buổi, trạng thái; ca tiếp theo | Chi tiết buổi; danh sách đầy đủ nếu nhiều hơn 3 ca | Cột rộng bên trái → toàn chiều ngang |
| Tổng quan 2 — Tiến độ | Buổi đã dạy/tổng, giờ đã dạy/còn lại | Dùng danh sách lịch để kiểm chứng | Cạnh lịch → dưới lịch |
| Tổng quan 3 — Thu nhập | Tổng lớn; đã dạy và còn lại nhỏ hơn; ghi rõ tổng bao gồm đã dạy | Chi tiết qua nguồn thu ở Thống kê | Ba cột → tổng trên, hai thành phần dưới |
| Tổng quan 4 — Mốc / Ngày nghỉ | Tên lớp, mốc, thời điểm; dời buổi hoặc không tính công | Buổi liên quan và giải thích ảnh hưởng | Hai cột → một cột |
| Thống kê 1 — Thu nhập / cùng kỳ | Cùng định nghĩa với Tổng quan; chênh tiền, buổi, giờ | Các nhóm chi tiết bên dưới | Cùng kỳ ba cột → ba dòng |
| Thống kê 2 — Nguồn thu / tiến độ | Thanh xếp giảm dần; giá trị, tỷ trọng, buổi và giờ | Danh sách đúng nguồn thu | Hai cột → một cột |
| Thống kê 3 — Cột tháng | Tiền đầy đủ khi focus/hover; đã dạy đặc, dự kiến gạch chéo | Danh sách tất cả buổi của tháng | Cột vẫn đọc được trong khung 360px |
| Thống kê 4 — Lớp / Ngày nghỉ | Các lớp xếp theo tổng thu; nghỉ có ngữ cảnh | Danh sách buổi từng lớp | Hai cột → một cột |
| Lớp học | Bộ lọc, tên lớp, lịch, tiến độ, mốc | Danh sách buổi | 3 cột nếu đủ rộng, 2 ở mức trung gian, 1 trên mobile |

Header vẫn là nơi duy nhất chọn tháng. Không thêm tab phân tích. Tab đối soát hiện có vẫn giữ. Các trang ngoài phạm vi trả thông báo rõ trong prototype, không thực hiện thao tác giả. Thanh công cụ trên cùng chỉ để duyệt, không đưa vào ứng dụng thật. Mobile prototype giữ đủ 7 mục qua thanh điều hướng cuộn ngang; khi tích hợp phải dùng nguyên component điều hướng hiện có.

### Lý do chọn biểu đồ

| Thành phần | Câu hỏi | Lý do dùng / không dùng loại khác | Thành phần nâng cấp |
|---|---|---|---|
| Cột tháng | Tháng nào tạo ra bao nhiêu tiền? | Chiều cao so giá trị trực tiếp; không dùng đường vì ít mốc và có dự kiến | TrendChart |
| Thanh ngang nguồn thu | Nguồn nào đóng góp lớn? | Xếp giảm dần, tên dài dễ đọc; không dùng donut khi một nguồn gần 100% | Composition |
| Thanh tiến độ | Đã dạy đến đâu? | Một đại lượng trên tổng; không cần biểu đồ tròn hay KPI lặp | Tiến độ tháng/thẻ lớp |
| Danh sách lịch và lớp | Khi nào, lớp nào, tiền từ buổi nào? | Đọc chi tiết và hành động trực tiếp; heatmap không trả lời được số buổi/lớp | Nội dung Tổng quan/chi tiết |

## 3. Hợp đồng dữ liệu cho React

Các tên sau là DTO đề xuất để hiển thị, **không phải schema Firebase mới**. Adapter phải đọc model tính lịch hiện tại.

`TeachingOccurrence`: `id` ổn định; `source` (class/extra); `sourceId`; `classId` nếu có; `campusId`; `classLabel`; `type`; `sessionNo` nếu lịch lớp; `startAt`, `endAt` (instant); `durationHours` số thực giờ; `amountVnd` đồng; `status`; `replacementOf` nếu model có liên kết thay thế. Tên/địa điểm là chuỗi; số buổi/học sinh là số nguyên. Không suy diễn liên kết từ tên gần giống.

`ClassSummary`: id, label, campusId, totalSessions, completedSessions, nextOccurrence, monthlyOccurrences. `LeaveImpact`: leaveId, khoảng ngày, affectedOccurrenceIds, effect (postponed/covered), originalStartAt, effectiveStartAt. `MonthlySummary`: period, loaded, error, rows, totalCount, totalHours, earnedAmount, remainingAmount, totalAmount.

### Công thức và thời gian

- Lấy tập occurrence từ lịch **đã áp dụng** ngày nghỉ/dời buổi/bổ sung. Giữ loại bỏ “Đã huỷ”, nghỉ, người khác dạy thay theo model hiện có; không xoá record.
- Tháng công dựa trên ngày bắt đầu thực tế tại Asia/Ho_Chi_Minh: đầu tháng bao gồm, đầu tháng sau không bao gồm. Buổi qua nửa đêm vẫn theo quy tắc nguồn hiện tại; cần khóa quy tắc này bằng kiểm thử khi tích hợp.
- Tổng giờ = tổng durationHours hợp lệ; tổng buổi = số occurrence hưởng công (kể cả tiền 0); không làm tròn giờ trước khi cộng.
- Thu nhập = dùng amount đã tính từ model nguồn, không tính lại bằng số học sinh. Tổng = đã dạy + còn lại, mỗi occurrence thuộc đúng một phần.
- Trạng thái phải dùng cùng selector như lịch/TopCards hiện tại, bao gồm xác nhận thủ công và quy tắc hoàn thành sau giờ kết thúc. Không tự ghi “hoàn thành” hàng loạt vào Firebase.
- Prototype minh họa hoàn thành theo giờ kết thúc cố định 14/11/2026 12:00. Không coi đây là thay đổi nghiệp vụ trạng thái của app.
- Dạy bù mẫu: 160.000 đ/giờ × 75% × số giờ. 1 giờ = 120.000 đ; 2 giờ = 240.000 đ. Số học sinh không nhân vào công thức.
- Các loại khác dùng giá đã cấu hình; không cố định 160.000 khi tích hợp. Giữ Giám khảo nếu dữ liệu có. Trải nghiệm bằng 0 không cần chiếm một thẻ riêng.
- Buổi dời sang tháng sau thuộc tháng sau; chỉ mô tả ảnh hưởng, không trừ thêm một lần khỏi tổng đã lọc. Người khác dạy thay không tạo thu nhập cá nhân.
- So cùng kỳ tháng hiện tại: lấy thời điểm hiện tại theo GMT+7; kỳ trước giới hạn cùng ngày/giờ, clamp ngày theo số ngày trong tháng. Tháng kết thúc so cả kỳ. Tháng tương lai không kết luận tăng/giảm thực hiện.
- Kỳ trước = 0: hiện chênh lệch tuyệt đối, không hiện tỷ lệ vô hạn. Chưa tải được kỳ trước: “Chưa đủ dữ liệu so sánh”, không biến thành 0. Prototype trường hợp chưa có dữ liệu chỉ minh họa bằng nhãn gộp, React phải phân biệt loaded/empty.
- Tỷ trọng nguồn = tổng nguồn/tổng tháng; mẫu số 0 → không hiển thị tỷ trọng. Trục có thể dùng triệu, tooltip/chi tiết luôn đồng đầy đủ.

### Không tính trùng

Một tập occurrence chuẩn duy nhất cấp cho lịch, tổng, biểu đồ và modal. Khóa lịch lớp dùng classId + identity buổi ổn định; lịch phát sinh dùng extraId. Buổi thay thế cần liên kết source có thật, không loại trùng chỉ vì cùng tên/ngày/giờ. Nếu quan hệ không rõ, báo dữ liệu cần kiểm tra thay vì tự gộp. Các nhóm nguồn thu, lớp và tháng chỉ là các phép group của cùng tập; không cộng tổng nhóm vào tổng lịch lần nữa. Khi record đổi, tái tính tập và tất cả nhóm từ cùng snapshot.

### Thành phần tái sử dụng khi chuyển sang React

`ScheduleAgenda` nhận occurrences; `MonthProgress` nhận summary; `IncomeSummary` nhận earned/remaining/total; `PeriodComparison` nhận hai summary cùng phạm vi; `IncomeSourceBars` nhận groups và callback mở chi tiết; `MonthlyIncomeColumns` nhận periods; `ClassContributionList` nhận groups; `LeaveImpactSummary` nhận impact; `OccurrenceDetail` dùng modal chung. Mỗi khối có loading/empty/error riêng nếu nguồn tải độc lập. Dùng selector/model hiện tại, không để component tự tính lương.

## 4. Giao diện, trạng thái và tiếp cận

- Font hệ thống trong HTML offline; khi tích hợp giữ font của app. Tiêu đề trang 28–32px/700; tiêu đề khối 18–20px/700; tiền chính 28–32px/700; nội dung 14–16px; phụ 12–14px. Số tiền dùng tabular-nums.
- Lề desktop 28px, mobile 14px; khoảng khối 16–20px; padding khối 20–22px, mobile 16px; bo góc khoảng 20px; viền 1px. Vùng chạm tối thiểu 44px.
- Dark: nền #020617, panel #0f172a, chữ #f8fafc, phụ #94a3b8, viền #334155, primary #2563eb. Light: nền #f5f8fc, panel trắng, chữ #0f172a, phụ #475569, viền #cbd5e1, primary #800000. Không đổi thương hiệu sang xanh lá.
- Màu nguồn thu giữ nhất quán; luôn có tên nguồn. Đã dạy đặc, dự kiến có gạch chéo và chú giải; không mã hoá trạng thái chỉ bằng màu.
- Hover tăng nền/viền, focus-visible có outline 3px và offset; active nav có nền primary và aria-current. Không dựa vào hover để truy cập thông tin.
- Cột tháng có tooltip hover/focus, chạm mở modal cùng dữ liệu. Giá trị tổng vẫn hiện khi không hover. Modal native dialog: giữ focus, Escape, nút đóng, nhấn nền ngoài; nhấn nội dung không đóng.
- Loading: skeleton/aria-busy, không giả số 0. Empty: thông báo không có lịch và hướng dẫn dùng header. Error: thông báo và Thử lại; không kết luận tháng không có thu nhập.
- Thẻ lớp: giữ ưu tiên/sort/filter của model hiện tại. Prototype thể hiện ẩn lớp hoàn thành theo brief; source hiện tại có lịch sử theo tháng bao gồm lớp hoàn thành. **Bản vá này không thay đổi quy tắc đó**; khi chuyển React cần phân biệt lịch sử tháng với bộ lọc trạng thái, tránh làm mất số lớp của tháng quá khứ.

## 5. Trường hợp biên và cách duyệt

Thanh “Công cụ duyệt” có Desktop/390/360, Light/Dark và kịch bản. Thử Tổng quan, Thống kê, Lớp học từ điều hướng.

| Trường hợp | Kết quả mong muốn |
|---|---|
| Không có lịch | Empty rõ ràng, không chia 0 |
| Nhiều ca trong ngày | Xếp theo giờ; hiện 3 ca và mở đủ danh sách |
| Tên lớp dài | Xuống dòng; không đẩy tiền/giờ ra ngoài khung |
| Một nguồn gần 100% | Thanh ngang vẫn đọc được; nguồn nhỏ vẫn có số tiền |
| Chỉ buổi bổ sung | Tổng/giờ đúng; thẻ lớp chính có thể trống |
| Nghỉ cả tháng / qua tháng | Không trừ kép; phân biệt buổi dời tháng |
| Vừa hoàn thành | Bộ lọc Đã hoàn thành truy cập được; kiểm tra tháng 10 mẫu |
| Dưới 3 tháng | Chỉ có cột đã có; không kết luận xu hướng |
| Kỳ trước = 0 | Chênh tuyệt đối, không Infinity/NaN |
| Tháng hiện tại | So cùng mốc ngày/giờ |
| Chỉnh lịch | React phải cập nhật tổng, nhóm và modal từ cùng snapshot; prototype chỉ mô phỏng qua kịch bản |
| Tải / lỗi | Có trạng thái riêng, nút thử lại hoạt động |

Mẫu mặc định tháng 11: 20 buổi, 39 giờ, 6.120.000 đ; đã dạy 8 buổi, 15 giờ, 2.360.000 đ; còn lại 12 buổi, 24 giờ, 3.760.000 đ. Đây không phải số liệu tài khoản. Tháng 10 có 16 buổi, 31 giờ, 4.840.000 đ. Dữ liệu mẫu không phục dựng toàn bộ lịch học thật của từng lớp qua nhiều tháng.

## 6. Bản vá chạy trong ứng dụng

Chỉ 3 file source thay đổi:
- `src/pages/HolidaysPage/HolidaysPage.jsx`: bỏ bộ chọn Dòng thời gian / Thẻ cũ; giữ kiểu thẻ hiện tại, grid 1/2/3 cột; giữ lọc tháng và thao tác chi tiết.
- `src/pages/ReviewsPage/components/SessionReviewEditor.jsx`: bỏ nút chuẩn hóa; thứ tự Lấy mẫu → Cập nhật → Lưu nháp → Sao chép. Sao chép vẫn gọi quy trình sao chép và lưu nháp hiện có. Cập nhật chỉ lưu mẫu chung, không đưa nhận xét cá nhân vào mẫu.
- `src/components/common/Button.jsx`: thêm biến thể màu riêng cho các thao tác nhận xét; không đổi style nút cũ trên các trang khác.

Lấy mẫu xanh trời, Cập nhật tím, Lưu nháp xanh ngọc, Sao chép màu chủ đạo. Bản mẫu nội dung vẫn dùng Lưu mẫu đúng ngữ cảnh.

## 7. Checklist toàn vẹn

- [x] Prototype offline, một HTML, không CDN/Firebase.
- [x] Source không đổi header, sidebar, đăng nhập, lớp học, thống kê hiện tại, cài đặt, bảng lương.
- [x] Không đổi công thức tiền công, không ghi/xóa dữ liệu hoặc thay cơ chế đồng bộ zWhisFlow.
- [x] Tổng mẫu đối chiếu được với buổi/giờ; tách phần đã dạy/dự kiến.
- [x] Không gọi thu nhập đã tạo ra là lương đã nhận.
- [x] Giờ là số giờ; tiền là đồng; không nhân số học sinh.
- [x] Build ứng dụng thành công, 65 kiểm thử hiện có thành công.
- [ ] Khi tích hợp React: kiểm tra dữ liệu Firebase thật, đơn giá tùy chỉnh, mapping buổi thay thế, lịch qua tháng và quy tắc lớp hoàn thành.
- [ ] Khi tích hợp React: audit WCAG AA với font/component thật; kiểm tra keyboard, screen reader và thiết bị thật. Prototype không thay cho kiểm thử tích hợp.
