/**
 * Các tiện ích giúp tối ưu hóa truy vấn MongoDB/Mongoose
 */
import mongoose from "mongoose";
import { withCache } from "./cache";

/**
 * Danh sách các trường thường không cần thiết khi truy vấn
 */
const DEFAULT_EXCLUDED_FIELDS = ["__v", "password", "updatedAt"];

/**
 * Tạo projection để chỉ lấy các trường cần thiết
 * @param {Array<string>} fields Danh sách trường cần lấy
 * @param {Array<string>} excludedFields Danh sách trường cần loại trừ
 * @returns {Object} Đối tượng projection cho mongoose
 */
export function createProjection(
  fields = [],
  excludedFields = DEFAULT_EXCLUDED_FIELDS,
) {
  const projection = {};

  // Nếu có danh sách trường cụ thể
  if (fields.length > 0) {
    fields.forEach((field) => {
      projection[field] = 1;
    });
    return projection;
  }

  // Nếu chỉ có danh sách loại trừ
  excludedFields.forEach((field) => {
    projection[field] = 0;
  });

  return projection;
}

/**
 * Cache tự động cho các truy vấn findById của Mongoose
 * @param {mongoose.Model} model Model mongoose cần truy vấn
 * @param {string} id ID của document
 * @param {Object} options Tùy chọn cho truy vấn
 * @returns {Promise<Document>} Document kết quả
 */
export const findByIdCached = withCache(
  async (model, id, options = {}) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const {
      fields = [],
      excludedFields = DEFAULT_EXCLUDED_FIELDS,
      lean = true,
      populate = [],
    } = options;

    const projection = createProjection(fields, excludedFields);

    let query = model.findById(id, projection);

    // Thêm các quan hệ nếu cần
    if (populate.length > 0) {
      query = query.populate(populate);
    }

    // Dùng lean() để tối ưu hiệu suất
    if (lean) {
      query = query.lean();
    }

    return query;
  },
  "findById",
  10 * 60 * 1000, // Cache 10 phút
);

/**
 * Cache tự động cho các truy vấn findOne của Mongoose
 * @param {mongoose.Model} model Model mongoose cần truy vấn
 * @param {Object} filter Điều kiện tìm kiếm
 * @param {Object} options Tùy chọn cho truy vấn
 * @returns {Promise<Document>} Document kết quả
 */
export const findOneCached = withCache(
  async (model, filter = {}, options = {}) => {
    const {
      fields = [],
      excludedFields = DEFAULT_EXCLUDED_FIELDS,
      lean = true,
      populate = [],
    } = options;

    const projection = createProjection(fields, excludedFields);

    let query = model.findOne(filter, projection);

    // Thêm các quan hệ nếu cần
    if (populate.length > 0) {
      query = query.populate(populate);
    }

    // Dùng lean() để tối ưu hiệu suất
    if (lean) {
      query = query.lean();
    }

    return query;
  },
  "findOne",
  10 * 60 * 1000, // Cache 10 phút
);

/**
 * Cache tự động cho các truy vấn find của Mongoose
 * @param {mongoose.Model} model Model mongoose cần truy vấn
 * @param {Object} filter Điều kiện tìm kiếm
 * @param {Object} options Tùy chọn cho truy vấn
 * @returns {Promise<Document[]>} Danh sách document kết quả
 */
