const acronisService = require('../services/acronisService');

// --- Controller para a rota de backups falhos ---
exports.getFailedBackups = async (req, res) => {
  try {
    const { tenant_id } = req.body;
    if (!tenant_id) {
      return res.status(400).json({ error: 'O tenant_id é obrigatório no corpo da requisição.' });
    }
    const backups = await acronisService.getTasks(tenant_id); // A lógica está no serviço
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar a requisição de backups.' });
  }
};

// --- Controller para a rota de tenants ---
exports.getTenants = async (req, res) => {
  try {
    const tenants = await acronisService.getTenants();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar a requisição de tenants.' });
  }
};

// --- Novo Controller para a rota de informações do tenant ---
exports.getTenantInfo = async (req, res) => {
  try {
    const { tenantId } = req.params; // Pega o ID da URL
    if (!tenantId) {
      return res.status(400).json({ error: 'O ID do tenant é obrigatório na URL.' });
    }
    const tenantInfo = await acronisService.getSingleTenantInfo(tenantId);
    res.json(tenantInfo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar informações do tenant.' });
  }
};