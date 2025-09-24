// app.js
const express = require('express');
const app = express();

const acronisRoutes = require('./src/routes/acronisRoutes');
const dattoRoutes = require('./src/routes/dattoRoutes');
const glpiRoutes = require('./src/routes/glpiRoutes');
const { executarTodosTestesDeConexao } = require('./src/tests/conectionsTests');

// Middleware para analisar o corpo das requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conecta as rotas da API
app.use('/api/datto', dattoRoutes);
app.use('/api/acronis', acronisRoutes);
app.use('/api/glpi', glpiRoutes);

const init = async () => {

    // Executa todos os testes
    await executarTodosTestesDeConexao();

};
init();

    // Exporta o app para ser usado em server.js
    module.exports = app;


