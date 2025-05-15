import { NextResponse } from "next/server";

/**
 * Tạo phản hồi thành công với cấu trúc chuẩn
 * @param {any} data Dữ liệu trả về
 * @param {string} message Thông báo trả về
 * @param {number} statusCode Mã trạng thái HTTP
 * @returns {NextResponse} Phản hồi đã chuẩn hóa
 */
export function successResponse(
  data = null,
  message = "Thành công",
  statusCode = 200,
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

/**
 * Tạo phản hồi lỗi với cấu trúc chuẩn
 * @param {string} message Thông báo lỗi
 * @param {number} statusCode Mã trạng thái HTTP
 * @param {any} errors Chi tiết lỗi (nếu có)
 * @param {string} errorCode Mã lỗi cho frontend (nếu có)
 * @returns {NextResponse} Phản hồi lỗi đã chuẩn hóa
 */
export function errorResponse(
  message = "Đã xảy ra lỗi",
  statusCode = 400,
  errors = null,
  errorCode = null,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      errorCode,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

/**
 * Tạo phản hồi không tìm thấy dữ liệu
 * @param {string} entity Tên thực thể không tìm thấy
 * @returns {NextResponse} Phản hồi lỗi 404
 */
export function notFoundResponse(entity = "Dữ liệu") {
  return errorResponse(`Không tìm thấy ${entity}`, 404, null, "NOT_FOUND");
}

/**
 * Tạo phản hồi lỗi xác thực
 * @param {string} message Thông báo lỗi
 * @returns {NextResponse} Phản hồi lỗi 401
 */
export function unauthorizedResponse(
  message = "Bạn cần đăng nhập để thực hiện thao tác này",
) {
  return errorResponse(message, 401, null, "UNAUTHORIZED");
}

/**
 * Tạo phản hồi lỗi phân quyền
 * @param {string} message Thông báo lỗi
 * @returns {NextResponse} Phản hồi lỗi 403
 */
export function forbiddenResponse(
  message = "Bạn không có quyền thực hiện thao tác này",
) {
  return errorResponse(message, 403, null, "FORBIDDEN");
}

/**
 * Tạo phản hồi lỗi dữ liệu không hợp lệ
 * @param {string} message Thông báo lỗi
 * @param {any} errors Chi tiết lỗi
 * @returns {NextResponse} Phản hồi lỗi 400
 */
export function validationErrorResponse(
  message = "Dữ liệu không hợp lệ",
  errors = null,
) {
  return errorResponse(message, 400, errors, "VALIDATION_ERROR");
}

/**
 * Tạo phản hồi lỗi máy chủ
 * @param {string} message Thông báo lỗi
 * @returns {NextResponse} Phản hồi lỗi 500
 */
export function serverErrorResponse(message = "Đã xảy ra lỗi từ hệ thống") {
  return errorResponse(message, 500, null, "SERVER_ERROR");
}
