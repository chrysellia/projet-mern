import React from 'react';
import '../styles/themes.css';

interface UserAvatarProps {
    username: string;
    email?: string;
    role?: 'admin' | 'user';
    size?: 'small' | 'medium' | 'large';
    imageUrl?: string;
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
    username, 
    email, 
    role = 'user', 
    size = 'medium',
    imageUrl,
    className = ''
}) => {
    const getSize = () => {
        switch (size) {
            case 'small': return { width: '32px', height: '32px', fontSize: '14px' };
            case 'large': return { width: '80px', height: '80px', fontSize: '32px' };
            default: return { width: '48px', height: '48px', fontSize: '18px' };
        }
    };

    const getGradient = () => {
        switch (role) {
            case 'admin':
                return 'linear-gradient(135deg, #6f42c1 0%, #9c27b0 50%, #e91e63 100%)';
            case 'user':
                return 'linear-gradient(135deg, #17a2b8 0%, #20c997 50%, #00bcd4 100%)';
            default:
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    };

    const getInitials = () => {
        if (username) {
            return username.charAt(0).toUpperCase();
        }
        if (email) {
            return email.charAt(0).toUpperCase();
        }
        return '?';
    };

    const avatarSize = getSize();

    return (
        <div 
            className={`card-avatar ${className}`}
            style={{
                width: avatarSize.width,
                height: avatarSize.height,
                fontSize: avatarSize.fontSize,
                background: imageUrl ? 'none' : getGradient(),
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: imageUrl ? '2px solid var(--border-color)' : 'none'
            }}
        >
            {!imageUrl && getInitials()}
        </div>
    );
};

export default UserAvatar;
