const express = require("express");
const adminRoutes = require("./routes/adminRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectedDB = require("./config/db");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json()).use(cors());
app.use("/public", express.static("public"));

connectedDB();

app.get("/", async (req, res) => {
  res.send("Hello, Server has connected! 👋");
});

// Routers
app.use(
  "/",
  (req, res, next) => {
    if (
      req.get("origin") === process.env.ORIGIN_RQT_ONE ||
      req.get("origin") === process.env.ORIGIN_RQT_TWO
    ) {
      next();
    } else {
      return res.send({
        message: "Request is not allowed",
      });
    }
  },
  adminRoutes,
);

// On gère les routes 404.
app.use(({ res }) => {
  const message = "Could not be connected!";
  res.status(404).json({ message });
});

app.listen(port, () =>
  console.log(
    `Node application has connected on this port http://localhost:${port}`,
  ),
);

module.exports = app;
