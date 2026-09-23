# Hướng dẫn chạy PaceCar trên máy khác

## 1. Yêu cầu

- Windows 10/11, macOS hoặc Linux.
- Node.js 20 trở lên: https://nodejs.org/
- Kết nối Internet trong lần cài thư viện đầu tiên và để tải ảnh xe mẫu.

Kiểm tra Node.js và npm:

```powershell
node -v
npm -v
```

## 2. Cài và chạy

1. Giải nén file ZIP vào một thư mục không dấu, ví dụ `D:\PaceCar_Test`.
2. Mở PowerShell/Terminal tại thư mục vừa giải nén.
3. Chạy:

```powershell
npm run install-all
npm run dev
```

Đợi đến khi terminal hiển thị frontend và backend đã khởi động, sau đó mở:

- Website: http://localhost:5173
- API health check: http://localhost:4000/api/health

Không đóng cửa sổ terminal trong thời gian kiểm thử. Nhấn `Ctrl + C` để dừng hệ thống.

## 3. Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Người thuê | `renter@pacecar.vn` | `123456` |
| Chủ xe | `owner@pacecar.vn` | `123456` |
| Quản trị | `admin@pacecar.vn` | `123456` |

Các màn hình nên kiểm thử:

- Trang chủ, tìm kiếm và lọc xe.
- Người thuê: yêu thích, báo giá, mã ưu đãi, tạo đơn thuê, hợp đồng và bằng chứng.
- Chủ xe: đăng xe, quản lý tin và xử lý yêu cầu thuê.
- Admin: dashboard, duyệt tin xe, cảnh báo rủi ro và quản lý ưu đãi tại `/admin/promotions`.
- Footer: Tìm xe, Cách hoạt động và Hỗ trợ tranh chấp.

## 4. Kiểm tra trước khi test

```powershell
npm test
npm run build
```

`npm test` dùng database tạm nên không làm thay đổi dữ liệu demo.

## 5. Xử lý lỗi thường gặp

### PowerShell chặn npm

Mở Command Prompt (`cmd`) thay cho PowerShell và chạy lại các lệnh npm, hoặc dùng:

```powershell
npm.cmd run install-all
npm.cmd run dev
```

### Cổng 4000 hoặc 5173 đang được sử dụng

Đóng tiến trình Node.js/dev server cũ rồi chạy lại. Trên Windows có thể kiểm tra:

```powershell
Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 4000,5173
```

### Muốn phục hồi dữ liệu demo ban đầu

1. Dừng server bằng `Ctrl + C`.
2. Xóa `server/src/data/db.json`.
3. Chạy lại `npm run dev`.

Backend sẽ tự tạo lại database từ seed. Không gửi file `db.json` có dữ liệu kiểm thử hoặc session thật cho người khác.

### Frontend báo không kết nối được backend

Đảm bảo cả hai dòng Vite và PaceCar API đều đang chạy trong terminal. Kiểm tra trực tiếp http://localhost:4000/api/health; kết quả đúng là JSON có `"ok": true`.

## 6. Gửi báo lỗi

Khi gặp lỗi, gửi kèm:

- Vai trò/tài khoản đang dùng.
- Đường dẫn trang và các bước để tái hiện.
- Ảnh chụp màn hình.
- Nội dung lỗi trong terminal và Console của trình duyệt.
- Trình duyệt, hệ điều hành và phiên bản Node.js.
