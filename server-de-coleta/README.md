# API CMDB - Integração Datto, Acronis e GLPI

Esta API Node.js integra três sistemas de gerenciamento: **Datto RMM**, **Acronis Cyber Backup** e **GLPI**, fornecendo endpoints unificados para coleta de dados de dispositivos, backups e chamados de suporte.

## 📋 Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [Docker](#docker)
- [Endpoints da API](#endpoints-da-api)
  - [Datto RMM](#datto-rmm)
  - [Acronis](#acronis)
  - [GLPI](#glpi)
- [Testes de Conexão](#testes-de-conexão)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🔧 Pré-requisitos

- **Node.js** 20.x ou superior
- **Docker** (opcional, para containerização)
- **Docker Compose** (opcional)
- Acesso às APIs:
  - Datto RMM (chaves de API)
  - Acronis Cyber Backup (client credentials)
  - GLPI (app token e credenciais de usuário)

## 📥 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd cmdb---datto
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp dotenv .env
```

## ⚙️ Configuração

Edite o arquivo `.env` com suas credenciais:

```env
# Porta da aplicação
PORT=3000

# Configurações da API do ACRONIS
ACRONIS_BASE_URL=https://<seu-data-center-acronis>
ACRONIS_CLIENT_ID=<seu-client-id-acronis>
ACRONIS_CLIENT_SECRET=<seu-client-secret-acronis>

# Configurações da API do DATTO
DATTO_BASE=<sua-api-url-datto>
DATTO_KEY=<sua-chave-datto>
DATTO_SECRET=<seu-secret-datto>

# Configurações da API do GLPI
GLPI_API_URL=<sua-url-api-glpi>
GLPI_APP_TOKEN=<seu-app-token-glpi>
GLPI_USER_LOGIN=<seu-login-glpi>
GLPI_USER_PASSWORD=<sua-senha-glpi>
```

### Exemplo de configuração:

```env
PORT=3000

# Acronis
ACRONIS_BASE_URL=https://eu2-cloud.acronis.com
ACRONIS_CLIENT_ID=seu-client-id
ACRONIS_CLIENT_SECRET=seu-client-secret

# Datto
DATTO_BASE=https://vidal-api.centrastage.net/api/v2
DATTO_KEY=sua-api-key
DATTO_SECRET=seu-api-secret

# GLPI
GLPI_API_URL=http://172.16.50.85:159/apirest.php
GLPI_APP_TOKEN=Z0sxVgzPrgUA6FSXXBm8w1tyutglv80inzaLheDB
GLPI_USER_LOGIN=glpi
GLPI_USER_PASSWORD=1234
```

## 🚀 Executando a Aplicação

### Modo de desenvolvimento

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

### Teste das conexões

Ao iniciar, a aplicação automaticamente testará as conexões com as APIs. Você verá mensagens como:

```
✅ Conexão com a API do Datto bem-sucedida!
✅ Conexão com a API do GLPI bem-sucedida!
```

## 🐳 Docker

### Usando Docker Compose (Recomendado)

```bash
# Construir e executar
docker-compose up --build

# Executar em background
docker-compose up -d --build

# Parar os serviços
docker-compose down
```

### Usando Docker manualmente

```bash
# Construir a imagem
docker build -t cmdb-api .

# Executar o container
docker run -p 3000:3000 --env-file .env cmdb-api
```

## 🔗 Endpoints da API

### Datto RMM

#### 1. Listar todos os dispositivos da conta

```http
GET /api/datto/devices
```

**Resposta:**
```json
[
  {
    "deviceUid": "12345678-1234-1234-1234-123456789012",
    "hostname": "DESKTOP-ABC123",
    "operatingSystem": "Microsoft Windows 10 Pro",
    "ipAddress": "192.168.1.100",
    "macAddress": "00:11:22:33:44:55",
    "siteUid": "87654321-4321-4321-4321-210987654321",
    "siteName": "Escritório Principal"
  }
]
```

#### 2. Listar dispositivos de um site específico

```http
GET /api/datto/site/{siteUid}/devices
```

**Exemplo:**
```http
GET /api/datto/site/87654321-4321-4321-4321-210987654321/devices
```

#### 3. Obter dados de um dispositivo específico

```http
GET /api/datto/device/{deviceUid}
```

**Exemplo:**
```http
GET /api/datto/device/12345678-1234-1234-1234-123456789012
```

#### 4. Obter auditoria de um dispositivo

```http
GET /api/datto/audit/device/{deviceUid}
```

#### 5. Obter software instalado em um dispositivo

```http
GET /api/datto/audit/device/{deviceUid}/software
```

#### 6. Obter auditoria por endereço MAC

```http
GET /api/datto/audit/device/macAddress/{macAddress}
```

**Exemplo:**
```http
GET /api/datto/audit/device/macAddress/00:11:22:33:44:55
```

---

### Acronis

#### 1. Listar todos os tenants

```http
GET /api/acronis/tenants
```

**Resposta:**
```json
{
  "items": [
    {
      "id": "tenant-uuid-1234",
      "name": "Cliente ABC Ltda",
      "kind": "customer",
      "parent_id": "root-tenant-id",
      "enabled": true
    }
  ],
  "count": 1
}
```

#### 2. Obter informações de um tenant específico

```http
GET /api/acronis/tenants/{tenantId}
```

**Exemplo:**
```http
GET /api/acronis/tenants/tenant-uuid-1234
```

#### 3. Obter tarefas/backups de um tenant

```http
POST /api/acronis/end-game
```

**Body (JSON):**
```json
{
  "tenant_id": "tenant-uuid-1234"
}
```

**Resposta:**
```json
{
  "items": [
    {
      "id": "task-123",
      "state": "failed",
      "type": "backup",
      "tenant": {
        "uuid": "tenant-uuid-1234",
        "name": "Cliente ABC Ltda"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "finishedAt": "2024-01-15T11:45:00Z"
    }
  ],
  "count": 1
}
```

---

### GLPI

#### 1. Buscar tickets por status e entidade

```http
GET /api/glpi/search/{status}/{entityName}
```

**Parâmetros:**
- `status`: ID do status ou valores especiais
  - `10`: Todos os tickets abertos (status 1,2,3,4)
  - `1`: Novo
  - `2`: Em andamento
  - `3`: Pendente
  - `4`: Resolvido
  - `5`: Fechado
  - `6`: Cancelado
- `entityName`: Nome da entidade (será buscado como "Raiz > {entityName}")

**Exemplo:**
```http
GET /api/glpi/search/10/TI
```

**Resposta:**
```json
{
  "entity_id": "0",
  "total_tickets_found": 5,
  "all_tickets": [
    {
      "id": "12345",
      "name": "Problema no computador do João",
      "status_id": "2",
      "status_name": "Em andamento",
      "date_opened": "2024-01-15 09:30:00",
      "entity": "Raiz > TI"
    }
  ]
}
```

---

## 🧪 Testes de Conexão

A aplicação inclui testes automáticos de conectividade que são executados na inicialização. Para executar manualmente:

```javascript
const { executarTodosTestesDeConexao } = require('./src/tests/conectionsTests');
executarTodosTestesDeConexao();
```

### Status dos testes:

- ✅ **Sucesso**: Conexão estabelecida com sucesso
- ❌ **Falha**: Problema na conectividade (verifique credenciais e status da API)

## 📁 Estrutura do Projeto

```
cmdb---datto/
├── src/
│   ├── controllers/          # Controladores das rotas
│   │   ├── acronisController.js
│   │   ├── dattoController.js
│   │   └── glpiController.js
│   ├── routes/              # Definições das rotas
│   │   ├── acronisRoutes.js
│   │   ├── dattoRoutes.js
│   │   └── glpiRoutes.js
│   ├── services/            # Lógica de negócio e integração com APIs
│   │   ├── acronisService.js
│   │   ├── dattoService.js
│   │   └── glpiAuthService.js
│   └── tests/               # Testes de conectividade
│       └── conectionsTests.js
├── .env                     # Variáveis de ambiente (não versionado)
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── app.js                   # Configuração principal do Express
├── server.js               # Servidor HTTP
├── package.json
└── README.md
```

## 📝 Logs e Debugging

A aplicação registra informações importantes no console:

- **Inicialização**: Status da inicialização e porta
- **Testes de conexão**: Resultados dos testes de API
- **Erros de API**: Detalhes sobre falhas nas requisições
- **Autenticação**: Status dos tokens de acesso

## 🔐 Segurança

- **Variáveis de ambiente**: Nunca commite o arquivo `.env`
- **Tokens**: Os tokens são gerenciados automaticamente e renovados quando necessário
- **HTTPS**: Recomendado para ambientes de produção
- **Rate Limiting**: Considere implementar rate limiting para APIs públicas

## 🐛 Troubleshooting

### Problemas comuns:

1. **Erro de conexão com APIs**
   - Verifique as credenciais no `.env`
   - Confirme se as URLs das APIs estão corretas
   - Verifique conectividade de rede

2. **Token inválido**
   - Tokens são renovados automaticamente
   - Verifique se as credenciais estão corretas

3. **Timeout de requisição**
   - Algumas requisições podem demorar (ex: busca de todos os dispositivos)
   - Timeout configurado para 30 segundos


## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [package.json](package.json) para detalhes.

---

**Desenvolvido por:** Piego  
**Versão:** 1.0.0
