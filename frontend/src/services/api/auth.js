// provides functions for managing session tokens including:
//  - retrieving the current token
//  - refreshing expired tokens
//  - handling token refresh failures with automatic logout


// retrieves the current session token from localStorage
// @returns {string|null} The current JWT token or null if not present
export const getSessionToken = () => {
    return localStorage.getItem('token') || null;
};

/**
 * attempts to refresh the expired authentication token
 * @returns {Promise<string|null>} The new token if refresh succeeds, null otherwise
 * @throws Will redirect to login page and clear token on failure
 */
export const refreshToken = async () => {
    try {
        const response = await axios.post('/auth/refresh');
        const newToken = response.data.token;

        // store the new token in localStorage
        localStorage.setItem('token', newToken);
        return newToken;

    } catch (error) {
        // clear invalid token and redirect to login on failure
        localStorage.removeItem('token');
        window.location.href = '/login';
        return null;
    }
};