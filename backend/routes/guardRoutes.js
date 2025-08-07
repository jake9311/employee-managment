const express = require('express');
const router = express.Router();
const guardController = require('../controllers/guardController');



router.post('/', guardController.createGuard);
router.get('/:userId', guardController.getGuardsByUser);
router.put('/:id', guardController.updateGuard);
router.delete('/:id', guardController.deleteGuard);
router.put('/:id/lateEntry', guardController.addLateEntry);
router.put('/:id/sickDay', guardController.addSickDay);
router.put('/:id/cancellation', guardController.addCancellation);
router.get('/lastReports/:ownerId', guardController.getLastReports);
router.get('/:reports/:ownerId/:guardId', guardController.getReportsByGuardId);

module.exports = router;