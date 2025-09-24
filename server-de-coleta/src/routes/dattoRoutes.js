const express = require('express');
const {
    getAccountDevices,
    getSiteDevices,
    getDeviceData,
    getDeviceAudit,
    getDeviceSoftware,
    getDeviceAuditByMacAddress,
} = require('../controllers/dattoController');

const router = express.Router();

router.get('/devices', getAccountDevices);
router.get('/site/:siteUid/devices', getSiteDevices);
router.get('/device/:deviceUid', getDeviceData);
router.get('/audit/device/:deviceUid', getDeviceAudit);
router.get('/audit/device/:deviceUid/software', getDeviceSoftware);
router.get('/audit/device/macAddress/:macAddress', getDeviceAuditByMacAddress);

module.exports = router;