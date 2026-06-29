import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const queryToken = req.query.token;

  let token = null;

  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  if (!token && queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}