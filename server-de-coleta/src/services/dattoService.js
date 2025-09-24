// src/services/dattoService.js
const axios = require('axios');

// Credenciais da API do Datto do .env
const dattoBaseUrl = process.env.DATTO_BASE;
const dattoKey = process.env.DATTO_KEY;
const dattoSecret = process.env.DATTO_SECRET;

// Objeto para armazenar o token e sua validade (para evitar requisições repetidas de token)
let accessToken = null;
let tokenExpiry = null;

// Função para obter ou renovar o token de acesso
const getAccessToken = async () => {
    // Verifica se o token ainda é válido
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    // Se não, faz a requisição para obter um novo token
    const tokenUrl = `https://vidal-api.centrastage.net/auth/oauth/token`;
    const tokenBody = new URLSearchParams();
    tokenBody.append('grant_type', 'password');
    tokenBody.append('username', dattoKey);
    tokenBody.append('password', dattoSecret);

    const authString = Buffer.from('public-client:public').toString('base64');
    
    const tokenResponse = await axios.post(tokenUrl, tokenBody, {
        headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    // Atualiza o token e o tempo de expiração (100 horas = 360000 segundos)
    accessToken = tokenResponse.data.access_token;
    tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000) - 60000; // 1 minuto antes de expirar
    
    return accessToken;
};

// Função genérica para fazer requisições à API do Datto com autenticação
const dattoRequest = async (path, params = {}) => {
    const token = await getAccessToken();
    const url = `${dattoBaseUrl}${path}`;
    
    const response = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        params,
    });

    return response.data;
};

// Exporte todas as funções necessárias em um único objeto
module.exports = { 
    getAccessToken, 
    dattoRequest 
};