import { z } from "zod";


export const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["teacher", "student"])
})


export const signinSchema = z.object({
  email: z.email(),
  password: z.string()
})


export const createClassSchema = z.object({
  className: z.string()
})


export const AddStudentSchema = z.object({
  studentId: z.string()
})
