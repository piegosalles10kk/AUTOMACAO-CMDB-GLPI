// src/controllers/dattoController.js
const dattoService = require('../services/dattoService');

// Função para obter dispositivos da conta
exports.getAccountDevices = async (req, res) => {
    try {
    let allDevices = [];
    let nextUrl = '/account/devices';

    // Loop que continua enquanto houver uma próxima página
    while (nextUrl) {
      const response = await dattoService.dattoRequest(nextUrl);
      allDevices = allDevices.concat(response.devices);
      nextUrl = response.pageDetails.nextPageUrl ? response.pageDetails.nextPageUrl.replace('https://vidal-api.centrastage.net/api/v2', '') : null;
    }

    res.json(allDevices);
  } catch (error) {
      console.error('Erro ao buscar todos os dispositivos da conta:', error.message);
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Dados da resposta de erro:', error.response.data);
      } else if (error.request) {
        console.error('Nenhuma resposta recebida:', error.request);
      } else {
        console.error('Erro ao configurar a requisição:', error.message);
      }
      res.status(500).json({ error: 'Erro ao buscar todos os dispositivos da conta.' });
    }
}

// Função para obter dispositivos de um site específico
exports.getSiteDevices = async (req, res) => {
  try {
    const { siteUid } = req.params;
    const devices = await dattoService.dattoRequest(`/site/${siteUid}/devices`);
    res.json(devices);
  } catch (error) {
    console.error('Erro ao buscar dispositivos do site:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dispositivos do site.' });
  }
};

// Função para obter dados de um dispositivo específico
exports.getDeviceData = async (req, res) => {
  try {
    const { deviceUid } = req.params;
    const device = await dattoService.dattoRequest(`/device/${deviceUid}`);
    res.json(device);
  } catch (error) {
    console.error('Erro ao buscar dados do dispositivo:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados do dispositivo.' });
  }
};

// Função para obter dados de auditoria do dispositivo
exports.getDeviceAudit = async (req, res) => {
  try {
    const { deviceUid } = req.params;
    const audit = await dattoService.dattoRequest(`/audit/device/${deviceUid}`);
    res.json(audit);
  } catch (error) {
    console.error('Erro ao buscar dados de auditoria do dispositivo:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados de auditoria do dispositivo.' });
  }
};

// Função para obter software de um dispositivo
exports.getDeviceSoftware = async (req, res) => {
  try {
    const { deviceUid } = req.params;
    const software = await dattoService.dattoRequest(`/audit/device/${deviceUid}/software`);
    res.json(software);
  } catch (error) {
    console.error('Erro ao buscar software do dispositivo:', error.message);
    res.status(500).json({ error: 'Erro ao buscar software do dispositivo.' });
  }
};

// Função para obter dados de auditoria por endereço MAC
exports.getDeviceAuditByMacAddress = async (req, res) => {
  try {
    const { macAddress } = req.params;
    const audit = await dattoService.dattoRequest(`/audit/device/macAddress/${macAddress}`);
    res.json(audit);
  } catch (error) {
    console.error('Erro ao buscar dados de auditoria por endereço MAC:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados de auditoria por endereço MAC.' });
  }
};