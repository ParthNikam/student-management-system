"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { me } from '@/api/userAuth';
import { useRouter } from 'next/navigation';

export interface User {
    id?: string;
    name: string;
    email: string;
    section: string;
    role: "teacher" | "student";
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    login: (token: string) => void;
    fetchUser: () => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, initialUser }: { children: React.ReactNode, initialUser?: User | null }) => {
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        setLoading(true);
        try {
            // Check cookie first
            let token = getCookie("token");

            // If no cookie, check localStorage and sync to cookie if present (Migration)
            if (!token) {
                const localToken = localStorage.getItem("token");
                if (localToken) {
                    token = localToken;
                    setCookie("token", localToken, 7);
                }
            }

            if (token) {
                const data = await me(token); // actual getting the user data from backend
                if (data) {
                    setUser(data);
                    // Ensure localStorage is synced (optional but good for consistency)
                    localStorage.setItem("token", token);
                } else {
                    deleteCookie("token");
                    localStorage.removeItem("token");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (token: string) => {
        setCookie("token", token, 7);
        localStorage.setItem("token", token);
        fetchUser();
    }

    const logout = () => {
        deleteCookie("token");
        localStorage.removeItem("token");
        setUser(null);
        router.push("/signin");
    };

    return (
        <UserContext.Provider value={{ user, loading, setUser, login, fetchUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Helper functions for cookies
function setCookie(name: string, value: string, days: number) {
    if (typeof document === 'undefined') return;
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
