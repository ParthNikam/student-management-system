"use client"
import { useState, useEffect } from "react";
import { signin } from "@/api/userAuth";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { login } = useUser();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/home");
        }
    }, [router]);

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await signin(email, password);
            if (response.success && response.data) {
                const { token, user } = response.data;
                if (token) {
                    let userData = user;
                    // Fallback detailed fetch if missing
                    if (!userData) {
                       const { me } = await import("@/api/userAuth");
                       userData = await me(token);
                    }

                    if (userData) {
                        login(userData, token);
                        router.push("/home");
                    }
                } else {
                     setError("No token received from server");
                }
            } else {
                 setError(response.error || "Invalid email or password");
            }
        } catch (err) {
            setError("Something went wrong");
            console.error("Signin error:", err);
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignin}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                             {error && <div className="text-sm text-red-500">{error}</div>}
                             {/* Label could be added here later */}
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="m@example.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="Password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit">Sign in</Button>
                        <div className="text-center text-sm">
                            Don't have an account?{" "}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}