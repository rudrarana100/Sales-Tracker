import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
  });
});

const PORT = 5000;

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});