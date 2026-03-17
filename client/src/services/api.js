const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchData = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        const data = await response.json();
        return { ok: response.ok, data, status: response.status };
    } catch (error) {
        console.error(`API Fetch Error (${endpoint}):`, error);
        return { ok: false, data: { message: 'Network error or server unavailable' } };
    }
};

export default API_URL;
