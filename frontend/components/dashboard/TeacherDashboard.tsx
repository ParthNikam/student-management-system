"use client"
import { useEffect, useState } from "react";
import { getMyClasses, createClass, startAttendance, addStudentToClass, getClassDetails } from "@/api/teacher";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Calendar, ArrowRight, UserPlus, Eye } from "lucide-react";

interface ClassItem {
    _id: string;
    className: string;
    studentCount: number;
}

interface Student {
    _id: string;
    name: string;
    email: string;
}

export default function TeacherDashboard({ user }: { user: any }) {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [newClassName, setNewClassName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    // Class Details / Add Student State
    const [viewingClass, setViewingClass] = useState<ClassItem | null>(null);
    const [classStudents, setClassStudents] = useState<Student[]>([]);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [studentIdToAdd, setStudentIdToAdd] = useState("");

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const res = await getMyClasses();
            if (res?.success) {
                setClasses(res.data);
            }
        } catch (error) {
            console.error("Failed to load classes", error);
        }
    };

    const handleCreateClass = async () => {
        if (!newClassName.trim()) return;
        try {
            await createClass(newClassName);
            setNewClassName("");
            setIsCreating(false);
            loadClasses(); 
        } catch (error) {
            console.error("Failed to create class", error);
        }
    };

    const handleStartAttendance = async (classId: string) => {
        try {
            const res = await startAttendance(classId);
            if (res?.success) {
                alert(`Attendance session started for class ID: ${classId}. Session ID: ${res.data.classId}`);
            }
        } catch (error) {
            console.error("Failed to start attendance", error);
        }
    };

    const openClassDetails = async (cls: ClassItem) => {
        setViewingClass(cls);
        setIsDetailsOpen(true);
        try {
            const res = await getClassDetails(cls._id);
            if (res?.success) {
               setClassStudents(res.data.studentIds); // Endpoint returns detailed students in studentIds
            }
        } catch (e) {
            console.error("Failed to fetch details", e);
        }
    }

    const handleAddStudent = async () => {
        if (!studentIdToAdd.trim() || !viewingClass) return;
        try {
            await addStudentToClass(viewingClass._id, studentIdToAdd);
            setStudentIdToAdd("");
            // Refresh details
            const res = await getClassDetails(viewingClass._id);
            if (res?.success) {
               setClassStudents(res.data.studentIds);
            }
            loadClasses(); // Update count in list
            alert("Student added successfully");
        } catch (error) {
            console.error("Failed to add student", error);
            alert("Failed to add student. Check ID.");
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             {/* Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classes.length}</div>
                    </CardContent>
                </Card>
                    {/* Placeholder for other stats */}
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground text-zinc-500">Coming soon</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Your Classes</h2>
                <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Class
                </Button>
            </div>

            {/* Create Class Form */}
            {isCreating && (
                <Card className="max-w-md animate-in fade-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>Create New Class</CardTitle>
                        <CardDescription>Enter the name of the new class.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            placeholder="Class Name (e.g., CS101)" 
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button onClick={handleCreateClass}>Create</Button>
                    </CardFooter>
                </Card>
            )}

            {/* Classes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500 border rounded-md border-dashed border-zinc-300">
                    No classes found. Create one to get started.
                </div>
            ) : (
                classes.map((cls) => (
                    <Card key={cls._id} className="hover:shadow-md transition-shadow group">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {cls.className}
                            </CardTitle>
                            <CardDescription>{cls.studentCount} Students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-zinc-500 mb-4">
                                Class ID: <span className="font-mono text-zinc-700 bg-zinc-100 px-1 rounded select-all">{cls._id}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="w-full gap-2" onClick={() => openClassDetails(cls)}>
                                <Eye className="h-4 w-4" /> View
                            </Button>
                            <Button className="w-full gap-2" onClick={() => handleStartAttendance(cls._id)}>
                                <Calendar className="h-4 w-4" /> Start
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            )}
            </div>

            {/* Class Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogHeader>
                    <DialogTitle>{viewingClass?.className}</DialogTitle>
                    <DialogDescription>Manage students and view details.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 my-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Add Student by ID" 
                            value={studentIdToAdd}
                            onChange={(e) => setStudentIdToAdd(e.target.value)}
                        />
                        <Button onClick={handleAddStudent}>Add</Button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Students ({classStudents.length})</h4>
                        <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                            {classStudents.length === 0 ? (
                                <div className="p-4 text-center text-sm text-zinc-500">No students enrolled yet.</div>
                            ) : (
                                classStudents.map((student) => (
                                    <div key={student._id} className="p-3 flex justify-between items-center text-sm">
                                        <div>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-zinc-500 text-xs">{student.email}</div>
                                        </div>
                                         {/* <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button> */}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
