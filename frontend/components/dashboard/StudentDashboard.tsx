"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentDashboard({ user }: { user: any }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">Overall attendance</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">My Classes</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-dashed border-2 flex items-center justify-center p-6 text-zinc-500">
                        <div className="text-center">
                            <p>You haven't been added to any classes yet.</p>
                            <p className="text-xs mt-1">Ask your teacher to add you using your ID: <br/><span className="font-mono bg-zinc-100 select-all p-1 rounded text-black">{user._id}</span></p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
