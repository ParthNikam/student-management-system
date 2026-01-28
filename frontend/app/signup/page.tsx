"use client"
import {useState, useEffect } from "react";
import {signup} from "@/api/userAuth";
import { useRouter } from "next/navigation";

import { useUser } from "@/context/userContext";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const role = "student";
    const router = useRouter();
    const { login } = useUser();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await signup(name, email, password, role);
        if (response.success) {
            if (response.token) {
                login(response.token);
            }
            router.push("/home");
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <form className="flex flex-col gap-4 p-4 rounded-md" onSubmit={handleSignup}>
                <input placeholder="Name" onChange={(e) => setName(e.target.value)} className="p-2 border border-zinc-700 rounded-md" type="text"/>
                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="p-2 border border-zinc-700 rounded-md" type="email"/>
                <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="p-2 border border-zinc-700 rounded-md" type="password"/>
                <button className="p-2 bg-zinc-600 text-white rounded-md" type="submit">Signup</button>
            </form>
        </div>
    )
}