/**
 * Cấu hình CORS để sử dụng cho toàn bộ API
 * Sử dụng đối tượng này để áp dụng CORS headers nhất quán cho tất cả API
 */

// CORS headers cơ bản cho tất cả các response
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
};

// CORS headers cho preflight requests
export const preflightHeaders = {
  ...corsHeaders,
  "Access-Control-Max-Age": "86400", // Cache trong 24 giờ
};

/**
 * Thêm CORS headers vào NextResponse
 * @param {NextResponse} response - NextResponse object
 * @returns {NextResponse} - NextResponse với CORS headers
 */
export function applyCorsHeaders(response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Tạo response cho OPTIONS request (preflight)
 * @returns {NextResponse} - NextResponse với CORS headers phù hợp
 */
export function handleCorsOptions() {
  return new Response(null, {
    status: 204, // No content
    headers: preflightHeaders,
  });
}
