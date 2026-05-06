import React from 'react';

/**
 * Intelligent Badge Rendering Component
 * Detects if the input is a URL string (CDN/Image) or a localized emoji/symbol.
 * @param {Object} props
 * @param {string} props.icon - The icon URL or emoji string
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.alt - Alt text for images
 */
const BadgeIcon = ({ icon, className = "", alt = "Achievement Badge" }) => {
    // Neural Pattern Matching: Check if the string starts with http/https or / (local path)
    const isUrl = icon && (icon.startsWith('http') || icon.startsWith('/'));

    if (isUrl) {
        return (
            <img 
                src={icon} 
                alt={alt} 
                className={`object-contain ${className}`}
                onError={(e) => {
                    // Failover Protocol: Revert to default emoji if asset synchronization fails
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-4xl">🏅</span>';
                }}
            />
        );
    }

    return (
        <span className={`${className}`}>
            {icon || '🏅'}
        </span>
    );
};

export default BadgeIcon;



