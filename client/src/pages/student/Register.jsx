import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to combined Auth UI in register mode
        navigate('/login?mode=register', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
};

export default Register;
