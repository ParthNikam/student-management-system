"use client"
import {useState, useEffect } from "react";
import {signin} from "@/api/userAuth";
import { useRouter } from "next/navigation";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    // we get a token from the backend, we need to store the token for future requests
    // we can use localStorage for this
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/home");
        }
    }, [router]);

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await signin(email, password);
        if (response.success) {
         localStorage.setItem("token", response.token);
         router.push("/home");
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <form className="flex flex-col gap-4 p-4 rounded-md" onSubmit={handleSignin}>
                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="p-2 border border-zinc-700 rounded-md" type="email"/>
                <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="p-2 border border-zinc-700 rounded-md" type="password"/>
                <button className="p-2 bg-zinc-600 text-white rounded-md" type="submit">Signin</button>
            </form>
        </div>
    )
}