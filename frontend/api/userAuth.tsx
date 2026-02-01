


// fetch signup url and get back token

const backendUrl = "http://localhost:5000/auth"

export const signup = async (name: string, email: string, password: string, role: string) => {
    const response = await fetch(`${backendUrl}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();
    return data;
}

export const signin = async (email: string, password: string) => {
    const response = await fetch(`${backendUrl}/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return data;
}

// signout should clear the token from the local storage
export const signout = async () => {
    localStorage.removeItem("token");
}


export const me = async (token?: string) => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem("token") : null);
    
    if (!authToken) return null;

    const response = await fetch(`${backendUrl}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        // Log error status
        console.error(`Fetch me failed with status: ${response.status}`);
        return null;
    }

    try {
        const data = await response.json();
        return data;
    } catch (error) {
        const text = await response.text();
        console.error("Failed to parse JSON from /me. Raw response:", text);
        throw error;
    }
}