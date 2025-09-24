const { getAcronisToken } = require("../services/acronisService");
const { getAccessToken } = require("../services/dattoService");
const { getSessionToken } = require("../services/glpiAuthService");

// Função para testar a conexão com o Acronis
const testarConexaoAcronis = async () => {
    try {
        await getAcronisToken();
        console.log('✅ Conexão com a API do Acronis bem-sucedida!');
    } catch (error) {
        console.error('❌ Falha na conexão com a API do Acronis.');
        console.error('Verifique as credenciais no arquivo .env e o status da API.');
    }
}

// Função para testar a conexão com o Datto
const testarConexaoDatto = async () => {
    try {
        await getAccessToken();
        console.log('✅ Conexão com a API do Datto bem-sucedida!');
    } catch (error) {
        console.error('❌ Falha na conexão com a API do Datto.', error);
        console.error('Verifique as credenciais no arquivo .env e o status da API.');
    }
}

// Função para testar a conexão com o GLPI
const testarConexaoGlpi = async () => {
    try {
        await getSessionToken();
        console.log('✅ Conexão com a API do GLPI bem-sucedida!');
    } catch (error) {
        console.error('❌ Falha na conexão com a API do GLPI.');
        console.error('Verifique as credenciais no arquivo .env e o status da API.');
    }
}

// Função de execução dos testes
const executarTodosTestesDeConexao = async () => {
    console.log('--- Iniciando testes de conexão com as APIs ---');
    //await testarConexaoAcronis();
    await testarConexaoDatto();
    await testarConexaoGlpi();
    console.log('--- Testes de conexão concluídos ---');
};

module.exports = { 
    executarTodosTestesDeConexao
};