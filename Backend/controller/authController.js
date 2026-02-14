const conn = require("../Utils/database");
const bcrypt = require("bcrypt");
const User = require("../Model/Home");
const Collector = require("../Model/Collector");
const Waste = require("../Model/plastic");
const { validationResult, check } = require("express-validator");

exports.postlogin = [
  check("email").isEmail().withMessage("Enter a valid email"),
  check("password").notEmpty().withMessage("Password is required"),

  async (req, res, next) => {
    const errorsResult = validationResult(req);
    if (!errorsResult.isEmpty()) {
      return res.json({
        errors: errorsResult.array(),
        errorMessage: "Validation errors occurred",
        oldInput: { email: req.body.email },
      });
    }

    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({
        errors: [],
        errorMessage: "Email, password, and user type are required",
        oldInput: { email },
      });
    }

    try {
      let userData;

      //  Fetch user by type
      if (userType === "user") {
        userData = await new Promise((resolve, reject) => {
          User.getUser(email, (err, user) => {
            if (err)
              return reject(new Error("Database error while fetching user"));
            resolve(user);
          });
        });
      } else if (userType === "collector") {
        userData = await new Promise((resolve, reject) => {
          Collector.getCollector(email, (err, collector) => {
            if (err)
              return reject(
                new Error("Database error while fetching collector"),
              );
            resolve(collector);
          });
        });
      } else if (userType === "admin") {
        userData = await new Promise((resolve, reject) => {
          conn.query(
            "SELECT * FROM admin WHERE email = ?",
            [email],
            (err, result) => {
              if (err)
                return reject(new Error("Database error while fetching admin"));
              resolve(result[0]);
            },
          );
        });
      } else {
        return res.status(400).json({
          errors: [],
          errorMessage:
            "Invalid user type. Please select user, collector, or admin",
          oldInput: { email },
        });
      }

      //  If user not found
      if (!userData) {
        return res.json({
          errors: [],
          errorMessage: "Invalid email, password, or user type",
          oldInput: { email },
        });
      }

      const match = await bcrypt.compare(password, userData.password);
      if (!match) {
        // Password mismatch
        return res.json({
          errors: [],
          errorMessage: "Invalid email, password, or user type",
          oldInput: { email },
        });
      }

      req.session.user = { id: userData.id, userType: userData.userType };
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res
            .status(500)
            .json({ success: false, errorMessage: "Error saving session" });
        }

        if (userType == "user") {
          return res.json({ success: true, redirectTo: "/userDashboard.html" });
        }
        if (userType == "collector") {
          return res.json({
            success: true,
            redirectTo: "/collectorDashboard.html",
          });
        }
        if (userType == "admin") {
          return res.json({
            success: true,
            redirectTo: "/adminDashboard.html",
          });
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        errorMessage: error.message || "Internal server error",
      });
    }
  },
];

exports.postsignup = [
  check("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  check("email").isEmail().withMessage("Please enter a valid email address"),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain a special character")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter"),

  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

  check("userType")
    .notEmpty()
    .withMessage("User type is required")
    .isIn(["user", "collector"])
    .withMessage("Invalid user type"),

  check("phone_no")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  check("city")
    .if((value, { req }) => req.body.userType === "collector")
    .notEmpty()
    .withMessage("City is required for collector"),

  check("state")
    .if((value, { req }) => req.body.userType === "collector")
    .notEmpty()
    .withMessage("State is required for collector"),

  check("pincode")
    .if((value, { req }) => req.body.userType === "collector")
    .isPostalCode("IN")
    .withMessage("Invalid pincode"),

  check("availability")
    .if((value, { req }) => req.body.userType === "collector")
    .notEmpty()
    .withMessage("Availability is required"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.mapped(),
      });
    }

    const {
      name,
      email,
      password,
      userType,
      address,
      phone_no,
      city,
      state,
      pincode,
      latitude,
      longitude,
      availability,
    } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      if (userType === "user") {
        const newUser = new User(
          name,
          email,
          hashedPassword,
          userType,
          address,
          phone_no,
        );
        await newUser.save();
      } else {
        const newCollector = new Collector(
          name,
          email,
          hashedPassword,
          userType,
          address,
          phone_no,
          city,
          state,
          pincode,
          latitude,
          longitude,
          availability,
        );
        await newCollector.save();
      }

      res.json({
        success: true,
        message: "Registration successful",
        redirectTo: "/login.html",
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.logout = (req, resp, next) => {
  try {
    if (!req.session) {
      return resp
        .status(400)
        .json({ success: false, message: "No active session" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return resp
          .status(500)
          .json({ success: false, message: "Error logging out" });
      }

      resp.clearCookie("session_cookie_name");
      resp.json({
        success: true,
        message: "Logged out successfully",
        redirectTo: "login.html",
      });
    });
  } catch (error) {
    console.error("Error in logout:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};
