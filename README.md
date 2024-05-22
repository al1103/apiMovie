
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
    - lọc phim theo "category",
        "quality",
        "language",
        "year",
        "country",
- Ví dụ : GET `https://apimovie-6ifv.onrender.com/Search?name=gio-cao-diem-2&category=action&quality=HD&language=en&year=2023`
- **Phim và tập phim:**
    - Phương thức: GET
    - URL: `https://apimovie-6ifv.onrender.com/movie/${slug}` (thay thế `slug` bằng đường dẫn phim)
    - Ví dụ: `GET https://apimovie-6ifv.onrender.com/movie/that-nghiep-chuyen-sinh-2` (Lấy thông tin phim "Thất Nghiệp Chuyển Sinh 2")
    - Lọc phim theo "category", "quality", "language", "year", "country",
    - Ví dụ : `GET https://apimovie-6ifv.onrender.com/Search?name=gio-cao-diem-2&category=action&quality=HD&language=en&year=2023`
**Lưu ý:** 
- Bạn có thể sử dụng thư viện `fetch` hoặc các phương pháp khác để thực hiện các yêu cầu GET đến API này để lấy thông tin phim theo nhu cầu.
- Kiểm tra tài liệu của API (nếu có) để biết thêm chi tiết về các tham số trả về và các chức năng khác được hỗ trợ.
