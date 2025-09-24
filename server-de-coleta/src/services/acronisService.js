const axios = require('axios');

const ACRONIS_BASE_URL = process.env.ACRONIS_BASE_URL;
const ACRONIS_CLIENT_ID = process.env.ACRONIS_CLIENT_ID;
const ACRONIS_CLIENT_SECRET = process.env.ACRONIS_CLIENT_SECRET;

async function getAcronisToken() {
  try {
    const authParams = {
      grant_type: 'client_credentials',
      client_id: ACRONIS_CLIENT_ID,
      client_secret: ACRONIS_CLIENT_SECRET,
    };
    const response = await axios.post(`${ACRONIS_BASE_URL}/api/2/idp/token`, authParams, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter o token da Acronis:', error.response ? error.response.data : error.message);
    throw new Error('Falha na autenticação com a API da Acronis.');
  }
}


// ✅ Função para buscar informações detalhadas de um único tenant (por UUID)
exports.getSingleTenantInfo = async (tenantId) => {
  try {
    const accessToken = await getAcronisToken();
    const tenantResponse = await axios.get(
      `${ACRONIS_BASE_URL}/api/2/tenants/${tenantId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return tenantResponse.data;
  } catch (error) {
    // Retorna null em caso de erro para não interromper a busca
    console.error(`Aviso: O tenant com ID ${tenantId} não foi encontrado na API de tenants.`, error.message);
    return null;
  }
};


exports.getTenants = async () => {
  try {
    const accessToken = await getAcronisToken();
    const url = `${ACRONIS_BASE_URL}/api/task_manager/v2/tasks`;

    // 1. Busca todas as tarefas
    const tasksResponse = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const allTasks = tasksResponse.data.items;

    // 2. Extrai os UUIDs de todos os tenants das tarefas
    const tenantUUIDs = allTasks.reduce((uuids, task) => {
      if (task.tenant && task.tenant.uuid) {
        uuids.add(task.tenant.uuid);
      }
      return uuids;
    }, new Set());

    // 3. Busca as informações de cada tenant único
    const tenantPromises = Array.from(tenantUUIDs).map(uuid => exports.getSingleTenantInfo(uuid));
    const fullTenants = await Promise.all(tenantPromises);

    // 4. Filtra qualquer tenant que não foi encontrado (retornou null)
    const validTenants = fullTenants.filter(tenant => tenant !== null);

    return {
      items: validTenants,
      count: validTenants.length
    };
  } catch (error) {
    console.error('Erro ao buscar tenants a partir das tarefas:', error.response ? error.response.data : error.message);
    throw new Error('Falha ao buscar a lista de tenants.');
  }
};

// ✅ Função getTasks que usa o UUID para filtrar as tarefas (sem alterações)
exports.getTasks = async (tenantId) => {
  try {
    const accessToken = await getAcronisToken();
    const url = `${ACRONIS_BASE_URL}/api/task_manager/v2/tasks`;
    const tasksResponse = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const allTasks = tasksResponse.data.items;
    const tenantTasks = allTasks.filter(task => {
        if (task.tenant && task.tenant.uuid) {
            return task.tenant.uuid === tenantId;
        }
        return false;
    });
    return {
      items: tenantTasks,
      count: tenantTasks.length
    };
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error.response ? error.response.data : error.message);
    throw new Error('Falha ao buscar as tarefas da Acronis.');
  }
};

module.exports = { getAcronisToken }