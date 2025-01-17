const checkUserAccess = (req, res, next) => {
  // If user is superadmin or officer, allow access to all data
  if (req.user.role === 'superadmin' || req.user.role === 'officer') {
    return next();
  }

  // If user is driver, only allow access to their own data
  if (req.user.role === 'driver') {
    // Check if the requested resource belongs to the user
    if (req.params.id && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
  }

  next();
};

module.exports = checkUserAccess;
