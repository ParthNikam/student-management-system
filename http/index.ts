import "dotenv/config";
import express from "express";
import {
  AddStudentSchema,
  createClassSchema,
  signinSchema,
  signupSchema,
} from "./types.ts";
import { ClassModel, UserModel } from "./models.ts";
import jwt from "jsonwebtoken";
import { authMiddleware, teacherRoleMiddleware } from "./middleware.ts";
import mongoose from "mongoose";




const app = express();

app.use(express.json());


app.get('/hello', (req, res) => {
  res.json({
    success: true,
    data: "hello friend."
  })
})

app.post("/auth/signup", async (req, res) => {
  const { success, data } = signupSchema.safeParse(req.body);
  console.log(data);
  if (!success) {
    res.status(400).json({
      success: false,
      error: "Invalid request schema",
    });
    return;
  }

  const user = await UserModel.findOne({ email: data.email });

  if (user) {
    res.status(400).json({
      success: false,
      error: "Email already exists",
    });
  }

  // hash the password later
  const userDb = await UserModel.create({
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
  });

  res.json({
    success: true,
    data: {
      _id: userDb._id,
      name: userDb.name,
      email: userDb.email,
      password: userDb.password,
    },
  });
});

app.post("/auth/signin", async (req, res) => {
  const { success, data } = signinSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({
      success: false,
      error: "Invalid request schema",
    });
    return;
  }

  const userDb = await UserModel.findOne({ email: data.email });

  if (!userDb || userDb.password != data.password) {
    res.status(400).json({
      success: false,
      error: "Invalid email or password",
    });
    return;
  }

  const token = jwt.sign(
    {
      role: userDb.role,
      userId: userDb._id,
    },
    process.env.JWT_PASSWORD!
  );

  res.json({
    success: true,
    data: { token },
  });
});

/*
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJJZCI6IjY5NzVjMWRkNzkwYzE1Njc0MzQ2YzMxZSIsImlhdCI6MTc2OTMzNjg4NH0.PgzozmBQxitubLuZOGZiusCYKdGog3MOPVAiNy-Fpf0"
*/ 

app.get("/auth/me", authMiddleware, async (req, res) => {
  const userDb = await UserModel.findOne({
    _id: req.userId,
  });

  if (!userDb) {
    res.status(400).json({ message: "controller should not reach here." });
    return;
  }

  res.json({
    success: true,
    data: {
      _id: userDb._id,
      name: userDb.name,
      email: userDb.email,
      role: userDb.role,
    },
  });
});

app.post("/class", authMiddleware, teacherRoleMiddleware, async (req, res) => {
  const { success, data } = createClassSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({
      success: false,
      error: "Invalid request schema",
    });
    return;
  }

  const classDb = await ClassModel.create({
    className: data.className,
    teacherId: new mongoose.Types.ObjectId(String(req.userId!)),
    studentIds: [],
  });

  res.json({
    success: true,
    data: {
      _id: classDb._id,
      className: classDb.className,
      "teacherId:": classDb.teacherId,
      studentIds: [],
    },
  });
});

app.post("/class/:id/add-student", authMiddleware, teacherRoleMiddleware, async (req, res) => {
  const { success, data } = AddStudentSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({
      success: false,
      error: "Invalid request schema",
    });
    return;
  }

  const studentId = data.studentId;
  const classDb = await ClassModel.findOne({ _id: req.params._id });

  if (!classDb) {
    res.status(400).json({
      success: false,
      error: "Class not found",
    });
    return;
  }

  if (classDb.teacherId !== req.userId) {
    res.status(403).json({
      success: false,
      error: "Forbidden, not class teacher",
    });
    return;
  }

  const userDb = UserModel.findOne({ _id: studentId });

  if (!userDb) {
    res.status(400).json({
      success: false,
      error: "Student not found",
    });
    return;
  }

  // concurrency issues might exist -> fix it later
  classDb.studentIds.push(new mongoose.Types.ObjectId(studentId));
  await classDb.save();
  res.json({
    success: true,
    data: {
      _id: classDb._id,
      className: classDb.className,
      teacherId: classDb.teacherId,
      studentIds: classDb.studentIds,
    },
  });
}
);

app.get("/class/:id", authMiddleware, teacherRoleMiddleware, async (req, res) => {
  const classDb = await ClassModel.findOne({
    _id: req.params.id,
  });

  if (!classDb) {
    res.status(400).json({ success: false, error: "Class doesn't exist" });
    return;
  }

  if (
    classDb.teacherId === req.userId ||
    classDb.studentIds.map((x) => x.toString()).includes(req.userId!)
  ) {
    const students = await UserModel.find({
      _id: classDb.studentIds,
    });

    res.json({
      success: true,
      data: {
        _id: classDb._id,
        className: classDb.className,
        teacherId: classDb.teacherId,
        studentIds: students.map((s) => ({
          _id: s._id,
          name: s.name,
          email: s.email,
        })),
      },
    });
  } else {
    res.status(403).json({ success: false, error: "Forbidden" });
  }
}
);

app.get("/students", authMiddleware, teacherRoleMiddleware, async (req, res) => {
  const users = await UserModel.find({ role: "student" });

  res.json({
    success: true,
    data: users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
    })),
  });
}
);


app.get('/class/:id/my-attendence', authMiddleware, async (req, res) => {
  const classId = req.params.id;
})

app.listen(3000);
