const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/login', userController.login);

router.get('/allowlist', userController.getAllowlist);
router.post('/allowlist', userController.addToAllowlist);
router.delete('/allowlist/:id', userController.deleteFromAllowlist);

router.get('/list', userController.listUsers);

module.exports = router;












