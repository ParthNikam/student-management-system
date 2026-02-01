const backendUrl = "http://localhost:5000";

// Helper for authorized fetch
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(`${backendUrl}${url}`, {
        ...options,
        headers,
    });

    // if (response.status === 401) {
    //     // Handle unauthorized (optional: redirect to login)
    // }

    return response.json();
};

export const getMyClasses = async () => {
    return await fetchWithAuth('/class/all', { method: 'GET' });
};

export const createClass = async (className: string) => {
    return await fetchWithAuth('/class', {
        method: 'POST',
        body: JSON.stringify({ className }),
    });
};

export const getClassDetails = async (classId: string) => {
    return await fetchWithAuth(`/class/${classId}`, { method: 'GET' });
};

export const addStudentToClass = async (classId: string, studentId: string) => {
    return await fetchWithAuth(`/class/${classId}/add-student`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
    });
};

export const startAttendance = async (classId: string) => {
    return await fetchWithAuth('/attendence/start', {
        method: 'POST',
        body: JSON.stringify({ classId }),
    });
};

export const getStudentsBySection = async (section: string) => {
    return await fetchWithAuth(`/students/${section}`, { method: 'GET' });
};
