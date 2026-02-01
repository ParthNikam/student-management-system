import "dotenv/config";
import express from "express";
import cors from "cors";
import expressWs from "express-ws";
import {
  AddStudentSchema,
  AttendenceStartSchema,
  createClassSchema,
  signinSchema,
  signupSchema,
} from "./types.ts";
import { AttendenceModel, ClassModel, UserModel } from "./models.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { authMiddleware, teacherRoleMiddleware } from "./middleware.ts";
import mongoose from "mongoose";



const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

expressWs(app);

let allWs: any[] = [];

let activeSession: { classId: string, startedAt: Date, attendence: Record<string, string>, teacherId: string } | null = null;


app.ws('/ws', (ws, req) => {
  try {
    const token = req.query.token;
    const { userId, role } = jwt.verify(token, process.env.JWT_PASSWORD!) as JwtPayload;

    const user = { userId, role };
    allWs.push(ws);

    ws.on('close', function () {
      allWs = allWs.filter((w) => w !== ws);
    })

    ws.on('message', async function (msg) {
      const message = msg.toString();
      const parsedData = JSON.parse(message);

      switch (parsedData.type) {
        case "ATTENDENCE_MARKED":
          if (ws.user.role === "teacher" && ws.user.userId === activeSession?.teacherId) {
            if (!activeSession) {
              ws.send(JSON.stringify({
                "event": "ERROR",
                "data": {
                  "message": "No Active Session"
                },
              }));
            } else {
              activeSession.attendence[parsedData.data.studentId] = parsedData.data.status;
              allWs.map(ws => ws.send(JSON.stringify({
                "event": "ATTENDENCE_MARKED",
                "data": {
                  "studentId": parsedData.data.studentId,
                  "status": parsedData.data.status,
                },
              })));
            }
          } else {
            ws.send(JSON.stringify({
              "event": "ERROR",
              "data": {
                "message": "You are not a teacher"
              },
            }));
          }
          break;

        case "TODAY_SUMMARY":
          if (ws.user.role === "teacher" && ws.user.userId === activeSession?.teacherId) {
            const classDb = await ClassModel.findOne({
              _id: activeSession?.classId,
            });

            const total = classDb?.studentIds.length || 0;
            const present = Object.values(activeSession?.attendence || {}).filter((att) => att === "present").length;
            const absent = total - present;

            if (!activeSession) {
              ws.send(JSON.stringify({
                "event": "ERROR",
                "data": {
                  "message": "No Active Session"
                },
              }));
            } else {
              ws.send(JSON.stringify({
                "event": "TODAY_SUMMARY",
                "data": {
                  total,
                  absent,
                  present,
                },
              }));
            }
          } else {
            ws.send(JSON.stringify({
              "event": "ERROR",
              "data": {
                "message": "You are not a teacher"
              },
            }));
          }
          break;

        case "MY_ATTENDENCE":
          if (ws.user.role === "student") {
            const status = activeSession?.attendence[ws.user.userId];
            if (status) {
              ws.send(JSON.stringify({
                "event": "MY_ATTENDENCE",
                "data": {
                  status: status,
                },
              }));
            } else {
              ws.send(JSON.stringify({
                "event": "MY_ATTENDENCE",
                "data": {
                  status: "not yet updated",
                },
              }));
            }

          }
          break;

        case "DONE":
          if (ws.user.role === "teacher" && ws.user.userId === activeSession?.teacherId) {
            const classDb = await ClassModel.findOne({
              _id: activeSession?.classId,
            });

            const total = classDb?.studentIds.length || 0;
            const present = Object.values(activeSession?.attendence || {}).filter((att) => att === "present").length;
            const absent = total - present;


          } else {
            ws.send(JSON.stringify({
              "event": "ERROR",
              "data": {
                "message": "you are not a teacher",
              },
            }));
          }
          break;

        default:
          console.log("message not found");
          break;
      }
      console.log(msg);
    });
  } catch (e) {
    ws.send(JSON.stringify({
      "event": "ERROR",
      "data": {
        "message": "Invalid token"
      },
    }));
    ws.close();
  }
})




app.get('/hello', (req, res) => {
  res.status(201).json({
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

  const token = jwt.sign(
    {
      role: userDb.role,
      userId: userDb._id,
    },
    process.env.JWT_PASSWORD!
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        _id: userDb._id,
        name: userDb.name,
        email: userDb.email,
        role: userDb.role,
      },
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

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        _id: userDb._id,
        name: userDb.name,
        email: userDb.email,
        role: userDb.role,
      }
    },
  });
});


app.get("/auth/me", authMiddleware, async (req, res) => {
  const userDb = await UserModel.findOne({
    _id: req.userId,
  });

  if (!userDb) {
    res.status(400).json({ message: "controller should not reach here." });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      _id: userDb._id,
      name: userDb.name,
      email: userDb.email,
      role: userDb.role,
    },
  });
});

app.get("/class/all", authMiddleware, teacherRoleMiddleware, async (req, res) => {
  const classes = await ClassModel.find({
    teacherId: req.userId
  });

  res.status(200).json({
    success: true,
    data: classes.map((c: any) => ({
      _id: c._id,
      className: c.className,
      teacherId: c.teacherId,
      studentIds: c.studentIds,
      // @ts-ignore
      studentCount: c.studentIds.length
    }))
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

  res.status(201).json({
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
  res.status(201).json({
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

    res.status(201).json({
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

app.get("/students/:section", authMiddleware, teacherRoleMiddleware, async (req, res) => {

  const users = await UserModel.find({ section: req.params.section });

  res.status(201).json({
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
  const userId = req.userId;

  const attendence = await AttendenceModel.findOne({ classId, studentId: userId })

  if (attendence) {
    res.status(201).json({
      success: true,
      data: {
        classId: classId,
        status: "present",
      }
    })
  } else {
    res.status(201).json({
      success: true,
      data: {
        classId: classId,
        status: "absent",
      }
    })
  }
})


app.post('/attendence/start', authMiddleware, teacherRoleMiddleware, async (req, res) => {
  const { success, data } = AttendenceStartSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({
      success: false,
      error: "Invalid request schema",
    });
    return;
  }

  const classDb = await ClassModel.findOne({
    _id: data.classId
  })

  if (!classDb || !classDb.teacherId || classDb.teacherId.toString() !== req.userId) {
    res.status(401).json({
      success: false,
      error: "Class doesn't exist or you are not the teacher",
    });
    return;
  }

  activeSession = {
    classId: classDb._id.toString(),
    startedAt: new Date(),
    attendence: {},
    teacherId: classDb.teacherId!.toString(),
  }

  res.status(201).json({
    success: true,
    data: {
      classId: classDb._id.toString(),
      startedAt: activeSession.startedAt,
      attendence: activeSession.attendence,
    },
  })
})





app.listen(5000);
