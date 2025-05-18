/*
/src/utils/extractRestError.js

This utility function is designed to extract error messages from API responses, making it easier to handle and display meaningful messages to the user. It processes the error object returned from Axios requests and returns a relevant error message, while specifically filtering out 401 Unauthorized errors.

The 401 errors are already handled by the axios instance in the `axiostoastapi.js` file, where a toast notification informs the user that their session has expired and they need to log in again. As a result, this function ensures that no additional error message is displayed for 401 errors.

Function Breakdown:
1. **401 Unauthorized Handling**:
   - The function checks if the error is a `401 Unauthorized`. Since 401 errors are handled globally by `axiostoastapi.js`, this function returns `null` to avoid showing duplicate error messages or notifications.

2. **Error Message Extraction**:
   - For other errors, the function tries to extract a meaningful message from the error response (`error.response.data.message`) or returns the entire response data if no specific message is found.

3. **Fallback for Unknown Errors**:
   - If there is no specific error response available, the function returns a generic error message, `"An unexpected error occurred. Please try again later."`, to cover unknown or unexpected issues.

*/

export const extractRestError = (error) => {
    if (error.response) {
        // Handle 401 Unauthorized specifically, do not return any message for it
        if (error.response.status === 401) {
            return null;  // Return null or any suitable value to indicate that 401 should be ignored
        }
        // If the response contains data, return the error message
        return error.response.data.message || error.response.data;
    }
    // Fallback to a default error message if no specific message is available
    return 'An unexpected error occurred. Please try again later.';
};
