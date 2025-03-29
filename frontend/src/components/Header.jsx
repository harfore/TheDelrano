import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../styles/Header.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';

const NavLink = ({ to, children }) => (
    <Link className="element" to={to}>
        <span>{children}</span>
    </Link>
);

function Header() {
    const navigate = useNavigate();
    const { isLoggedIn, userName, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(prevState => !prevState);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo"><i>The Delrano</i></Link>
            </div>

            <div className='header-center'>
                <nav className={`menu ${isMenuOpen ? 'open' : ''}`}>
                    <NavLink to="/popular">Popular</NavLink>

                    {isLoggedIn ? (
                        <>
                            <NavLink to="/profile">{userName}</NavLink>
                            <button className="element logout-btn" onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/join">Join</NavLink>
                        </>
                    )}

                    {/* <NavLink to="/users">Users</NavLink> */}
                </nav>
            </div>

            <div className='header-right'>
                <button className="hamburger" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
                {/* search input */}
                <div>
                    <input
                        name="artist-search"
                        className="artist-search"
                        placeholder="Search.."
                    />
                </div>
                <div className='search-icon'>
                    <Link to="/search"><FontAwesomeIcon icon={faSearch} /></Link>
                </div>
            </div>
        </header>
    );
};

export default Header;