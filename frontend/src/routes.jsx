import React from 'react';
import Join from './pages/Auth/Join';
import Login from './pages/Auth/Login';
import Profile from './pages/Profile';
// import Renovation from './components/Renovation';
// import Popular from './pages/Popular';

const routes = [
    // { path: '/', element: <Login /> },
    { path: '/join', element: <Join /> },
    { path: '/login', element: <Login /> },
    { path: '/profile', element: <Profile /> }
    // { path: '/popular', element: <Popular /> },
];

export default routes;