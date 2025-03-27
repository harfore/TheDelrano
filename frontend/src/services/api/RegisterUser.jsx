import { authApi } from "./api.js";

const registerUser = async (userData) => {
    try {
        const response = await authApi.post('/register', {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            country: userData.country
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Registration failed');
        }
        throw new Error('Network error - please check your connection');
    }
};

export default registerUser;