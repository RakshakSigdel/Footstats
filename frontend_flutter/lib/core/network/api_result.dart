//This is used to handle outcome of API call for both
// success - response with data
// Failure - Error message in human readable form
class ApiResult<T> {
  final bool isSuccess;
  final T? data;
  final String? errorMessage;

  ApiResult.success(this.data) : isSuccess = true, errorMessage = null;

  ApiResult.failure(this.errorMessage) : isSuccess = false, data = null;
}
