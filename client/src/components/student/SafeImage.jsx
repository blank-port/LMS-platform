import React, { useState } from 'react';

/**
 * SafeImage Component
 * Handles broken image links gracefully with a modern fallback aesthetic.
 * Ideal for premium LMS course thumbnails.
 */
const SafeImage = ({ src, alt, className, fallback }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);

    const handleError = () => {
        if (!error) {
            setImgSrc(fallback || 'https://placehold.co/1280x720?text=Curriculum+Asset+Standby');
            setError(true);
        }
    };

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`${className} transition-opacity duration-1000 ${error ? 'opacity-40 grayscale' : 'opacity-100'}`} 
            onError={handleError}
        />
    );
};

export default SafeImage;
