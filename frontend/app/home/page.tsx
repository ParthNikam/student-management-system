"use client"
import { useUser } from "@/context/userContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface ClassItem {
    _id: string;
    className: string;
    studentCount: number;
}

import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function Home() {
    const { user, logout, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/signin");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto border-b pb-4 border-zinc-200">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Welcome back, {user?.name} <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full uppercase ml-2">{user?.role}</span></p>
                </div>
                <Button variant="outline" onClick={logout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                {user.role === 'teacher' ? (
                    <TeacherDashboard user={user} />
                ) : (
                    <StudentDashboard user={user} />
                )}
            </main>
        </div>
    );
}