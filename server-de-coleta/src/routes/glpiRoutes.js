
const express = require('express');
const router = express.Router();
const { 
    searchTickets
 } = require('../controllers/glpiController');

router.get('/search/:status/:entityName', searchTickets);

module.exports = router;