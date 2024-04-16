## Tăng Hiệu Suất Tải Trang Bằng Cách Chặn Quảng Cáo

**Nội Dung Cần Chặn**

- **Hình ảnh:**
    - `https://img.nguonc.com/public/images/i9/pc.gif`
- **Liên kết:**
    - `https://www.i9bet203.com/Register`

**Phương Pháp Chặn**

Phương pháp đề xuất sử dụng API `fetch` để chặn và sửa đổi nội dung HTML trước khi nó được hiển thị trên trình duyệt. Điều này giúp ngăn chặn hiệu quả các quảng cáo mục tiêu xuất hiện trên trang web.

**Triển Khai**

Đoạn mã sau đây minh họa việc thực hiện lọc nội dung bằng API `fetch`:

```javascript
async function filterContent() {
  const response = await fetch('https://example.com'); // Thay thế bằng URL mục tiêu
  const html = await response.text();
  const dom = new DOMParser().parseFromString(html, 'text/html');

  // Xác định và sửa đổi các phần tử mục tiêu dựa trên thuộc tính hoặc nội dung của chúng
  const blockedImages = dom.querySelectorAll('img[src="https://img.nguonc.com/public/images/i9/pc.gif"]');
  blockedImages.forEach((img) => {
    // Chọn chiến lược lọc:
    // - img.parentNode.removeChild(img); // Xóa toàn bộ phần tử
    // - img.src = ''; // Thay thế nội dung bằng chuỗi rỗng
    // - img.style.display = 'none'; // Ẩn bằng CSS
  });

  // Áp dụng các quy tắc lọc bổ sung nếu cần thiết

  const filteredHTML = dom.documentElement.outerHTML;
  // Thay thế HTML gốc trong ngữ cảnh hiển thị trình duyệt (ví dụ: sử dụng thuộc tính innerHTML của iframe hoặc document.body)
}

filterContent();
```

**Cách Sử Dụng API Lấy Thông Tin Phim**

**API được cung cấp:**

- **Danh sách phim:**
    - Phương thức: GET
    - URL: `https://apimovie-6ifv.onrender.com/allmovie?page=${page}` (thay thế `page` bằng số trang mong muốn)
    - Ví dụ: `GET https://apimovie-6ifv.onrender.com/allmovie?page=1` (Lấy trang 1)
- **Tìm kiếm phim:**
    - Phương thức: GET
    - URL: `https://apimovie-6ifv.onrender.com/Search?name=${slug}` (thay thế `slug` bằng từ khóa tìm kiếm)
    - Ví dụ: `GET https://apimovie-6ifv.onrender.com/Search?name=gio-cao-diem-2` (Tìm kiếm phim có chứa từ khóa "gio-cao-diem-2")
- **Phim và tập phim:**
    - Phương thức: GET
    - URL: `https://apimovie-6ifv.onrender.com/movie/${slug}` (thay thế `slug` bằng đường dẫn phim)
    - Ví dụ: `GET https://apimovie-6ifv.onrender.com/movie/that-nghiep-chuyen-sinh-2` (Lấy thông tin phim "Thất Nghiệp Chuyển Sinh 2")
    - Lọc phim theo "category", "quality", "language", "year", "country",
    - Ví dụ : GET https://apimovie-6ifv.onrender.com/Search?name=gio-cao-diem-2&category=action&quality=HD&language=en&year=2023
**Lưu ý:** 
- Bạn có thể sử dụng thư viện `fetch` hoặc các phương pháp khác để thực hiện các yêu cầu GET đến API này để lấy thông tin phim theo nhu cầu.
- Kiểm tra tài liệu của API (nếu có) để biết thêm chi tiết về các tham số trả về và các chức năng khác được hỗ trợ.
