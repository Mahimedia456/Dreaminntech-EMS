import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes.js";
import employeeRoutes from "./modules/employees/employees.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import leaveRoutes from "./modules/leaves/leaves.routes.js";
import holidayRoutes from "./modules/holidays/holidays.routes.js";
import attendanceAnalyticsRoutes from "./modules/attendanceAnalytics/attendanceAnalytics.routes.js";
import payrollRoutes from "./modules/payroll/payroll.routes.js";
import projectRoutes from "./modules/projects/projects.routes.js";
import taskRoutes from "./modules/tasks/tasks.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import financeExpenseRoutes from "./modules/finance-expenses/financeExpenses.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "DreamEMS API",
  });
});

app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    app: "DreamEMS API",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "DreamEMS API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/attendance-analytics", attendanceAnalyticsRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/finance-expenses", financeExpenseRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`DreamEMS API running on port ${port}`);
  });
}

export default app;