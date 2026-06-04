
// both data and error are optional since a success response won't have an error and a failure response doesn't have data
export type ApiResponse<T> =
  | { success: true; data: T}
  | { success: false; error: string};