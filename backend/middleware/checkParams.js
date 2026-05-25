export const checkAuthParams = (req, res, next) => {
    // Retrieve email and password from req.body
    const { email, password } = req.body ?? {};

    // Verify body
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    }
    next();
}

export const checkQueryParams = (validParams = []) => {
  return (req, res, next) => {
    const queryKeys = Object.keys(req.query);
    const invalidKeys = queryKeys.filter(key => !validParams.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: true, message: `Invalid query parameters: ${invalidKeys}. Query parameters are not permitted.` })
    }
    return next();
  }
}