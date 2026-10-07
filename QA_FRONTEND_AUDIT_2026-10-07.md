# Báo cáo QA & Frontend Audit — PaceCar

- Website kiểm thử: [https://pacecarf.onrender.com/](https://pacecarf.onrender.com/)
- Thời gian: 07/10/2026, khoảng 12:36–12:43 (Asia/Bangkok)
- Trình duyệt: Google Chrome headless qua Playwright, locale `vi-VN`, timezone `Asia/Bangkok`
- Viewport: `1920×1000`, `1440×1000`, `1024×1000`, `768×1000`, `430×932`
- Bundle được phục vụ: `index-DevHAPqa.js`
- Nguyên tắc: chỉ đọc và thao tác có thể hoàn tác; không tạo booking, thanh toán, upload, cập nhật hồ sơ, tạo tài khoản, duyệt/từ chối, tạm dừng, lưu trữ hoặc xóa dữ liệu.

## 1. Tóm tắt kết quả

Website hoạt động tốt ở phần lớn hành trình khám phá: trang chủ, menu, tìm kiếm hợp lệ, sắp xếp, lọc/reset, empty state, chi tiết xe, báo giá, đăng nhập ba vai trò, dashboard, danh sách booking, hợp đồng, biên bản giao nhận, hồ sơ, yêu thích, quản lý xe, duyệt tin và quản lý ưu đãi đều tải được. Phân quyền dashboard chuyển người dùng về đúng vai trò. Đăng xuất xóa token phía trình duyệt và token cũ bị server từ chối `401`.

Kết quả ghi nhận **0 Critical, 2 High, 4 Medium và 3 Low**. Hai lỗi cần xử lý trước là:

1. Trang **Cảnh báo rủi ro** của owner/admin làm toàn bộ React tree rơi vào Error Boundary với lỗi `date is not defined`.
2. Form tìm xe tại viewport 430 px rộng 492 px, làm trường giờ trả và nội dung bên phải bị cắt/tràn ngang.

Một vấn đề niềm tin đáng chú ý: danh sách tìm kiếm vẫn hiển thị điểm sao cho xe không có đánh giá trên PaceCar, trong khi trang chi tiết của chính xe đó nói “Chưa có đánh giá”.

## 2. Chức năng đã kiểm tra

| Nhóm | Chức năng/thao tác thực tế | Trạng thái | Ghi chú |
|---|---|---:|---|
| Hạ tầng | `/`, `/api/health`, `/api/cars` | Pass | Đều trả `200`; health trả `{"ok":true}`. |
| Trang chủ | Hero, CTA, anchor “Vì sao”, “Cách hoạt động”, ưu đãi, địa điểm, xe nổi bật, footer | Pass | Các internal link đã được mở trực tiếp. |
| Điều hướng | Desktop nav, mobile menu mở/đóng, trang 404 | Pass | Mobile menu có `aria-expanded=true` và đủ 4 link public. |
| Tìm kiếm | Ngày/giờ/điểm đến hợp lệ | Pass | Điều hướng sang `/cars`, giữ đủ tiêu chí trên URL, trả 10 xe. |
| Validation tìm kiếm | Giờ trả trước giờ nhận | Pass | Giữ nguyên trang và báo đúng “Thời gian trả xe phải sau thời gian nhận xe”. |
| URL ngày quá khứ | Mở trực tiếp URL tìm xe có ngày năm 2020 | Fail | Backend từ chối đúng, nhưng UI biến thành lỗi tải dữ liệu với nút retry không thể sửa input. |
| Danh sách xe | Load, sort giá tăng, lọc SUV, reset | Pass | SUV: 10→4 xe; reset: 4→10 xe. |
| Empty state | Khu vực không có kết quả | Pass | Có tiêu đề và hướng dẫn mở rộng tiêu chí. |
| Chi tiết xe | Gallery, thông số, owner/trust, quy định, báo giá, CTA | Pass | Báo giá 3 ngày và breakdown hiển thị nhất quán. |
| Review | Đối chiếu danh sách và chi tiết cùng xe | Fail | Điểm sao mâu thuẫn với số review thực tế. |
| Đăng nhập | Sai mật khẩu | Pass | Ở lại `/login`, hiển thị “Email hoặc mật khẩu không đúng”. |
| Đăng nhập | Renter, owner, admin bằng tài khoản demo | Pass | Cả ba điều hướng đúng dashboard. |
| Đăng xuất | UI logout và kiểm tra lại token cũ | Pass | Về `/`, local token bị xóa, token cũ gọi API nhận `401`. |
| Route guard | Guest vào `/profile`; renter/owner/admin mở dashboard sai vai trò | Pass | Guest về login kèm `next`; user về dashboard đúng role. |
| Renter | Dashboard, bookings, favorites, profile | Pass | Chỉ đọc, không hủy/đánh giá/lưu. |
| Renter | Notification center | Pass | Mở được, nội dung booking hiển thị; không bấm “Đánh dấu đã đọc”. |
| Booking | Trang xác nhận quote | Pass | Thời gian, chính sách, tổng phí và cọc rõ; không gửi booking. |
| Hợp đồng | Mở hợp đồng booking hiện có | Pass | Draft và thông tin hai bên/xe/giá hiển thị. |
| Giao nhận | Mở evidence booking hiện có | Pass | Empty state và form hiện đúng; không upload/lưu. |
| Tranh chấp | Điều hướng từ danh sách booking renter | Blocked | Dữ liệu hiện tại không có nút “Hỗ trợ” trong `/bookings`; không mở trực tiếp ID chưa được UI cung cấp. |
| Owner | Dashboard, bookings, danh sách xe, trang đăng xe | Pass/Fail | Trang tải; wizard validation bị lỗi được mô tả bên dưới. |
| Owner/Admin | Cảnh báo rủi ro | Fail | Crash ứng dụng có thể tái hiện ở cả hai vai trò. |
| Admin | Dashboard, duyệt tin, quản lý ưu đãi | Pass | Modal “Tạo ưu đãi” mở được; không lưu hay thay đổi dữ liệu. |
| Thanh toán | Thanh toán cọc demo | Not tested | Có thể thay đổi booking; bị loại khỏi phạm vi an toàn. |
| Mutation booking | Tạo/hủy/chấp nhận/từ chối/đổi trạng thái/ký | Not tested | Có thay đổi dữ liệu server. |
| Upload | Ảnh xe, giấy tờ, evidence | Not tested | Có tạo file/dữ liệu server. |
| Hồ sơ | Lưu chỉnh sửa | Not tested | Có thay đổi dữ liệu người dùng. |
| Tài khoản mới | Đăng ký/quên mật khẩu | Not tested | Không có chức năng public tương ứng trên UI production. |

## 3. Lỗi thực tế

### Critical

Không ghi nhận lỗi Critical trong phạm vi an toàn đã kiểm thử.

### High

#### H-01 — Trang Cảnh báo rủi ro làm ứng dụng crash

- Vai trò: owner và admin
- Trang: `/risk-alerts`
- Bước tái hiện:
  1. Đăng nhập `owner@pacecar.vn` hoặc `admin@pacecar.vn`.
  2. Mở “Cảnh báo rủi ro” từ sidebar hoặc truy cập `/risk-alerts`.
- Mong đợi: danh sách cảnh báo, trạng thái và ngày tạo được hiển thị.
- Thực tế: toàn trang chuyển sang Error Boundary với nội dung `Ứng dụng gặp sự cố — date is not defined`.
- Console: `ReferenceError: date is not defined`.
- Ảnh: [risk-alerts-crash-owner.png](qa-evidence/risk-alerts-crash-owner.png)
- Tác động: owner/admin mất hoàn toàn chức năng quản trị rủi ro; đây là một chức năng cốt lõi của định vị sản phẩm.

#### H-02 — Form tìm xe tràn ngang ở mobile 430 px

- Trang: `/` và `/cars`
- Viewport: `430×932`
- Bước tái hiện:
  1. Mở trang chủ hoặc danh sách xe ở độ rộng 430 px.
  2. Quan sát nhóm “Nhận xe/Trả xe”, đặc biệt trường giờ trả.
- Mong đợi: form nằm trọn trong viewport, không có horizontal scroll và mọi control đọc/bấm được.
- Thực tế: `document.scrollWidth = 492`, lớn hơn viewport 62 px; fieldset thứ hai và input giờ có cạnh phải tại 492 px. Phần giờ trả bị cắt khỏi khung.
- Ảnh: [home-430.png](qa-evidence/home-430.png), [cars-430.png](qa-evidence/cars-430.png)
- Tác động: ảnh hưởng trực tiếp thao tác tìm xe trên điện thoại, luồng chuyển đổi chính của website.

### Medium

#### M-01 — Điểm sao ở danh sách mâu thuẫn với review thực tế

- Trang: `/cars` và `/cars/1`
- Bước tái hiện:
  1. Mở danh sách xe.
  2. Quan sát Toyota Vios 2022: card hiển thị `★ 4.6`.
  3. Mở chi tiết cùng xe.
- Mong đợi: nếu xe chưa có review trên PaceCar, danh sách cũng hiển thị “Chưa có đánh giá”; hoặc điểm phải được giải thích là nguồn khác.
- Thực tế: trang chi tiết hiển thị hai thông báo “Chưa có đánh giá trên PaceCar/Chưa có đánh giá”, không có review nào.
- Ảnh: [cars-430.png](qa-evidence/cars-430.png), [car-detail-430.png](qa-evidence/car-detail-430.png)
- Tác động: làm giảm độ tin cậy của rating và Trust Score.

#### M-02 — Wizard đăng xe cho phép bỏ qua bước nhận diện trống

- Vai trò: owner
- Trang: `/owner/cars/new`
- Bước tái hiện:
  1. Mở form đăng xe mới.
  2. Không nhập bất kỳ trường nào ở bước “Nhận diện xe”.
  3. Bấm “Tiếp tục”.
- Mong đợi: giữ ở bước 1 và chỉ rõ trường bắt buộc.
- Thực tế: chuyển sang bước “Thông số”, tiến độ thành 33%.
- Tác động: người dùng có thể đi sâu vào wizard với dữ liệu nền thiếu; lỗi chỉ xuất hiện muộn và làm tăng tỷ lệ bỏ cuộc.

#### M-03 — CTA lồng phần tử tương tác tạo hai điểm Tab cho một hành động

- Trang: `/`
- Bước tái hiện:
  1. Tải lại trang và dùng phím Tab.
  2. Đi qua CTA “Tìm xe ngay” và “Đăng xe cho thuê”.
- Mong đợi: mỗi CTA là một link hoặc button duy nhất, chỉ nhận focus một lần.
- Thực tế: focus order ghi nhận lần lượt `A:Tìm xe ngay` rồi `BUTTON:Tìm xe ngay`; tương tự với “Đăng xe cho thuê”.
- Tác động: HTML tương tác lồng nhau không hợp lệ, gây double stop cho bàn phím và có thể làm screen reader diễn giải không ổn định.

#### M-04 — URL ngày quá khứ tạo error page với nút retry vô ích

- Trang: `/cars?startDate=2020-01-01&startTime=08:00&endDate=2020-01-02&endTime=20:00`
- Bước tái hiện: mở URL trực tiếp hoặc dùng bookmark cũ.
- Mong đợi: form vẫn hiển thị; trường ngày được đánh dấu sai và có hành động “Chọn ngày mới/Đặt lại”.
- Thực tế: UI chỉ hiển thị “Không tải được dữ liệu — Thời gian nhận xe không thể ở trong quá khứ — Thử lại”. Nút “Thử lại” gửi lại cùng input sai.
- Tác động: người dùng không có đường phục hồi ngay tại trạng thái lỗi.

### Low

#### L-01 — URL location không hợp lệ không khớp với giá trị control

- Với `location=KhongTonTai`, backend trả `0 xe`, nhưng select địa điểm trên UI hiển thị “Hà Nội” do không có option tương ứng.
- Kết quả thực tế bị lọc theo giá trị ẩn trên URL trong khi form cho người dùng thấy tiêu chí khác.

#### L-02 — Thông báo empty review bị lặp

- Trang chi tiết xe không có review đồng thời hiển thị “Chưa có đánh giá trên PaceCar” ở header và “Chưa có đánh giá” trong card empty state ngay bên dưới.
- Nên giữ một thông điệp duy nhất và dùng phần mô tả để giải thích.

#### L-03 — Card trong dashboard owner hơi dày và nhãn bị ngắt vụn

- Ở khu vực “Xe của tôi”, nhãn “Chưa có đánh giá” và “Trust chưa có dữ liệu” bị xuống 2–3 dòng; hàng cuối chỉ có một card tạo khoảng trống lớn.
- Đây là vấn đề trình bày, không phải lỗi chức năng.

## 4. Đánh giá Frontend

### Hiệu suất

Một lần đo cold navigation trong môi trường kiểm thử ghi nhận:

| Chỉ số | Giá trị |
|---|---:|
| TTFB sau khi đã kết nối | 84 ms |
| DOMContentLoaded | 2.817 s |
| First Contentful Paint | 3.208 s |
| Load event | 2.819 s |
| JavaScript transfer | ~118 KB |
| CSS transfer | ~7 KB |
| Ảnh tải ban đầu | ~414 KB / 5 ảnh |
| Tổng resource ban đầu | 10 |

DNS ở lần cold test mất khoảng 2.086 s và chiếm phần lớn thời gian. Khi service đã warm, các request API trực tiếp nằm khoảng 135 ms và trang HTML khoảng 349 ms. Bundle hiện không lớn đối với một SPA demo, nhưng FCP trên 3 giây vẫn tạo cảm giác chờ ở lượt đầu.

Đề xuất hiệu suất:

- Self-host font Be Vietnam Pro hoặc thêm `preconnect`/`font-display`, tránh để font ngoài domain nằm trên critical path.
- Dùng responsive `srcset/sizes` và kích thước ảnh phù hợp; ảnh Unsplash hiện có thể lớn hơn nhu cầu thực tế.
- Tách lazy chunk cho dashboard owner/admin, listing wizard và moderation; khách public không cần tải toàn bộ module quản trị ngay từ đầu.
- Đặt skeleton có kích thước ổn định cho danh sách/ảnh để giảm cảm giác nhảy layout.
- Đo thêm Lighthouse/Web Vitals từ mạng di động thật; số trên chỉ là một lượt đo từ môi trường kiểm thử.

### Animation và cảm giác phản hồi

- Hiệu ứng chủ yếu dùng `opacity` và `transform`, phù hợp để giữ animation mượt.
- Scroll reveal hoạt động: sau khi cuộn tuần tự, 19 phần tử chuyển sang trạng thái visible.
- Có xử lý `prefers-reduced-motion`, đây là điểm tốt về accessibility.
- Thời lượng 650–700 ms tạo cảm giác mềm nhưng hơi chậm nếu dùng lặp lại ở nhiều section. Có thể giảm reveal phổ thông về 350–500 ms và giữ hero ở 600–700 ms.
- Loading skeleton, toast, hover nâng card và transition nút nhất quán; chưa thấy animation gây layout thrashing trong kiểm thử.

### Typography, màu sắc và bố cục

Điểm tốt:

- Be Vietnam Pro dễ đọc, hỗ trợ tiếng Việt tốt.
- Hệ màu xanh chủ đạo, navy CTA và trạng thái xanh/amber/red tạo hierarchy rõ.
- Trang chủ sau khi scroll có nhịp section tốt, card ưu đãi và điểm đến bắt mắt mà không quá nhiều màu.
- Trang chi tiết mobile gom thông tin theo card hợp lý; breakdown giá và CTA nổi bật.
- Dashboard desktop có cấu trúc sidebar → page header → KPI → nội dung rõ ràng.

Điểm nên cải thiện:

- Mobile list quá dài: 10 card liên tiếp và filter nằm sau nút mở. Nên có thanh filter/sort sticky và hiển thị chip filter đang áp dụng.
- Một số metadata/card dùng cỡ chữ rất nhỏ trên 430 px; nên giữ body phụ tối thiểu khoảng 12–13 px và tăng line-height.
- Giảm lặp CTA “Tìm xe/Thuê xe ngay” trên trang chủ; giữ một CTA chính và một CTA owner phụ.
- Đồng bộ card component giữa trang chủ, search và dashboard để review/trust/spacing không lệch logic.

### Responsive

- `1920`, `1440`, `1024`, `768`: trang chủ, danh sách và chi tiết không tràn ngang.
- `430`: chi tiết xe và renter dashboard không tràn; home/search list tràn do SearchBar.
- Mobile menu mở đúng, không che mất nút đóng; dashboard role menu thu gọn hợp lý.
- Thanh CTA fixed trên chi tiết giúp chuyển đổi tốt, nhưng ở tablet/mobile nó lặp lại CTA trong pricing card và che một phần nội dung đang đọc. Có thể chỉ hiển thị sticky CTA sau khi pricing card ra khỏi viewport.

### Accessibility cơ bản

Điểm tốt:

- Public page không phát hiện ảnh thiếu `alt`, ID trùng hoặc form control hoàn toàn thiếu nhãn.
- Input focus có border/ring rõ; mobile menu có `aria-expanded`/`aria-controls`.
- Empty/error state có text, không chỉ dựa vào màu/icon.
- Reduced-motion đã được hỗ trợ.

Điểm cần cải thiện:

- Sửa CTA link bọc button để loại double focus.
- Thêm “Skip to main content” ở đầu trang.
- Dùng `aria-pressed` cho toggle “Tự lái/Có tài xế” và role switch trên login.
- Bảo đảm tất cả icon-only button có accessible name; audit tự động sâu bằng axe/Lighthouse chưa nằm trong lần kiểm thử này.
- Không hiển thị raw exception như `date is not defined` cho người dùng production; chỉ log kỹ thuật, UI dùng thông báo thân thiện.

## 5. Đề xuất theo tác động và công sức

| Ưu tiên | Cải thiện | Tác động | Công sức |
|---:|---|---:|---:|
| 1 | Sửa crash Risk Alerts, thêm smoke/E2E cho owner và admin | Rất cao | Thấp |
| 2 | Chuyển SearchBar mobile thành 1 cột hoặc grid `minmax(0,1fr)`; bỏ width cứng 92 px | Rất cao | Thấp–TB |
| 3 | Dùng một nguồn review duy nhất cho home/search/detail; không hiện sao khi count = 0 | Cao | Trung bình |
| 4 | Validation từng bước trong listing wizard và trạng thái lỗi URL có khả năng phục hồi | Cao | Trung bình |
| 5 | Loại nested interactive, thêm skip link/aria state và test keyboard | Trung bình | Thấp |
| 6 | Lazy-load module role-based, tối ưu ảnh và self-host/preconnect font | Trung bình | Trung bình |
| 7 | Chuẩn hóa card/component token; tăng cỡ metadata mobile và giảm nhãn xuống dòng | Trung bình | Trung bình |

## 6. Bằng chứng

- Trang chủ desktop sau khi scroll: [home-1440-after-scroll.png](qa-evidence/home-1440-after-scroll.png)
- Trang chủ mobile: [home-430.png](qa-evidence/home-430.png)
- Danh sách desktop: [cars-search-results-1440.png](qa-evidence/cars-search-results-1440.png)
- Danh sách mobile: [cars-430.png](qa-evidence/cars-430.png)
- Empty state: [cars-empty-state.png](qa-evidence/cars-empty-state.png)
- Chi tiết mobile: [car-detail-430.png](qa-evidence/car-detail-430.png)
- Dashboard owner: [dashboard-owner-1440.png](qa-evidence/dashboard-owner-1440.png)
- Dashboard renter mobile: [dashboard-renter-430.png](qa-evidence/dashboard-renter-430.png)
- Notification mobile: [notifications-mobile-430.png](qa-evidence/notifications-mobile-430.png)
- Crash Risk Alerts: [risk-alerts-crash-owner.png](qa-evidence/risk-alerts-crash-owner.png)
- Xác nhận booking (không submit): [booking-confirmation-renter.png](qa-evidence/booking-confirmation-renter.png)
- Dữ liệu audit máy đọc: [browser-audit.json](qa-evidence/browser-audit.json), [focused-audit.json](qa-evidence/focused-audit.json), [flow-audit.json](qa-evidence/flow-audit.json)

## 7. Giới hạn và phần chưa xác minh

- Chỉ kiểm tra Chrome; chưa kiểm tra Firefox, Safari/WebKit và thiết bị thật.
- Không thực hiện mutation production: tạo booking, thanh toán demo, ký hợp đồng, thay đổi trạng thái, upload, chỉnh hồ sơ, tạo/sửa/xóa promotion, duyệt tin hoặc pause xe.
- Không có dữ liệu/UI phù hợp để mở tranh chấp từ danh sách booking trong thời điểm kiểm thử.
- Chưa kiểm tra tính bền vững dữ liệu qua restart/deploy Render hoặc chạy đồng thời nhiều instance.
- Chưa chạy WCAG audit đầy đủ bằng axe, screen reader, zoom 200/400% hoặc kiểm tra contrast tự động.
- Performance là snapshot một lần, không phải phân phối p50/p75/p95 từ người dùng thật.
- Email và số điện thoại footer chưa được xác minh là kênh hỗ trợ đang hoạt động; chỉ kiểm tra `mailto:`/`tel:` tồn tại.

## 8. Năm việc nên ưu tiên nhất

1. Sửa ngay crash `date is not defined` trên trang Cảnh báo rủi ro và thêm E2E cho owner/admin.
2. Sửa SearchBar tại 430 px để không còn horizontal overflow hoặc field bị cắt.
3. Đồng bộ rating/review count giữa danh sách và chi tiết; không hiển thị điểm sao không có nguồn review.
4. Chặn chuyển bước wizard khi dữ liệu bắt buộc còn trống và làm error state ngày quá khứ có đường sửa trực tiếp.
5. Sửa cấu trúc link/button lồng nhau, thêm skip link và chuẩn hóa focus/ARIA cho toàn bộ control tương tác.
