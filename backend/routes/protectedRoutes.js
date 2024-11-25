// routes/protectedRoute.js
const express = require('express');
const { checkPermission } = require('../middlewares/permissionMiddleware');
const router = express.Router();

router.get('/restricted', checkPermission('viewRestrictedData'), (req, res) => {
  res.json({ message: 'Access granted to restricted data' });
});

module.exports = router;
