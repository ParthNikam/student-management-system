import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-5xl flex-col items-center gap-y-8 px-8 py-24 sm:items-start text-center sm:text-left">
        {/* Hero Section */}
        <div className="flex flex-col gap-4">
             <div className="inline-block rounded-lg bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Student Management System v0.1
              </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-zinc-900 dark:text-white">
                Manage your classroom <br className="hidden sm:inline" />
                with confidence.
            </h1>
            <p className="max-w-[700px] text-lg text-zinc-600 dark:text-zinc-400">
                An open-source platform for teachers and students to track attendance, manage classes, and stay organized.
            </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
            </Link>
            <Link href="/signin" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Login</Button>
            </Link>
        </div>
      </main>
    </div>
  );
}
