/**
 * Xử lý URL hình ảnh để đảm bảo hiển thị đúng
 * Hỗ trợ nhiều định dạng URL khác nhau: đường dẫn tương đối, đường dẫn tuyệt đối, URL đầy đủ
 *
 * @param {string} imageUrl - URL ảnh hoặc tên file ảnh
 * @param {string} type - Loại ảnh ('course', 'profile', 'category', v.v.)
 * @param {string} defaultImage - Ảnh mặc định sử dụng khi không có ảnh
 * @returns {string} URL ảnh đã xử lý
 */
export const getImageUrl = (
  imageUrl,
  type = "course",
  defaultImage = null,
) => {
  // Map các loại ảnh với thư mục tương ứng
  const typeToFolder = {
    course: "/assets/images/courses/",
    profile: "/assets/images/profiles/",
    category: "/assets/images/categories/",
    default: "/assets/images/",
  };

  // Map các loại ảnh với ảnh mặc định
  const defaultImages = {
    course: "/assets/images/courses/default-course.jpg",
    profile: "/assets/images/profiles/default-avatar.jpg",
    category: "/assets/images/categories/default-category.jpg",
    default: "/assets/images/default.jpg",
  };

  // Nếu không có URL ảnh, trả về ảnh mặc định
  if (!imageUrl) {
    return defaultImage || defaultImages[type] || defaultImages.default;
  }

  // Xử lý trường hợp khi imageUrl là object (cho phép tương thích với cách xử lý của dashboard)
  if (typeof imageUrl === "object") {
    // Ưu tiên thumbnailUrl nếu có
    if (imageUrl.thumbnailUrl) {
      return imageUrl.thumbnailUrl;
    }

    // Sau đó xem xét thumbnail
    if (imageUrl.thumbnail && !imageUrl.thumbnail.includes("undefined")) {
      return `${typeToFolder[type]}${imageUrl.thumbnail}`;
    }

    // Cuối cùng xem xét imageUrl trong object
    if (imageUrl.imageUrl && !imageUrl.imageUrl.includes("undefined")) {
      if (
        imageUrl.imageUrl.startsWith("http") ||
        imageUrl.imageUrl.startsWith("/")
      ) {
        return imageUrl.imageUrl;
      } else {
        return `${typeToFolder[type]}${imageUrl.imageUrl}`;
      }
    }

    // Nếu không có giá trị nào hợp lệ, sử dụng ảnh mặc định
    return defaultImage || defaultImages[type] || defaultImages.default;
  }

  // Nếu đã là URL đầy đủ
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Nếu bắt đầu bằng /uploads (NextJS tự động xử lý)
  if (imageUrl.startsWith("/uploads") || imageUrl.startsWith("/api")) {
    return imageUrl;
  }

  // Nếu bắt đầu bằng dấu / -> đây là đường dẫn tương đối từ gốc
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("/assets/")) {
    return imageUrl;
  }

  // Trường hợp còn lại (giả sử đây là tên file) -> ghép với thư mục tương ứng
  const folder = typeToFolder[type] || typeToFolder.default;
  return `${folder}${imageUrl}`;
};

/**
 * Xác định có hiển thị ảnh hay không dựa trên URL ảnh
 * Kiểm tra nếu URL ảnh hợp lệ
 *
 * @param {string} imageUrl - URL ảnh cần kiểm tra
 * @returns {boolean} Có hiển thị ảnh hay không
 */
export const shouldDisplayImage = (imageUrl) => {
  return (
    !!imageUrl &&
    imageUrl !== "" &&
    imageUrl !== "undefined" &&
    !imageUrl.includes("undefined")
  );
};
