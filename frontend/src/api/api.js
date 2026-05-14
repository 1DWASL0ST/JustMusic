const getAccessToken = () => localStorage.getItem('accessToken');

export const authFetch = async (url, options = {}) => {
    const token = getAccessToken();

    const headers = {
        ...options.headers
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            const refreshResponse = await fetch('/api/User/RefreshToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: getAccessToken(),
                    refreshToken: refreshToken
                })
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                headers['Authorization'] = `Bearer ${data.accessToken}`;
                return fetch(url, { ...options, headers });
            }
        }

        window.location.href = '/login';
    }

    return response;
};
