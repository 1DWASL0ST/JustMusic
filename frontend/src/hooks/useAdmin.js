// hooks/useAdmin.js
import { useState, useEffect } from 'react';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

            const response = await fetch(`/api/Admin/isAdmin/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setIsAdmin(data.isAdmin);
        } catch (error) {
            console.error('Ошибка проверки админа:', error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    return { isAdmin, loading };
}