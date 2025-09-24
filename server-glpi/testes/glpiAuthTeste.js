// testes/glpiConexaoTeste.js

const { getSessionToken } = require("../services/glpiAuthService");

// Função para testar a conexão
const testarConexaoGLPI = async () => {
    try {
        await getSessionToken();
        console.log('✅ Conexão com a API do GLPI bem-sucedida!');
        console.log('--- Testes de conexão concluídos ---');
    } catch (error) {
        console.error('❌ Falha na conexão com a API do GLPI.');
        console.error('--- Verifique as credenciais no arquivo .env e o status da API ---');
    }
};

module.exports = { testarConexaoGLPI };