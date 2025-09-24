const express = require('express');
const router = express.Router();
const { 
    getFailedBackups,
    getTenants,
    getTenantInfo
 } = require('../controllers/acronisController');

// Rota para buscar os backups falhos
router.post('/end-game', getFailedBackups);

// Rota para listar todos os tenants
router.get('/tenants', getTenants);

// Nova rota para buscar informações de um único tenant pelo ID
router.get('/tenants/:tenantId', getTenantInfo);

module.exports = router;