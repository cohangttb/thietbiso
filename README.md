# Phòng thực hành Toán 2 – Cân đĩa và Đồng hồ

Ứng dụng học liệu tương tác trực quan môn Toán lớp 2, xây dựng theo chương trình Giáo dục Phổ thông 2018.

## 🌟 Tính năng chính

### 1. Mô phỏng Cân đĩa (Ki-lô-gam)
- **Vẽ bằng SVG sắc nét:** Gồm chân đế vững chắc, trụ đứng, đòn cân thăng bằng và hai đĩa cân treo.
- **Vật lý chân thực:**
  - Bên nặng hơn hạ xuống, bên nhẹ hơn nâng lên.
  - Khi hai bên bằng nhau, đòn cân nằm ngang hoàn hảo.
  - Hai đĩa cân luôn giữ phương thẳng đứng hướng lên (không bị xoay nghiêng theo góc đòn cân).
  - Góc nghiêng chuyển động mượt mà có giới hạn góc tối đa an toàn.
- **Kho quả cân & đồ vật:**
  - Các quả cân chuẩn: 1 kg, 2 kg, 5 kg (lấy không giới hạn số lượng).
  - Các đồ vật sinh động: Túi gạo, hộp đồ chơi, giỏ trái cây, quả dưa hấu, bình nước, gấu bông, ba lô sách (1 kg đến 6 kg).
- **Thao tác linh hoạt:** Hỗ trợ kéo - thả (Drag & Drop) và Chạm - Chọn (Tap to select) cho điện thoại và máy tính bảng.
- **2 chế độ học tập:**
  - *Khám phá tự do:* Tự do đặt đồ vật và xem kết luận trạng thái cân.
  - *Thử thách 5 câu:* So sánh nặng - nhẹ, thêm quả cân làm thăng bằng, tìm khối lượng vật bí ẩn.

### 2. Mô phỏng Đồng hồ kim & Đồng hồ số
- **Mặt đồng hồ tròn SVG:** Đầy đủ 12 chữ số và 60 vạch phút.
- **Hai kim trực quan:**
  - Kim giờ ngắn (màu xanh dương).
  - Kim phút dài (màu đỏ).
  - Chú giải rõ ràng phân biệt kim giờ và kim phút.
- **Tính toán góc chuẩn xác theo công thức sư phạm:**
  - Góc kim phút = `phút × 6°`.
  - Góc kim giờ = `(giờ × 30°) + (phút × 0.5°)`.
  - Ví dụ lúc 3 giờ 30 phút, kim giờ nằm chính xác ở giữa số 3 và số 4.
  - Xử lý kéo kim qua mốc 12 giờ liên tục theo cả 2 chiều thuận/nghịch.
- **Nút điều khiển nhanh:** Tăng / giảm 1 giờ và phút theo mức độ.
- **3 chế độ:**
  - *Khám phá:* Quay kim và xem cách đọc giờ thời gian thực.
  - *Đọc giờ:* Quan sát đồng hồ và chọn 1 trong 3 đáp án trắc nghiệm.
  - *Đặt giờ:* Chỉnh kim theo đề bài yêu cầu.

### 3. Bảng điều khiển Giáo viên & Phụ huynh
- Chọn mức độ học đồng hồ:
  - Mức 1: Giờ đúng.
  - Mức 2: Giờ đúng và giờ rưỡi (Chuẩn Toán 2).
  - Mức 3: Mở rộng các mốc 5 phút.
- Bật / tắt gợi ý.
- Bật / tắt hiển thị số kg trên đĩa cân.
- Lưu và xem lịch sử làm bài cục bộ qua `localStorage`.

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
- Node.js version 18 trở lên.
- Trình duyệt hiện đại (Chrome, Edge, Safari, Firefox).

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy ở môi trường phát triển (Dev)
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ `http://localhost:3000`.

### 3. Biên dịch và xuất bản (Build & Deploy)
```bash
npm run build
```
Thư mục `dist/` sau khi build chứa toàn bộ HTML, CSS và JavaScript tĩnh, có thể triển khai miễn phí lên bất kỳ dịch vụ hosting nào:
- **Vercel / Netlify:** Kéo thả thư mục `dist/` hoặc liên kết GitHub repo.
- **GitHub Pages:** Triển khai nhánh gh-pages từ thư mục `dist/`.
- **Cloudflare Pages / Firebase Hosting.**
