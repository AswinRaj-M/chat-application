const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, "");

export const fetchData = async (endpoint, options = {}) => {
    const fullUrl = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        const data = await response.json();
        return { ok: response.ok, data, status: response.status };
    } catch (error) {
        console.error(`!!! API Fetch Failure !!!`);
        console.error(`Endpoint: ${endpoint}`);
        console.error(`Full URL: ${fullUrl}`);
        console.error(`Error Details:`, error);
        return { ok: false, data: { message: 'Network error or server unavailable' } };
    }
};

export default API_URL;
