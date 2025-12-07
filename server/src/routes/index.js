const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxy.controller');
const scriptController = require('../controllers/script.controller');

router.get('/js/inspect-script.js', (req, res) => scriptController.getInspectScript(req, res));
router.get('/proxy', (req, res, next) => proxyController.getProxy(req, res, next));

router.post('/test-run', express.json(), (req, res) => {
    res.json({ success: true, message: "Test run capability not implemented yet." });
});

module.exports = router;
