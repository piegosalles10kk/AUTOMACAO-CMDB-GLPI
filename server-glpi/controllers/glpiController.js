// controllers/glpiController.js

const axios = require('axios');
const { getSessionToken } = require('../services/glpiAuthService');

const GLPI_API_URL = process.env.GLPI_API_URL || 'https://chamados.bugbusters.me/apirest.php/';
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || 'rNkCgKqtRIfBmY2mVi3zXOhPSXvkYPGSDh4sIuPe';
const GLPI_USER_TOKEN = 'seu_token_permanente_aqui';

const glpiAxios = axios.create({
    baseURL: GLPI_API_URL,
    headers: {
        'App-Token': GLPI_APP_TOKEN,
        'Content-Type': 'application/json'
    }
});



/**
 * Busca uma entidade pelo nome, iterando por IDs de 1 em diante,
 * @param {string} entityName - O nome da entidade.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID da entidade, se encontrada, ou null.
 */
const findEntityId = async (entityName, headers) => {
    // Se o nome for 'Clientes Imediatos', retorna o ID 0 (raiz)
    if (!entityName || entityName.toUpperCase().trim() === 'CLIENTES IMEDIATOS') {
        console.log('Nenhum nome de entidade fornecido ou é a entidade raiz. Usando Entidade Raiz (ID 0).');
        return 0;
    }

    const normalizedName = entityName.toUpperCase().trim();
    let currentId = 1;
    const blockSize = 20; // Define o tamanho do bloco de requisições

    console.log(`Iniciando busca por ID da entidade: "${normalizedName}" em blocos de ${blockSize}.`);

    while (true) {
        const promises = [];
        let anySuccessfulRequest = false; // Flag para verificar se alguma requisição no bloco foi bem-sucedida

        // Cria um lote de promessas para o bloco atual
        for (let i = 0; i < blockSize; i++) {
            const idToFetch = currentId + i;
            const url = `/Entity/${idToFetch}`;
            promises.push(glpiAxios.get(url, { headers }).catch(e => e)); // O .catch evita que um erro pare o Promise.all
        }

        // Executa todas as promessas do lote em paralelo
        const responses = await Promise.all(promises);

        // Processa as respostas do lote
        for (const response of responses) {
            // Se a requisição foi bem-sucedida, checa se o nome da entidade corresponde
            if (response.data && response.data.name) {
                anySuccessfulRequest = true;
                if (response.data.name.trim().toUpperCase() === normalizedName) {
                    console.log(`Entidade '${normalizedName}' encontrada com ID: ${response.data.id}`);
                    return response.data.id;
                }
            }
        }
        
        // Se nenhuma requisição no bloco retornou dados (todos foram 404, por exemplo),
        // e se o último ID do bloco anterior foi um erro, consideramos o fim da lista.
        // A lógica de "nenhum 200 OK foi retornado" pode ser um indicativo melhor.
        if (!anySuccessfulRequest) {
            console.log('Fim da lista de entidades. A entidade não foi encontrada.');
            return null;
        }

        // Move para o próximo bloco de IDs
        currentId += blockSize;
    }
};


/**
 * Cria uma nova entidade.
 * @param {string} entityName - O nome da entidade.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID da nova entidade, se a criação for bem-sucedida, ou null.
 */
