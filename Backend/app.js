const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const conn = require("./Utils/database");
const session = require("express-session");
const MYSQLStore = require("express-mysql-session")(session);
const store = new MYSQLStore({}, conn);

const authRouter = require("./Routes/authRouter");
const collectorRouter = require("./Routes/collectorRouter");
const userRouter = require("./Routes/userRouter");
const adminRouter = require("./Routes/adminRouter");
require("dotenv").config();
const cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    key: "session_cookie_name",
    secret: "session_cookie_secret",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: null,
      secure: false,
    },
  }),
);

app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", collectorRouter);
app.use("/api", adminRouter);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/404.html"));
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`http://localhost:${port}/home.html`);
});
