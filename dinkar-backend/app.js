const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { protect } = require("./middleware/auth.middleware");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res
      .status(503)
      .json({ message: "Database connection failed. Please try again." });
  }
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/ingredients", require("./routes/ingredient.routes"));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/test/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

// Serve admin static files
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const isDev = process.env.NODE_ENV !== "production";

// Serve admin static files
const adminDistPath = path.join(__dirname, "../dinkar-admin/dist");
if (isDev) {
  app.use("/admin", createProxyMiddleware({
    target: "http://localhost:5173",
    changeOrigin: true,
    ws: true,
  }));
} else {
  app.use("/admin", express.static(adminDistPath));
  app.get("/admin/*splat", (req, res) => {
    res.sendFile(path.join(adminDistPath, "index.html"));
  });
}

// Serve frontend static files
const frontendDistPath = path.join(__dirname, "../ayurveda-frontend/dist");
if (isDev) {
  app.use("/", createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true,
    ws: true,
  }));
} else {
  app.use("/", express.static(frontendDistPath));
  app.get("/products", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  app.get("/products/:id", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  app.get("/ingredient/:name", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  app.get("/about", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  app.get("/ayurveda", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  app.get("/contact", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });

  // Catch-all for other frontend routes (must be after API routes)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path.startsWith("/admin")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

module.exports = app;