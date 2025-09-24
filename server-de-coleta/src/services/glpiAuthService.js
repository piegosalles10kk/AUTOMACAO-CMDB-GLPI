// services/glpiAuthService.js

const axios = require('axios');
const querystring = require('querystring');

const GLPI_API_URL = process.env.GLPI_API_URL || 'http://172.16.50.85:159/apirest.php/';
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || 'Z0sxVgzPrgUA6FSXXBm8w1tyutglv80inzaLheDB';
const GLPI_USER_LOGIN = process.env.GLPI_USER_LOGIN ||  'glpi';
const GLPI_USER_PASSWORD = process.env.GLPI_USER_PASSWORD || '1234';


const getSessionToken = async () => {
  try {
    const url = `${GLPI_API_URL}initSession`;
    const headers = {
      'Content-Type': 'application/json',
      'App-Token': GLPI_APP_TOKEN,
    };
    const body = {
      login: GLPI_USER_LOGIN,
      password: GLPI_USER_PASSWORD,
    };

    const response = await axios.post(url, body, { headers });

    // A resposta da API contém o Session-Token
    const sessionToken = response.data.session_token;

    if (!sessionToken) {
      throw new Error('O Session-Token não foi encontrado na resposta da API.');
    }

    console.log('Session-Token obtido com sucesso.');
    return sessionToken;
  } catch (error) {
    console.error('Erro ao obter o Session-Token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação com a API do GLPI.');
  }
};

module.exports = { getSessionToken };