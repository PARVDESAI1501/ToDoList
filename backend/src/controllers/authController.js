import { getDb } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const db = getDb();
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await db.collection("users").findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      name: typeof name === "string" ? name.trim() : "",
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "User with this email already exists.",
      });
    }

    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const db = getDb();
    const normalizedEmail = normalizeEmail(email);

    const user = await db.collection("users").findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
    });

    // Print JWT token in backend terminal
    console.log("\n========================================");
    console.log("JWT TOKEN GENERATED SUCCESSFULLY");
    console.log("========================================");
    console.log(token);
    console.log("========================================\n");

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    // Return token in Postman/API response as well
    return res.status(200).json({
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  return res.status(200).json({
    message: "Logged out successfully.",
  });
};

const me = async (req, res, next) => {
  try {
    const db = getDb();

    const user = await db.collection("users").findOne(
      { _id: req.user.id },
      {
        projection: {
          password: 0,
        },
      },
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, me };
