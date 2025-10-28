enum ResponseStatus {
  Success = 200,
  NotFound = 404,
  Error = 500,
}

function handleResponse(status: ResponseStatus): void {
  switch (status) {
    case ResponseStatus.Success:
      console.log("Request was successful.");
      break;
    case ResponseStatus.NotFound:
      console.log("Resource not found.");
      break;
    case ResponseStatus.Error:
      console.log("An internal server error occurred.");
      break;
  }
}

handleResponse(ResponseStatus.Success);