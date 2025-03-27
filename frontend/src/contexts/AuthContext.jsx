import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// provides isLoggedIn, userName, isLoading status, and auth methods to child components
export const AuthContext = createContext();

// manages authentication state and provides auth functionality to the app via context
export const AuthProvider = ({ children }) => {
    // checks browser storage for existing auth data to maintain login state between page refreshes
    const initialToken = localStorage.getItem('authToken');
    const initialUser = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData'))
        : null;

    const [authState, setAuthState] = useState({
        isLoggedIn: !!initialToken, // convert token presence to boolean
        userName: initialUser?.username || initialUser?.email || '',
        isLoading: !!initialToken // set loading if no initial token (needs verification)
    });

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(config => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // handling 401 unauthorized responses by logging out
        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            error => {
                // Removed the logout() call here
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // verifies the current authentication token with the server
    // updates auth state based on verification result
    const verifyAuth = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            const response = await axios.get('/api/auth/verify');
            if (response.data?.user) {
                setAuthState({
                    isLoggedIn: true,
                    userName: response.data.user.username || response.data.user.email,
                    isLoading: false
                });
            } else {
                logout();
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userName');
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
        // } finally {
        //     // ensure loading state is cleared
        //     setAuthState(prev => ({ ...prev, isLoading: false }));
        // }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthState(prev => ({ ...prev, isLoading: true }));
            verifyAuth();
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // @param {string} token - authentication token received from server
    // @param {Object} user - user data object
    const login = (token, user) => {
        // ! persist auth data to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('userName', user.username || user.email);

        // update auth state
        setAuthState({
            isLoggedIn: true,
            userName: user.username || user.email,
            isLoading: false
        });
    };

    // clears authentication data and resets state
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userName');
        setAuthState({
            isLoggedIn: false,
            userName: '',
            isLoading: false
        });
    };

    // provide auth context to child components
    return (
        <AuthContext.Provider value={{
            isLoggedIn: authState.isLoggedIn,
            userName: authState.userName,
            isLoading: authState.isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};