export const findCached = withCache(
  async (model, filter = {}, options = {}) => {
    const {
      fields = [],
      excludedFields = DEFAULT_EXCLUDED_FIELDS,
      sort = { createdAt: -1 },
      limit = 100,
      skip = 0,
      lean = true,
      populate = [],
    } = options;

    const projection = createProjection(fields, excludedFields);

    let query = model.find(filter, projection);

    // Áp dụng sorting
    if (sort) {
      query = query.sort(sort);
    }

    // Phân trang
    if (skip > 0) {
      query = query.skip(skip);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    // Thêm các quan hệ nếu cần
    if (populate.length > 0) {
      query = query.populate(populate);
    }

    // Dùng lean() để tối ưu hiệu suất
    if (lean) {
      query = query.lean();
    }

    return query;
  },
  "find",
  5 * 60 * 1000, // Cache 5 phút
);

/**
 * Xây dựng điều kiện tìm kiếm từ query params
 * @param {Object} queryParams Các tham số query
 * @param {Object} options Tùy chọn cấu hình
 * @returns {Object} Điều kiện tìm kiếm và tùy chọn cho MongoDB
 */
export function buildQuery(queryParams, options = {}) {
  const {
    searchFields = [],
    exactFields = [],
    numberFields = [],
    dateFields = [],
    booleanFields = [],
    allowedSortFields = [],
  } = options;

  const filter = {};
  const mongoOptions = {
    sort: { createdAt: -1 },
    skip: 0,
    limit: 50,
  };

  // Xử lý tìm kiếm
  if (queryParams.search && searchFields.length > 0) {
    const searchValue = queryParams.search.trim();
    if (searchValue) {
      const searchConditions = searchFields.map((field) => ({
        [field]: { $regex: searchValue, $options: "i" },
      }));

      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
    }
  }

  // Xử lý các trường cần khớp chính xác
  exactFields.forEach((field) => {
    if (queryParams[field] !== undefined && queryParams[field] !== "") {
      filter[field] = queryParams[field];
    }
  });

  // Xử lý các trường số
  numberFields.forEach((field) => {
    // Phạm vi (field_min, field_max)
    const minKey = `${field}_min`;
    const maxKey = `${field}_max`;

    if (queryParams[minKey] !== undefined) {
      filter[field] = filter[field] || {};
      filter[field].$gte = Number(queryParams[minKey]);
    }

    if (queryParams[maxKey] !== undefined) {
      filter[field] = filter[field] || {};
      filter[field].$lte = Number(queryParams[maxKey]);
    }

    // Giá trị chính xác
    if (queryParams[field] !== undefined) {
      filter[field] = Number(queryParams[field]);
    }
  });

  // Xử lý các trường ngày
  dateFields.forEach((field) => {
    // Phạm vi (field_from, field_to)
    const fromKey = `${field}_from`;
    const toKey = `${field}_to`;

    if (queryParams[fromKey]) {
      filter[field] = filter[field] || {};
      filter[field].$gte = new Date(queryParams[fromKey]);
    }

    if (queryParams[toKey]) {
      filter[field] = filter[field] || {};
      filter[field].$lte = new Date(queryParams[toKey]);
    }
  });

  // Xử lý các trường boolean
  booleanFields.forEach((field) => {
    if (queryParams[field] !== undefined) {
      const value = queryParams[field];
      if (value === "true" || value === true) {
        filter[field] = true;
      } else if (value === "false" || value === false) {
        filter[field] = false;
      }
    }
  });

  // Xử lý sắp xếp
  if (
    queryParams.sort &&
    allowedSortFields.includes(queryParams.sort.replace("-", ""))
  ) {
    const sortField = queryParams.sort;
    const sortOrder = sortField.startsWith("-") ? -1 : 1;
    const field = sortField.startsWith("-")
      ? sortField.substring(1)
      : sortField;
    mongoOptions.sort = { [field]: sortOrder };
  }

  // Xử lý phân trang
  if (queryParams.page && !isNaN(queryParams.page)) {
    const page = Math.max(1, parseInt(queryParams.page));
    const limit =
      queryParams.limit && !isNaN(queryParams.limit)
        ? Math.min(100, parseInt(queryParams.limit))
        : 50;

    mongoOptions.skip = (page - 1) * limit;
    mongoOptions.limit = limit;
  } else if (queryParams.limit && !isNaN(queryParams.limit)) {
    mongoOptions.limit = Math.min(100, parseInt(queryParams.limit));
  }

  return { filter, options: mongoOptions };
}
