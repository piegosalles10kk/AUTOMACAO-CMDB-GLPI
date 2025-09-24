const express = require('express');
const router = express.Router();
const { handleInventoryUpdate, testarConexaoGLPI } = require('../controllers/glpiController');

// Rota teste
router.get('/teste', testarConexaoGLPI);

// Define a rota POST para a criação do inventário
router.post('/inventario', handleInventoryUpdate);

module.exports = router;