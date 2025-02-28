import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, LogOut, ChevronUp } from 'lucide-react';
import '../styles/profilemenu.css';
import { handleLogout } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import the useAuth hook

const ProfileMenu = ({ isAdmin }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { isAuthenticated, userId, logout } = useAuth(); // Use the useAuth hook
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || 'user@example.com'); // Get the email from localStorage
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);  
        };

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        console.log('Navigating to profile...');
    };

    const handleAdminPanelClick = () => {
        navigate('/adminpanel');
    };

    const renderMobileMenu = () => (
        <div className="profile-menu-container mobile" ref={menuRef}>
            <button
                className="profile-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open profile menu"
            >
                <div className="button-content">
                    <User size={24} />
                    <span className="profile-text">Profile</span>
                </div>
            </button>

            {isOpen && (
                <div className="profile-dropdown mobile">
                    <div className="user-info">
                        <span className="user-email">{userEmail}</span>
                    </div>

                    <div className="menu-divider" />

                    <div className="menu-item" onClick={handleProfileClick}>
                        <User size={18} />
                        <span>Profile</span>
                    </div>

                    {isAdmin && (
                        <div className="menu-item admin" onClick={handleAdminPanelClick}>
                            <Settings size={18} />
                            <span>Admin Panel</span>
                        </div>
                    )}

                    <div className="menu-divider" />

                    <div className="menu-item logout" onClick={logout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderDesktopMenu = () => (
        <div className="profile-menu-container" ref={menuRef}>
            <button
                className="profile-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open profile menu"
            >
                <div className="button-content">
                    <User className="user" size={24} />
                    <span className="profile-text">Profile</span>
                    <ChevronUp
                        size={20}
                        className={`arrow-icon ${isOpen ? 'open' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="profile-dropdown">
                    <div className="user-info">
                        <span className="user-email">{userEmail}</span>
                    </div>

                    <div className="menu-divider" />

                    <div className="menu-item" onClick={handleProfileClick}>
                        <User size={18} />
                        <span>Profile</span>
                    </div>

                    {isAdmin && (
                        <div className="menu-item admin" onClick={handleAdminPanelClick}>
                            <Settings size={18} />
                            <span>Admin Panel</span>
                        </div>
                    )}

                    <div className="menu-divider" />

                    <div className="menu-item logout" onClick={logout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </div>
                </div>
            )}
        </div>
    );

    return isMobile ? renderMobileMenu() : renderDesktopMenu();
};

export default ProfileMenu;