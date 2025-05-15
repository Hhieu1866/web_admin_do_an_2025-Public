import {
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from "./api-response";

/**
 * Danh sách mã lỗi MongoDB
 */
const MONGO_ERROR_CODES = {
  DUPLICATE_KEY: 11000,
};

/**
 * Xử lý lỗi tập trung cho API
 * @param {Error} error Đối tượng lỗi
 * @param {string} customMessage Thông báo tùy chỉnh (nếu có)
 * @returns {NextResponse} Phản hồi lỗi đã chuẩn hóa
 */
export function handleApiError(error, customMessage = null) {
  console.error("API Error:", error.message, error.stack);

  // MongoDB errors
  if (error.name === "MongoServerError" || error.name === "MongoError") {
    if (error.code === MONGO_ERROR_CODES.DUPLICATE_KEY) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(
        `Dữ liệu ${field} đã tồn tại trong hệ thống`,
        409,
        { field },
        "DUPLICATE_ENTRY",
      );
    }
  }

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    const errors = {};

    // Chuyển đổi lỗi validation của Mongoose sang dạng dễ hiểu hơn
    for (const field in error.errors) {
      errors[field] = {
        message: error.errors[field].message,
        value: error.errors[field].value,
        type: error.errors[field].kind,
      };
    }

    return validationErrorResponse("Dữ liệu không hợp lệ", errors);
  }

  // Lỗi cast type MongoDB
  if (error.name === "CastError") {
    return validationErrorResponse(
      `Giá trị không hợp lệ cho trường ${error.path}`,
      {
        field: error.path,
        value: error.value,
        type: error.kind,
      },
    );
  }

  // Lỗi do người dùng tự tạo (đã xác định)
  if (error.name === "AppError" || error.isOperational) {
    return errorResponse(
      error.message,
      error.statusCode || 400,
      error.errors,
      error.errorCode,
    );
  }

  // Lỗi server mặc định
  return serverErrorResponse(customMessage || "Đã xảy ra lỗi từ hệ thống");
}

/**
 * Tạo lớp lỗi tùy chỉnh cho ứng dụng
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message Thông báo lỗi
   * @param {number} statusCode Mã trạng thái HTTP
   * @param {any} errors Chi tiết lỗi (nếu có)
   * @param {string} errorCode Mã lỗi cho frontend
   */
  constructor(message, statusCode = 400, errors = null, errorCode = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;
    this.isOperational = true; // Đánh dấu là lỗi do mình tạo

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Tạo lỗi với mã lỗi chung
   * @static
   * @param {string} message Thông báo lỗi
   * @returns {AppError} Đối tượng lỗi
   */
  static badRequest(message) {
    return new AppError(message, 400, null, "BAD_REQUEST");
  }

  /**
   * Tạo lỗi xác thực
   * @static
   * @param {string} message Thông báo lỗi
   * @returns {AppError} Đối tượng lỗi
   */
  static unauthorized(message = "Bạn cần đăng nhập để thực hiện thao tác này") {
    return new AppError(message, 401, null, "UNAUTHORIZED");
  }

  /**
   * Tạo lỗi phân quyền
   * @static
   * @param {string} message Thông báo lỗi
   * @returns {AppError} Đối tượng lỗi
   */
  static forbidden(message = "Bạn không có quyền thực hiện thao tác này") {
    return new AppError(message, 403, null, "FORBIDDEN");
  }

  /**
   * Tạo lỗi không tìm thấy
   * @static
   * @param {string} entity Tên thực thể không tìm thấy
   * @returns {AppError} Đối tượng lỗi
   */
  static notFound(entity = "Dữ liệu") {
    return new AppError(`Không tìm thấy ${entity}`, 404, null, "NOT_FOUND");
  }

  /**
   * Tạo lỗi validation
   * @static
   * @param {string} message Thông báo lỗi
   * @param {any} errors Chi tiết lỗi
   * @returns {AppError} Đối tượng lỗi
   */
  static validation(message = "Dữ liệu không hợp lệ", errors = null) {
    return new AppError(message, 400, errors, "VALIDATION_ERROR");
  }
}

/**
 * Bắt và xử lý lỗi trong các hàm async
 * @param {Function} fn Hàm async cần được bắt lỗi
 * @returns {Function} Hàm đã được bọc để bắt lỗi
 */
export function asyncHandler(fn) {
  return async function (req, ...args) {
    try {
      return await fn(req, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
