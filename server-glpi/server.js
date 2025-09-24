const express = require('express');
const glpiRoutes = require('./glpiRoutes/glpiRoutes');
const { testarConexaoGLPI } = require('./testes/glpiAuthTeste');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware para analisar requisições JSON
app.use(express.json());

// Rota principal da API
app.use('/api/glpi', glpiRoutes);

// Inicia o servidor e, em seguida, executa o teste de conexão
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesso Da API: http://localhost:${PORT}`);
    
    // Chama a função de teste de conexão aqui
    await testarConexaoGLPI();
});