const createEntity = async (entityName, headers) => {
    try {
        console.log('Entidade não encontrada. Tentando criar...');
        const payload = {
            input: {
                name: entityName,
            }
        };
        const response = await glpiAxios.post('/Entity', payload, { headers });
        console.log(`Entidade '${entityName}' criada com ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error('Erro ao criar entidade:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Processa e cria entidades, podendo criar uma sub-entidade se o nome contiver " - ".
 * @param {string} entityName - O nome da entidade (ex: "Solaia - Embu").
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {object|null} Um objeto com os IDs das entidades criadas ou encontradas.
 */
const processAndCreateEntities = async (entityName, headers) => {
    // Normaliza o nome da entidade para o caso de não ter o separador
    const normalizedName = entityName.toUpperCase().trim();

    // Condicional para verificar se o nome contém o separador
    if (entityName && entityName.includes(' - ')) {
        console.log(`Nome da entidade contém separador: "${entityName}"`);
        const parts = entityName.split(' - ');
        const mainEntityName = parts[0].trim();
        const subEntityName = parts[1].trim();

        console.log(`Entidade principal: "${mainEntityName}"`);
        console.log(`Sub-entidade: "${subEntityName}"`);

        // 1. Processa a entidade principal
        let mainEntityId = await findEntityId(mainEntityName, headers);
        if (mainEntityId === null) {
            mainEntityId = await createEntity(mainEntityName, headers);
            if (mainEntityId === null) {
                console.error('Falha ao criar entidade principal.');
                return null;
            }
        }

        // 2. Processa a sub-entidade
        let subEntityId = await findEntityId(subEntityName, headers);
        if (subEntityId === null) {
            try {
                // Prepara o payload para criar a sub-entidade
                const payload = {
                    input: {
                        name: subEntityName,
                        entities_id: mainEntityId
                    }
                };
                const response = await glpiAxios.post('/Entity', payload, { headers });
                subEntityId = response.data.id;
                console.log(`Sub-entidade '${subEntityName}' criada com ID: ${subEntityId}`);
            } catch (error) {
                console.error('Erro ao criar sub-entidade:', error.response?.data || error.message);
                return null;
            }
        }

        return { mainEntityId, subEntityId };

    } else {
        console.log(`Nome da entidade não contém separador. Processando normalmente: "${entityName}"`);
        let entityId = await findEntityId(entityName, headers);

        if (entityId === null) {
            entityId = await createEntity(entityName, headers);
        }

        return { entityId };
    }
};

/**
 * Busca o ID do fabricante pelo nome na API do GLPI.
 * @param {string} manufacturerName - O nome do fabricante a ser buscado.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do fabricante, se encontrado, ou null.
 */
const findManufacturerId = async (manufacturerName, headers) => {
    try {
        const response = await glpiAxios.get(`/Manufacturer?searchText=${encodeURIComponent(manufacturerName)}`, { headers });
        const manufacturer = response.data.find(m => m.name.toLowerCase() === manufacturerName.toLowerCase());
        return manufacturer ? manufacturer.id : null;
    } catch (error) {
        console.error('Erro ao buscar fabricante:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Cria um novo fabricante na API do GLPI.
 * @param {string} manufacturerName - O nome do fabricante a ser criado.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do novo fabricante, se a criação for bem-sucedida, ou null.
 */
const createManufacturer = async (manufacturerName, headers) => {
    try {
        const payload = {
            input: {
                name: manufacturerName
            }
        };
        const response = await glpiAxios.post('/Manufacturer', payload, { headers });
        console.log(`Fabricante '${manufacturerName}' criado com ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error('Erro ao criar fabricante:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Encontra um fabricante por nome ou o cria se ele não existir.
 * @param {string} manufacturerName - O nome do fabricante.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do fabricante.
 */
const findOrCreateManufacturer = async (manufacturerName, headers) => {
    if (!manufacturerName) {
        return null;
    }
    let manufacturerId = await findManufacturerId(manufacturerName, headers);
    if (!manufacturerId) {
        manufacturerId = await createManufacturer(manufacturerName, headers);
    }
    return manufacturerId;
};

/**
 * Busca todos os modelos paginados da API GLPI
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {Array} Array com todos os modelos
 */
const getAllModels = async (headers) => {
    const allModels = [];
    let start = 0;
    const limit = 1000;
    
    try {
        while (true) {
            console.log(`Buscando modelos: range ${start}-${start + limit - 1}`);
            const response = await glpiAxios.get(`/ComputerModel?range=${start}-${start + limit - 1}`, { headers });
            
            if (!response.data || response.data.length === 0) {
                console.log(`Fim da paginação de modelos. Retorno da API:`, response.data);
                break;
            }
            
            allModels.push(...response.data);
            
            if (response.data.length < limit) {
                break;
            }
            
            start += limit;
        }
        
        console.log(`Total de modelos encontrados: ${allModels.length}`);
        return allModels;
        
    } catch (error) {
        console.error('Erro ao buscar todos os modelos:', error.response?.data || error.message);
        return [];
    }
};

/**
 * Busca detalhes completos de um modelo específico por ID
 * @param {number} modelId - ID do modelo
 * @param {object} headers - Cabeçalhos de autorização
 * @returns {object|null} Dados completos do modelo ou null
 */
const getModelDetails = async (modelId, headers) => {
    try {
        const response = await glpiAxios.get(`/ComputerModel/${modelId}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar detalhes do modelo ${modelId}:`, error.response?.data || error.message);
        return null;
    }
};

/**
 * @param {string} modelName - O nome do modelo.
 * @param {number} manufacturerId - O ID do fabricante.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do modelo, se encontrado, ou null.
 */

const findModelId = async (modelName, manufacturerId, headers) => {
    try {
        console.log(`Buscando modelo apenas com o nome: "${modelName}" (ignora o fabricante)`);

        // Limpa o nome do modelo de espaços em branco
        const cleanModelName = modelName.trim();

        // Estratégia 1: Busca rápida usando searchText
        console.log('Tentativa 1: Busca rápida com searchText...');
        const quickResponse = await glpiAxios.get(`/ComputerModel?searchText=${encodeURIComponent(cleanModelName)}`, { headers });
        
        if (Array.isArray(quickResponse.data)) {
            const foundModel = quickResponse.data.find(model => 
                model.name && model.name.trim().toLowerCase() === cleanModelName.toLowerCase()
            );

            if (foundModel) {
                console.log(`✓ Modelo encontrado na busca rápida: Nome: ${foundModel.name.trim()}, ID: ${foundModel.id}`);
                return foundModel.id;
            }
        }

        console.log('Modelo não encontrado na busca rápida. Fazendo busca completa...');
        
        // Estratégia 2: Busca completa paginada
        const allModels = await getAllModels(headers);
        for (const model of allModels) {
            //console.log(`Analisando modelo na busca completa: Nome: ${model.name.trim()}, ID: ${model.id}`);

            if (model.name && model.name.trim().toLowerCase() === cleanModelName.toLowerCase()) {
                console.log(`✓ Modelo encontrado (busca completa) com ID: ${model.id}`);
                return model.id;
            }
        }

        console.log('✗ Modelo não encontrado em nenhuma busca.');
        return null;
    } catch (error) {
        console.error('Erro ao buscar modelo:', error.response?.data || error.message);
        return null;
    }
};


/**
 * Cria um novo modelo na API do GLPI.
 * @param {string} modelName - O nome do modelo.
 * @param {number} manufacturerId - O ID do fabricante.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do novo modelo, se a criação for bem-sucedida, ou null.
 */
const createModel = async (modelName, manufacturerId, headers) => {
    try {
        console.log(`Tentando criar modelo: "${modelName}" para fabricante ID: ${manufacturerId}`);
        const payload = {
            input: {
                name: modelName,
                manufacturers_id: manufacturerId
            }
        };
        const response = await glpiAxios.post('/ComputerModel', payload, { headers });
        
        const newModelId = response.data.id || response.data[0]?.id;
        console.log(`Modelo '${modelName}' criado com ID: ${newModelId}`);
        return newModelId;
        
    } catch (error) {
        console.error('Erro ao criar modelo:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Encontra um modelo por nome e fabricante ou o cria se ele não existir.
 * Versão melhorada com logs mais detalhados.
 * @param {string} modelName - O nome do modelo.
 * @param {number} manufacturerId - O ID do fabricante.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do modelo.
 */
const findOrCreateModel = async (modelName, manufacturerId, headers) => {
    if (!modelName || !manufacturerId) {
        console.log('Nome do modelo ou ID do fabricante não fornecidos.');
        return null;
    }

    console.log(`=== PROCESSANDO MODELO: "${modelName}" (Fabricante ID: ${manufacturerId}) ===`);
    
    // Primeira tentativa: buscar modelo existente
    let modelId = await findModelId(modelName, manufacturerId, headers);
    
    if (modelId) {
        console.log(`✓ Modelo encontrado e será reutilizado: ID ${modelId}`);
        return modelId;
    }
    
    // Segunda tentativa: criar novo modelo
    console.log(`✗ Modelo não encontrado. Criando novo modelo...`);
    modelId = await createModel(modelName, manufacturerId, headers);
    
    if (modelId) {
        console.log(`✓ Novo modelo criado com sucesso: ID ${modelId}`);
    } else {
        console.log(`✗ Falha ao criar modelo: "${modelName}"`);
    }
    
    return modelId;
};

/**
 * Mapeia o tipo de hardware do JSON para o ID do tipo de computador no GLPI.
 * @param {string} type - O tipo de hardware (ex: 'computer', 'laptop', 'server').
 * @returns {number} O ID do tipo de computador no GLPI.
 */


const getComputerTypeId = (type) => {
    switch (type.toLowerCase()) {
        case 'computer':
        case 'desktop':
            return 2;
        case 'laptop':
        case 'notebook':
            return 1;
        case 'server':
            return 4;
        default:
            return null;
    }
};

/**
 * Formata os dados completos de hardware e software em uma string de texto simples.
 * @param {object} data - O objeto 'entities' do JSON de inventário.
 * @returns {string} String formatada em texto simples para o campo de comentários.
 */
const formatComments = (data) => {
    let comments = `=== Acesso ao Datto ===\n\n`;
    comments += `Link: ${data.dattoLink} \n\n`
    comments += `Conexão remota: ${data.conexaoRemota} \n\n`

    comments += `=== INFORMAÇÕES BÁSICAS ===\n\n`;
    comments += `- Hostname: ${data.hostname || 'N/A'}\n`;
    comments += `- SO: ${data.osname || 'N/A'}\n`;
    comments += `- Domínio: ${data.domain || 'N/A'}\n`;
    comments += `- Fabricante: ${data.hardware.manufacturer || 'N/A'}\n`;
    comments += `- Modelo: ${data.hardware.model || 'N/A'}\n`;

    if (data.hardware && data.hardware.processors && data.hardware.processors.length > 0) {
        comments += '\n\n=== PROCESSADOR ===\n\n';
        data.hardware.processors.forEach(proc => {
            comments += `- Nome: ${proc.name || 'N/A'}\n`;
            comments += `- Cores: ${proc.cores || 'N/A'}\n`;
        });
    }



    if (data.hardware && data.hardware.memoryram && data.hardware.memoryram.length > 0) {
    const totalMemoryGB = (data.hardware.memorysize / (1024 ** 3)).toFixed(2);
    comments += '\n\n=== MEMÓRIA RAM ===\n\n';
    comments += `- Capacidade Total: ${totalMemoryGB} GB\n`;
    data.hardware.memoryram.forEach((ram, index) => {
        //console.log(`Objeto RAM sendo processado:`, ram);

        const capacityGB = (ram.capacity / (1024 ** 3)).toFixed(2);
        comments += `- Módulo ${index + 1}: ${capacityGB} GB (Velocidade: ${ram.speed || 'N/A'} MHz ${ram.type || 'N/A'})\n`;
    });
}

    if (data.hardware && data.hardware.networks && data.hardware.networks.length > 0) {
        comments += '\n\n=== PLACAS DE REDE ===\n\n';
        data.hardware.networks.forEach(network => {
            if (network.mac_address && network.mac_address.toLowerCase() !== 'n/a' && network.description) {
                const ipv4 = network.ipv4_addresses.join(', ') || 'N/A';
                comments += `- Nome: ${network.description}\n`;
                comments += `  - Endereço MAC: ${network.mac_address}\n`;
                comments += `  - IPv4: ${ipv4}\n\n`;
            }
        });
    }

    if (data.hardware && data.hardware.storages && data.hardware.storages.length > 0) {
        comments += '\n\n=== ARMAZENAMENTO ===\n\n';
        data.hardware.storages.forEach(storage => {
            const sizeGB = (storage.size / (1024 ** 3)).toFixed(2);
            if (sizeGB > 0) {
                comments += `- Disco: ${storage.name || 'N/A'}\n`;
                comments += `  - Capacidade Total: ${sizeGB} GB\n`;
                if (storage.partitions && storage.partitions.length > 0) {
                    storage.partitions.forEach(partition => {
                        const freespaceGB = (partition.freespace / (1024 ** 3)).toFixed(2);
                        comments += `  - Partição: ${partition.caption || 'N/A'}\n`;
                        comments += `  - Espaço Livre: ${freespaceGB} GB\n\n`;
                    });
                }
            }
        });
    }

    if (data.hardware && data.hardware.software && data.hardware.software.length > 0) {
        comments += '\n\n=== SOFTWARE INSTALADO ===\n\n';
        data.hardware.software.forEach(sw => {
            const name = sw.name || 'N/A';
            const version = sw.version || 'N/A';
            comments += `- ${name} (v${version})\n\n`;
        });
    }

    return comments;
};

/**
 * Busca todos os computadores paginadamente da API GLPI
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {Array} Array com todos os computadores
 */
const getAllComputers = async (headers) => {
    const allComputers = [];
    let start = 0;
    const limit = 1000;
    
    try {
        while (true) {
            console.log(`Buscando computadores: start=${start}, limit=${limit}`);
            const response = await glpiAxios.get(`/Computer?range=${start}-${start + limit - 1}`, {
                headers: {
                    ...headers,
                }
            });
            
            if (!response.data || response.data.length === 0) {
                console.log(`Fim da paginação. Retorno da API:`, response.data);
                break;
            }
            
            allComputers.push(...response.data);
            
            // Se o número de resultados for menor que o limite, significa que chegamos ao final
            if (response.data.length < limit) {
                break;
            }
            
            start += limit;
        }
        
        console.log(`Total de computadores encontrados: ${allComputers.length}`);
        return allComputers;
        
    } catch (error) {
        console.error('Erro ao buscar todos os computadores:', error.response?.data || error.message);
        return [];
    }
};

/**
 * Busca um computador apenas pelo UUID na lista completa de computadores.
 * @param {string} uuid - O UUID do computador.
 * @param {object} headers - Cabeçalhos de autorização.
 * @returns {number|null} O ID do computador, se encontrado, ou null.
 */
const findComputerByUuid = async (uuid, headers) => {
    console.log(`Tentando encontrar computador por UUID: ${uuid}`);
    const allComputers = await getAllComputers(headers);

    if (allComputers.length === 0) {
        console.log('Nenhum computador encontrado no GLPI para busca.');
        return null;
    }

    const foundComputer = allComputers.find(c => c.uuid === uuid);
    
    if (foundComputer) {
        console.log(`Computador encontrado com ID: ${foundComputer.id}`);
        return foundComputer.id;
    }

    console.log(`Nenhum computador encontrado com o UUID fornecido.`);
    return null;
};

const handleInventoryUpdate = async (req, res) => {
    console.log('Requisição recebida para /glpi/inventario');
    
    const computerData = req.body.entities && req.body.entities.length > 0 ? req.body.entities[0] : null;

    if (!computerData || !computerData.hostname || !computerData.hardware || (!computerData.hardware.serial && !computerData.hardware.uuid)) {
        return res.status(400).json({ error: 'Dados inválidos. O hostname e o Serial ou UUID são obrigatórios.' });
    }

    try {
        let sessionToken = null;
        try {
            sessionToken = await getSessionToken();
            console.log({ session_token: sessionToken });
            console.log('Session-Token obtido com sucesso.');
        } catch (authError) {
            console.error('Falha na autenticação via Session-Token. Tentando fallback...');
        }
        
        let headers = {};
        if (sessionToken) {
            headers = { 'Session-Token': sessionToken };
            console.log('Tentativa 1: Usando Session-Token.');
        } else {
            headers = { 'Authorization': `user_token ${GLPI_USER_TOKEN}` };
            console.log('Tentativa 2: Usando User-Token.');
        }

        // Encontra o computador pelo Serial ou UUID na lista completa de ativos
        let computerId = await findComputerByUuid(computerData.hardware.uuid, headers);
        
        let action = computerId ? 'atualizado' : 'criado';


        // 3. Encontra a entidade pelo nome e, se não existir, a cria
        const entityName = (computerData.entity_name || 'Clientes Imediatos').toUpperCase();
        //console.log(entityName);
        

        let entityId = await findEntityId(entityName, headers);
        //console.log(entityId);


        if (entityId === null) {
            if (entityName && entityName.includes(' - ')) {
                const parts = entityName.split(' - ');
                const mainEntityName = parts[0].trim().toUpperCase();
                const subEntityName = parts[1].trim().toUpperCase();
                
                console.log(`Entidade principal: "${mainEntityName}"`);
                console.log(`Sub-entidade: "${subEntityName}"`);

                // 1. Busca e/ou cria a entidade principal
                let mainEntityId = await findEntityId(mainEntityName, headers);
                if (mainEntityId === null) {
                    mainEntityId = await createEntity(mainEntityName, headers);
                    // Se a entidade principal não for criada, encerra o processo
                    if (mainEntityId === null) {
                        console.error('Falha ao criar a entidade principal. Não é possível continuar.');
                        return;
                    }
                }
                
                // 2. BUSCA A SUB-ENTIDADE ANTES DE TENTAR CRIÁ-LA
                let subEntityId = await findEntityId(subEntityName, headers);
                
                // 3. SE A SUB-ENTIDADE NÃO EXISTIR, ENTÃO A CRIA
                if (subEntityId === null) {
                    try {
                        const payload = {
                            input: {
                                name: subEntityName,
                                entities_id: mainEntityId // Define o ID da entidade pai
                            }
                        };
                        const response = await glpiAxios.post('/Entity', payload, { headers });
                        subEntityId = response.data.id;
                        console.log(`Sub-entidade '${subEntityName}' criada com ID: ${subEntityId}`);
                    } catch (error) {
                        console.error('Erro ao criar sub-entidade:', error.response?.data || error.message);
                        entityId = null;
                    }
                } else {
                    console.log(`Sub-entidade '${subEntityName}' já existe com ID: ${subEntityId}`);
                }
                
                // Atribui o ID da sub-entidade à variável principal
                entityId = subEntityId;
                
            } else {
                // Lógica original para criar uma única entidade
                entityId = await createEntity(entityName, headers);
            }
            
            // Como a lógica de criação de sub-entidade já define entityId, não precisamos de findEntityId aqui
            console.log(`ID final da entidade: ${entityId}`);
        }

        // 4. Encontra ou cria o fabricante e o modelo
        const manufacturerId = await findOrCreateManufacturer(computerData.hardware.manufacturer, headers);
        let modelId = null;
        if (manufacturerId) {
            modelId = await findOrCreateModel(computerData.hardware.model, manufacturerId, headers);
        }
        
        // 5. Formata os comentários
        const formattedComments = formatComments(computerData);
        
        // 6. Obtém o tipo de computador
        let computerTypeId
        if(computerData.hardware.model.toLowerCase() !== 'router'){ 
             computerTypeId = getComputerTypeId(computerData.type);
        }else{
            computerTypeId = 5;
        }
        

        // 7. Prepara o payload para criação ou atualização
        const payload = {
            input: {
                name: computerData.hostname || null,
                serial: computerData.hardware.serial || null,
                uuid: computerData.hardware.uuid || null,
                entities_id: entityId,
                computertypes_id: computerTypeId,
                manufacturers_id: manufacturerId,
                computermodels_id: modelId,
                comment: formattedComments,
            }
        };

        // 8. Executa a ação (PUT ou POST)
        if (computerId) {
            await glpiAxios.put(`/Computer/${computerId}`, payload, { headers });
            console.log(`Computador atualizado com ID: ${computerId}`);
        } else {
            const createResponse = await glpiAxios.post('/Computer', payload, { headers });
            computerId = createResponse.data.id;
            console.log(`Computador criado com ID: ${computerId}`);
        }

        res.status(201).json({ 
            success: true, 
            message: `Computador ${action} com sucesso no GLPI.`,
            glpiId: computerId
        });

    } catch (error) {
        console.error('Erro na comunicação com a API do GLPI:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Erro na comunicação com a API do GLPI.', 
            details: error.response?.data || error.message
        });
    }
};

const testarConexaoGLPI = async (req, res) => {
    try {
        const sessionToken = await getSessionToken();
        if (sessionToken) {
            return res.status(200).json({
                success: true,
                message: 'Conexão com a API do GLPI bem-sucedida!',
                token: sessionToken
            });
        }
        throw new Error('Não foi possível obter o token de sessão.');
    } catch (error) {
        console.error('Erro na rota de teste:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Falha na conexão com a API do GLPI.',
            details: error.message
        });
    }
}

module.exports = {
    handleInventoryUpdate,
    testarConexaoGLPI
};