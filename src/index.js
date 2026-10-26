const express = require("express");
const userRoutes = require("./routes/users.routes");
const postRoutes = require("./routes/posts.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});