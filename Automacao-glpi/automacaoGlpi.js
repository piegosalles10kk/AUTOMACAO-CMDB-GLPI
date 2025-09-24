const axios = require('axios');
const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. CONFIGURAÇÕES
// =========================================================================

// Configurações da API de Coleta (Datto)
const ApiColeta = "http://localhost:3000/api/datto";
const DATTO_HEADERS = {};

// Configurações da API GLPI
const GlpiApi = 'http://localhost:3003';

// Testes de conexões
async function testeApiColeta(){
    const url = `${ApiColeta}/devices`
    try{
        console.log(`--- Iniciando teste da api ${ApiColeta} ---`);
        await axios.get(url, { headers: DATTO_HEADERS });
        console.log(`✅ Conexão com a API de Coleta ${ApiColeta} bem-sucedida!`);
    }catch(error){
        console.error(`❌ Falha na conexão com a API ${ApiColeta}.`);
        console.error('Verifique o arquivo .env e o status da API.');
    }
}

async function testeApiGlpi(){
    const url = `${GlpiApi}/api/glpi/teste`
    try{
        console.log(`--- Iniciando teste da api ${url} ---`);
        await axios.get(url)
        console.log(`✅ Conexão com a API ${url} bem-sucedida!`);
    }catch(error){
        console.error(`❌ Falha na conexão com a API ${url}.`);
        console.error('Verifique o arquivo .env e o status da API.');

    }
}

testeApiColeta();
testeApiGlpi();


// =========================================================================
// 2. FUNÇÕES DE COLETA DE DADOS (API DATTO)
// =========================================================================

/**
 * @returns {Promise<Map<string, string>>} Um mapa onde a chave é o siteUid e o valor é o siteName.
 */
async function getAllSites() {
    console.log("Iniciando coleta de sites...");
    const sites = new Map();
    const url = `${ApiColeta}/devices`;
    try {
        const response = await axios.get(url, { headers: DATTO_HEADERS });
        const data = response.data;
        if (data && Array.isArray(data)) {
            data.forEach(device => {
                if (device.siteUid && device.siteName) {
                    sites.set(device.siteUid, device.siteName);
                }
            });
        }
        console.log(`Coleta de sites concluída. Encontrados ${sites.size} sites.`);
        return data; 
    } catch (error) {
        console.error(`Erro ao acessar a API de proxy: ${error.message}`);
        if (error.response) {
            console.error("Status do erro:", error.response.status);
            console.error("Dados do erro:", error.response.data);
        }
        return [];
    }
}

/**
 * Coleta os dados de auditoria e software para um dispositivo.
 * @param {string} deviceUid - O UID do dispositivo.
 * @returns {Promise<Object>} Um objeto com os dados de auditoria e software.
 */
async function getDeviceDetails(deviceUid) {
    console.log(`Coletando dados detalhados para o deviceUid: ${deviceUid}`);
    const auditUrl = `${ApiColeta}/audit/device/${deviceUid}`;
    const softwareUrl = `${ApiColeta}/audit/device/${deviceUid}/software`;

    try {
        const [auditResponse, softwareResponse] = await Promise.all([
            axios.get(auditUrl, { headers: DATTO_HEADERS }),
            axios.get(softwareUrl, { headers: DATTO_HEADERS })
        ]);
        return {
            audit: auditResponse.data,
            software: softwareResponse.data
        };
    } catch (error) {
        console.error(`Erro ao coletar detalhes do dispositivo ${deviceUid}: ${error.message}`);
        return null;
    }
}

// =========================================================================
// 3. FUNÇÃO DE IMPORTAÇÃO PARA A API
// =========================================================================

/**
 * Envia o JSON de inventário para a API que criamos.
 * @param {Object} glpiJson O objeto JSON de inventário no formato do GLPI Agent.
 */
