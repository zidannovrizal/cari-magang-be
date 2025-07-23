const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware untuk verifikasi JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied",
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Invalid token",
      message: "Token is not valid",
    });
  }
};

// Middleware untuk verifikasi role user
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Access denied",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Middleware untuk verifikasi kepemilikan resource
const authorizeOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Access denied",
          message: "Authentication required",
        });
      }

      const resourceId = req.params.id;
      let resource;

      switch (resourceType) {
        case "internship":
          const Internship = require("../models/Internship");
          resource = await Internship.getById(resourceId);
          if (
            resource &&
            req.user.role === "company" &&
            resource.company_id !== req.user.company_id
          ) {
            return res.status(403).json({
              success: false,
              error: "Access denied",
              message: "You can only access your own internships",
            });
          }
          break;

        case "application":
          const Application = require("../models/Application");
          resource = await Application.getById(resourceId);
          if (
            resource &&
            req.user.role === "user" &&
            resource.user_id !== req.user.id
          ) {
            return res.status(403).json({
              success: false,
              error: "Access denied",
              message: "You can only access your own applications",
            });
          }
          break;

        case "user":
          resource = await User.getById(resourceId);
          if (resource && req.user.id !== parseInt(resourceId)) {
            return res.status(403).json({
              success: false,
              error: "Access denied",
              message: "You can only access your own profile",
            });
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "Invalid resource type",
            message: "Resource type not supported",
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
          message: "The requested resource does not exist",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({
        success: false,
        error: "Authorization failed",
        message: error.message,
      });
    }
  };
};

// Middleware untuk optional authentication (tidak memblokir jika tidak ada token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, tapi tidak memblokir request
      console.log("Invalid token in optional auth:", error.message);
    }
  }

  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await User.verifyPassword(password, hashedPassword);
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeOwnership,
  optionalAuth,
  generateToken,
  verifyPassword,
};
