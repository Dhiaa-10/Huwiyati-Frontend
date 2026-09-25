/**
 * Unified API Response Envelopes
 * Matches ASP.NET Core ApiResponse<T> wrapper:
 * { isSuccess, statusCode, message, data, errors }
 */

export interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}
