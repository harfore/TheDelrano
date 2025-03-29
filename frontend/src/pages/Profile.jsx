import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { NotFound } from '../components/NotFound';
import '../styles/JoinLogin.css';

const Profile = () => {
    const { isLoggedIn, userName } = useContext(AuthContext);

    return (
        <div className='page'>
            {isLoggedIn ? (
                <h2>{userName}</h2>
            ) : (
                <NotFound />
            )
            }
        </div>
    )
}

export default Profile;