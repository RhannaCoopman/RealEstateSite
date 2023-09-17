// isAdmin
const isAdmin = (req, res, next) => {
  console.log(req.headers);
  if (req.headers.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
};

const isManager = (req, res, next) => {
  console.log(req.headers);
  if (req.headers.role === "manager") {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
};

const isUser = (req, res, next) => {
  console.log(req.headers);
  if (req.headers.role === "user") {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
};


export {isUser, isManager, isAdmin};