// src/controllers/glpiController.js
const glpiAuthService = require('../services/glpiAuthService');
const axios = require('axios');

const GLPI_API_URL = process.env.GLPI_API_URL;

let sessionToken = null;

const getGlpiClient = async () => {
  if (!sessionToken) {
    sessionToken = await glpiAuthService.getSessionToken();
  }
  return axios.create({
    baseURL: GLPI_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'App-Token': process.env.GLPI_APP_TOKEN,
      'Session-Token': sessionToken,
    },
  });
};

exports.getMyEntities = async (req, res) => {
  try {
    const glpiApi = await getGlpiClient();
    const response = await glpiApi.get('/getMyEntities/');
    res.json(response.data.myentities);
  } catch (error) {
    console.error('Erro ao buscar entidades:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Não foi possível buscar as entidades do GLPI.',
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Rota simplificada GET /search/:status/:entityName
 * Busca por status e nome de entidade, com entityId fixo em '0'.
 */
exports.searchTickets = async (req, res) => {
    try {
        const glpiApi = await getGlpiClient();

        const { status, entityName } = req.params;
        let ticketsPromises = [];

        // Filtro fixo para a entidade Raiz
        const rootEntityCriteria = {
            field: 23,
            searchtype: 'equals',
            value: '0'
        };

        // Filtro por Nome da entidade
        const entityNameCriteria = {
            link: 'AND',
            field: 80,
            searchtype: 'contains',
            value: `Raiz > ${entityName}`
        };

        let statusToSearch = [];

        // Define a lista de status a ser buscada
        if (status === '10') {
            statusToSearch = ['1', '2', '3', '4'];
        } else if (status !== '0') {
            statusToSearch = status.split(',');
        }

        // Se houver status para buscar, cria uma Promise para cada um
        if (statusToSearch.length > 0) {
            ticketsPromises = statusToSearch.map(statusId => {
                const criteria = [
                    rootEntityCriteria,
                    entityNameCriteria,
                    {
                        link: 'AND',
                        field: 12,
                        searchtype: 'equals',
                        value: statusId
                    }
                ];

                const params = {
                    'range': '0-9999',
                    'withindexes': true,
                    'giveItems': true,
                };

                criteria.forEach((c, index) => {
                    params[`criteria[${index}][field]`] = c.field;
                    params[`criteria[${index}][searchtype]`] = c.searchtype;
                    params[`criteria[${index}][value]`] = c.value;
                    if (c.link) {
                        params[`criteria[${index}][link]`] = c.link;
                    }
                });

                return glpiApi.get('/search/Ticket', {
                    params: params,
                    timeout: 30000
                });
            });
        }

        if (ticketsPromises.length === 0) {
            return res.status(404).json({ msg: 'Nenhum status válido fornecido para a busca.' });
        }

        // Executa todas as requisições em paralelo
        const responses = await Promise.all(ticketsPromises);

        let allTickets = [];
        let totalCount = 0;

        const stripHtml = (html) => {
            return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim();
        };

        // Processa e combina os resultados de cada requisição
        responses.forEach(response => {
            const ticketsData = response.data.data;
            const ticketsHtmlData = response.data.data_html;
            totalCount += response.data.totalcount;

            const formattedTickets = Object.keys(ticketsData).map(ticketId => {
                const statusNameHtml = ticketsHtmlData[ticketId][12] || '';
                const statusName = stripHtml(statusNameHtml);
                const dateOpened = ticketsData[ticketId][15] || null;

                return {
                    id: ticketsData[ticketId][2],
                    name: ticketsData[ticketId][1],
                    status_id: ticketsData[ticketId][12],
                    status_name: statusName,
                    date_opened: dateOpened,
                    entity: ticketsData[ticketId][80],
                };
            });
            allTickets = allTickets.concat(formattedTickets);
        });

        res.json({
            entity_id: '0',
            total_tickets_found: totalCount,
            all_tickets: allTickets
        });

    } catch (error) {
        console.error('Erro ao buscar tickets:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Não foi possível buscar os chamados.',
            details: error.response?.data || error.message,
        });
    }
};