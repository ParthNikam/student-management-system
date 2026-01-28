

export default async function Me() {
    const user = {name: "Parth", email: "parth@gmail.com", role: "student"};

    return (
        <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
            <div className="flex flex-col gap-4 shadow-md rounded-lg mt-10">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">User Profile</h1>
                <div className="space-y-2">
                    <p className="text-zinc-700 font-semibold dark:text-zinc-300">
                        <span className="font-semibold">Name:</span> {user.name}
                    </p>
                    <p className="text-zinc-700 font-semibold dark:text-zinc-300">
                        <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p className="text-zinc-700 font-semibold dark:text-zinc-300">
                        <span className="font-semibold">Role:</span> {user.role}
                    </p>
                </div>
            </div>
        </div>
    );
}