const express = require('express');
const router = express.Router();
const guardController = require('../controllers/guardController');


//reports
router.get('/lastReports', guardController.getLastReports);
// router.get('/:reports/:guardId', guardController.getReportsByGuardId);
router.get('/:guardId/reports', guardController.getReportsByGuardId);

//Guards
router.post('/', guardController.createGuard);
router.get('/', guardController.getGuards);
router.put('/:id', guardController.updateGuard);
router.delete('/:id', guardController.deleteGuard);

//Guard actions
router.put('/:id/lateEntry', guardController.addLateEntry);
router.put('/:id/sickDay', guardController.addSickDay);
router.put('/:id/cancellation', guardController.addCancellation);
router.put('/:id/sickDay/:sickDayId/approval', guardController.updateSickDayApproval);


module.exports = router;