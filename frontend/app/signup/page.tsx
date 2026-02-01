"use client"
import { useState } from "react";
import { signup } from "@/api/userAuth";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const role = "student"; // Defaulting to student for now. Teacher toggle could be added.
    const router = useRouter();
    const { login } = useUser();
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await signup(name, email, password, role);
            if (response.success && response.data) {
                const { token, user } = response.data;
                if (token) {
                    let userData = user;
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
                 setError(response.error || "Signup failed");
            }
        } catch (err) {
            setError("Something went wrong");
            console.error("Signup error:", err);
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>Enter your information to create an account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                             {error && <div className="text-sm text-red-500">{error}</div>}
                            <Input 
                                id="name" 
                                placeholder="Full Name" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
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
                        {/* Hidden Role Input or Toggle could go here */}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit">Create account</Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/signin" className="underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}