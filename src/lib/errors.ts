export type AppErrorCode =
  | 'InputNotFound'
  | 'UnsupportedFormat'
  | 'EngineMissing'
  | 'EngineFailed'
  | 'PasswordRequired'
  | 'WrongPassword'
  | 'InvalidPageRange'
  | 'OutputPermissionDenied'
  | 'OutputAlreadyExists'
  | 'Timeout'
  | 'Cancelled'
  | 'CorruptedFile'
  | 'Unknown'

export type AppError = {
  code: AppErrorCode
  message: string
  details?: string
}

export const friendlyError = (error: AppError) => `${error.code}: ${error.message}`
