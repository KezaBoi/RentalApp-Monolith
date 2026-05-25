import jwt from 'jsonwebtoken';

const authenticator = (optional) => {
  return (req, res, next) => {
    if (!("authorization" in req.headers)) {
      if (optional) return next();
      return res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
    }

    if (!req.headers.authorization.match(/^Bearer /)) {
      return res.status(401).json({ error: true, message: "Authorization header is malformed" });
    }

    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
      req.decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        res.status(401).json({ error: true, message: "JWT token has expired" });
      } else {
        res.status(401).json({ error: true, message: "Invalid JWT token" });
      }
      return;
    }
    next();
  };
}

export default authenticator