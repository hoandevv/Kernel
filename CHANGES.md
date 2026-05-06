# Tóm tắt các thay đổi giao diện

## Các thay đổi chính

### 1. HTML (index.html)
- Thay thế textarea bằng các ô nhập dạng lưới (grid) cho ma trận I và kernel H
- Thêm bộ chọn kích thước (dropdown) cho ma trận ảnh (2x2 đến 10x10)
- Thêm bộ chọn kích thước cho kernel (2x2, 3x3, 5x5, 7x7, 9x9)
- Thêm nút Reset cho từng ma trận
- Cải thiện bố cục: chia thành 2 cột cho phần nhập liệu
- Thêm thông tin kích thước cho kết quả đầu ra

### 2. CSS (style.css)
- Giao diện hiện đại với gradient và bóng đổ nhẹ
- Thiết kế bo góc đẹp (border-radius: 12px)
- Màu sắc rõ ràng: xanh dương cho ma trận I, đỏ cho kernel
- Phần `.step-item` đã được thu nhỏ padding (24px → 18px)
- Tăng kích thước chữ: step-header (16px → 17px), result-line (15px → 16px)
- Tăng kích thước chữ trong ô nhập: 18px → 16px (nhưng vẫn đọc được)
- Thêm hiệu ứng hover và focus cho các ô nhập
- Responsive design tốt hơn cho mobile
- Thêm animation khi hiển thị kết quả

### 3. JavaScript (script.js)
- Thêm hàm `createMatrixGrid()`: tạo lưới ô nhập động
- Thêm hàm `getMatrixFromGrid()`: lấy dữ liệu từ lưới ô nhập
- Giữ nguyên toàn bộ logic convolution (hàm `convolve()`)
- Giữ nguyên các hàm render (renderOutput, renderSteps)
- Thêm xử lý sự kiện thay đổi kích thước ma trận
- Thêm xử lý sự kiện nút Reset
- Thêm điều hướng bằng phím Enter giữa các ô nhập
- Chỉ cho phép nhập số và dấu trừ
- Tự động cuộn đến kết quả sau khi tính toán

### 4. Tính năng mới
- Điều chỉnh kích thước ma trận động (2x2 đến 10x10)
- Điều chỉnh kích thước kernel (2x2 đến 9x9)
- Nút Reset từng ma trận
- Hiển thị kích thước ma trận kết quả
- Hiển thị số bước tính toán
- Điều hướng ô nhập bằng phím Enter

### 5. Trải nghiệm người dùng
- Giao diện sạch, hiện đại, trực quan
- Các ô nhập thẳng hàng, đều nhau như ma trận thật
- Dễ nhìn khi nhập liệu
- Phần kết quả rõ ràng, dễ theo dõi
- Mỗi bước tính trình bày chi tiết với tiêu đề, vùng phủ, phép tính và kết quả
- Responsive tốt trên laptop và desktop

## Giữ nguyên
- Toàn bộ thuật toán tính toán convolution
- Logic zero-padding
- Cách hiển thị từng bước tính toán
- Các thông báo lỗi và validation

## File mới
- `test_ui.html`: Trang test giao diện
- `test_functionality.html`: Trang test chức năng
- `README.md`: Cập nhật hướng dẫn sử dụng

## Kích thước tối đa
- Ma trận ảnh: 10x10
- Kernel: 9x9 (chỉ số lẻ)
- Không giới hạn giá trị số (có thể nhập số âm, dương, 0)
