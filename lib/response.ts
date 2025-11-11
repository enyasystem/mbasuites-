// Standardized API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export function successResponse<T>(data: T, meta?: ApiResponse["meta"]): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  }
}

export function errorResponse(message: string, code = "ERROR", details?: any): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }
}