async function sendInventoryToGlpiAPI(glpiJson) {
    console.log(`\nIniciando envio do inventário para a sua API.`);
    const url = `${GlpiApi}/api/glpi/inventario`

    try {
        const response = await axios.post(
            url,
            glpiJson,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log(`Envio concluído. Status: ${response.status}`);
        console.log("Resposta da API:", response.data);

    } catch (error) {
        console.error(`Falha ao enviar o inventário: ${error.message}`);
        if (error.response) {
            console.error("Status do erro:", error.response.status);
            console.error("Dados do erro:", error.response.data);
        }
    }
}

// =========================================================================
// 4. FUNÇÃO DE CONVERSÃO DATTO -> GLPI
// =========================================================================

/**
 * Converte os dados de um dispositivo Datto para o formato JSON do GLPI Agent.
 * @param {Object} dattoDevice - Os dados de resumo do dispositivo (hostname, domain, etc.).
 * @param {string} entityName - O nome da entidade (siteName).
 * @param {Object} dattoDetails - Os dados detalhados de auditoria e software (opcional).
 * @returns {Object} Um objeto JSON no formato do GLPI Agent.
 */
function convertToGlpiFormat(dattoDevice, entityName, dattoDetails) {
    const audit = dattoDetails?.audit;
    const software = dattoDetails?.software;
    console.log(entityName);
    

    const glpiInventory = {
        "inventory_id": dattoDevice.uid,
        "version": "1.x",
        "entities": [
            {
                "entity_name": entityName,
                "hostname": dattoDevice.hostname || "N/A",
                "osname": dattoDevice.operatingSystem || "N/A",
                "domain": dattoDevice.domain || "N/A",
                "type": dattoDevice.deviceType.category || "Computer",
                "dattoLink": audit?.portalUrl || "N/A",
                "conexaoRemota": audit?.webRemoteUrl || "N/A",
                "hardware": {
                    "uuid": dattoDevice.uid,
                    "manufacturer": audit?.systemInfo?.manufacturer || dattoDevice?.deviceType?.category || "N/A",
                    "model": audit?.systemInfo?.model || dattoDevice?.deviceType?.type || "N/A",
                    "serial": audit?.bios?.serialNumber || "N/A",
                    "memorysize": audit?.systemInfo?.totalPhysicalMemory || 0,
                    "memoryram": Array.isArray(audit?.physicalMemory) ? audit.physicalMemory.map(ram => ({
                        "capacity": ram.size || 0,
                        "speed": parseInt(ram.speed) || 0,
                        "type": ram.type || "N/A"
                    })) : [],
                    "networks": Array.isArray(audit?.nics) ? audit.nics.map(adapter => ({
                        "description": adapter.instance || "N/A",
                        "mac_address": adapter.macAddress || "N/A",
                        "ipv4_addresses": adapter.ipv4 ? [adapter.ipv4] : [],
                        "is_up": true
                    })) : [],
                    "processors": Array.isArray(audit?.processors) ? audit.processors.map(cpu => ({
                        "name": cpu.name || "N/A",
                        "cores": audit?.systemInfo?.totalCpuCores || 0
                    })) : [],
                    "storages": Array.isArray(audit?.logicalDisks) ? audit.logicalDisks.map(disk => ({
                        "name": disk.diskIdentifier || "N/A",
                        "size": disk.size || 0,
                        "partitions": [{
                            "caption": disk.description || "N/A",
                            "freespace": disk.freespace || 0
                        }]
                    })) : [],
                    "software": Array.isArray(software?.software) ? software.software.map(app => ({
                        "name": app.name || "N/A",
                        "version": app.version || "N/A",
                        "publisher": app.publisher || ""
                    })) : []
                }
            }
        ]
    };
    return glpiInventory;
}

// =========================================================================
// 5. FUNÇÃO PRINCIPAL
// =========================================================================

async function main() {
    console.log("\nIniciando o processo de coleta e envio de inventário para a API GLPI.");

    // Altera a chamada para obter todos os dispositivos de uma vez.
    const allDevices = await getAllSites();

    if (allDevices.length === 0) {
        console.log("Nenhum dispositivo encontrado. Encerrando o processo.");
        return;
    }

    console.log(`Total de dispositivos a serem processados: ${allDevices.length}`);
    
    // Itera diretamente sobre a lista completa de dispositivos
    for (const device of allDevices) {
        const deviceUid = device.uid;
        if (deviceUid && device.siteName) {
            try {
                // Coleta os detalhes do dispositivo individualmente
                const deviceDetails = await getDeviceDetails(deviceUid);
                
                // Converte para o formato GLPI, usando siteName diretamente do objeto 'device'
                const glpiJson = convertToGlpiFormat(device, device.siteName, deviceDetails);
                //console.log(glpiJson);
                
                // Dentro do seu loop principal (no 'for' ou 'forEach')
                    const maxTentativas = 3;
                    let tentativaAtual = 1;

                    while (tentativaAtual <= maxTentativas) {
                        try {
                            console.log(`Tentativa ${tentativaAtual} de ${maxTentativas}...`);

                            // Envia o JSON para a API.
                            // Se for bem-sucedido, a função sendInventoryToGlpiAPI retorna a resposta
                            await sendInventoryToGlpiAPI(glpiJson);
                            
                            console.log(`✅ Inventário enviado com sucesso na tentativa ${tentativaAtual}.`);
                            
                            // Sai do loop 'while' se for bem-sucedido
                            break; 

                        } catch (error) {
                            // Loga a falha, independente do motivo (rede, permissão, etc.)
                            console.error(`❌ Falha na requisição (tentativa ${tentativaAtual}):`, error.message);

                            // Se o erro tiver uma resposta da API, loga os detalhes para debug
                            if (error.response) {
                                console.error("Status do erro:", error.response.status);
                                console.error("Dados do erro:", error.response.data);
                            }

                            // Se for a última tentativa, exibe o alerta final
                            if (tentativaAtual === maxTentativas) {
                                console.error(`\n🚨 Atenção: Não foi possível enviar o inventário após ${maxTentativas} tentativas. Verifique a API do GLPI.`);
                            }
                        }
                        
                        // Incrementa o contador para a próxima tentativa, se o loop não tiver sido interrompido
                        tentativaAtual++;
                    }


                console.log(`Inventário de '${device.hostname}' para o site '${device.siteName}' enviado com sucesso.`);
            } catch (error) {
                console.error(`Erro ao processar o dispositivo ${deviceUid}: ${error.message}`);
            }
        } else {
            console.log(`Dispositivo com UID ou nome de site ausente. Ignorando: ${JSON.stringify(device)}`);
        }
    }

    console.log("\nProcesso de coleta de dados e importação para a API GLPI concluído.");
}

// Inicia a execução do script
main();