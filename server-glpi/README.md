# API GLPI Inventário - Sistema de Gestão de Ativos

Esta API Node.js especializada permite a criação e atualização automática de inventário de computadores no sistema **GLPI**, incluindo criação dinâmica de entidades, fabricantes e modelos. Ideal para integração com sistemas de monitoramento como Datto RMM.

## 📋 Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [Docker](#docker)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Payload](#estrutura-do-payload)
- [Funcionalidades Avançadas](#funcionalidades-avançadas)
- [Testes de Conexão](#testes-de-conexão)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

- **Node.js** 18.x ou superior
- **Docker** (opcional, para containerização)
- **Docker Compose** (opcional)
- Acesso à API do **GLPI**:
  - URL da API REST
  - App Token válido
  - Credenciais de usuário (login/senha)

## 📥 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd serverglpi
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

Edite o arquivo `.env` com suas credenciais do GLPI:

```env
# Porta da aplicação
PORT=3003

# Configurações da API do GLPI
GLPI_API_URL=https://seu-glpi.com/apirest.php/
GLPI_APP_TOKEN=seu-app-token-aqui
GLPI_USER_LOGIN=seu-usuario
GLPI_USER_PASSWORD=sua-senha
```

### Exemplo de configuração:

```env
PORT=3003
GLPI_API_URL=https://chamados.bugbusters.me/apirest.php/
GLPI_APP_TOKEN=rNkCgKqtRIfBmY2mVi3zXOhPSXvkYPGSDh4sIuPe
GLPI_USER_LOGIN=diego.salles
GLPI_USER_PASSWORD=Diego1310"
```

## 🚀 Executando a Aplicação

### Modo de desenvolvimento

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3003`

### Teste das conexões

Ao iniciar, a aplicação automaticamente testará a conexão com o GLPI:

```
✅ Conexão com a API do GLPI bem-sucedida!
--- Testes de conexão concluídos ---
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
docker build -t glpi-api .

# Executar o container
docker run -p 3003:3003 --env-file .env glpi-api
```

## 🔗 Endpoints da API

### 1. Teste de Conexão

```http
GET /api/glpi/teste
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Conexão com a API do GLPI bem-sucedida!",
  "token": "session-token-aqui"
}
```

**Resposta de erro:**
```json
{
  "success": false,
  "message": "Falha na conexão com a API do GLPI.",
  "details": "Erro específico"
}
```

### 2. Criar/Atualizar Inventário

```http
POST /api/glpi/inventario
```

**Content-Type:** `application/json`

## 📊 Estrutura do Payload

O endpoint principal aceita um payload JSON complexo com informações detalhadas do computador:

### Estrutura Básica

```json
{
  "entities": [
    {
      "hostname": "DESKTOP-ABC123",
      "entity_name": "Escritório Principal",
      "type": "computer",
      "osname": "Microsoft Windows 11 Pro",
      "domain": "EMPRESA.LOCAL",
      "dattoLink": "https://vidal.centrastage.net/csm/device/12345",
      "conexaoRemota": "TeamViewer ID: 123456789",
      "hardware": {
        "uuid": "12345678-1234-1234-1234-123456789012",
        "serial": "SN123456789",
        "manufacturer": "Dell Inc.",
        "model": "OptiPlex 7090",
        "memorysize": 17179869184,
        "processors": [],
        "memoryram": [],
        "networks": [],
        "storages": [],
        "software": []
      }
    }
  ]
}
```

### Detalhamento dos Campos

#### Campos Obrigatórios:
- `hostname`: Nome do computador
- `hardware.uuid` OU `hardware.serial`: Identificador único
- `hardware.manufacturer`: Fabricante do equipamento
- `hardware.model`: Modelo do equipamento

#### Campos Opcionais:
- `entity_name`: Nome da entidade (padrão: "Clientes Imediatos")
- `type`: Tipo de equipamento ("computer", "laptop", "server")
- `osname`: Sistema operacional
- `domain`: Domínio da rede
- `dattoLink`: Link para acesso ao Datto
- `conexaoRemota`: Informações de acesso remoto

### Exemplo Completo do Payload

```json
{
  "entities": [
    {
      "hostname": "SERVIDOR-WEB-01",
      "entity_name": "TI - Infraestrutura",
      "type": "server",
      "osname": "Windows Server 2022",
      "domain": "EMPRESA.LOCAL",
      "dattoLink": "https://vidal.centrastage.net/csm/device/987654",
      "conexaoRemota": "RDP: 192.168.1.100:3389",
      "hardware": {
        "uuid": "87654321-4321-4321-4321-210987654321",
        "serial": "SRV2022001",
        "manufacturer": "HPE",
        "model": "ProLiant DL380 Gen10",
        "memorysize": 68719476736,
        "processors": [
          {
            "name": "Intel Xeon Gold 6230",
            "cores": 20
          }
        ],
        "memoryram": [
          {
            "capacity": 17179869184,
            "speed": 2933,
            "type": "DDR4"
          },
          {
            "capacity": 17179869184,
            "speed": 2933,
            "type": "DDR4"
          },
          {
            "capacity": 17179869184,
            "speed": 2933,
            "type": "DDR4"
          },
          {
            "capacity": 17179869184,
            "speed": 2933,
            "type": "DDR4"
          }
        ],
        "networks": [
          {
            "description": "Intel Ethernet I350",
            "mac_address": "aa:bb:cc:dd:ee:ff",
            "ipv4_addresses": ["192.168.1.100", "10.0.0.100"]
          }
        ],
        "storages": [
          {
            "name": "Samsung SSD 980 PRO",
            "size": 2000398934016,
            "partitions": [
              {
                "caption": "C:",
                "freespace": 1500000000000
              }
            ]
          }
        ],
        "software": [
          {
            "name": "Microsoft Office 365",
            "version": "16.0.14931"
          },
          {
            "name": "Google Chrome",
            "version": "119.0.6045.199"
          }
        ]
      }
    }
  ]
}
```

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Computador criado com sucesso no GLPI.",
  "glpiId": 1234
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": "Erro na comunicação com a API do GLPI.",
  "details": "Detalhes específicos do erro"
}
```

## 🚀 Funcionalidades Avançadas

### 1. **Criação Automática de Entidades**

A API suporta criação automática de entidades hierárquicas:

- **Entidade simples**: `"TI"` → Cria entidade "TI"
- **Entidade hierárquica**: `"Solaia - Embu"` → Cria "Solaia" como entidade pai e "Embu" como sub-entidade

### 2. **Gestão Inteligente de Fabricantes e Modelos**

- Busca automática por fabricantes existentes
- Criação de novos fabricantes se não existirem
- Vinculação automática de modelos aos fabricantes
- Cache otimizado para evitar requisições desnecessárias

### 3. **Detecção Automática de Tipo de Equipamento**

```javascript
// Mapeamento automático de tipos
"computer" | "desktop" → Tipo ID 2 (Desktop)
"laptop" | "notebook" → Tipo ID 1 (Laptop)  
"server" → Tipo ID 4 (Servidor)
"router" → Tipo ID 5 (Equipamento de Rede)
```

### 4. **Atualização vs Criação**

- A API identifica automaticamente se o equipamento já existe (por UUID)
- **Existe**: Atualiza os dados existentes
- **Não existe**: Cria novo registro

### 5. **Formatação Inteligente de Comentários**

O sistema gera automaticamente comentários estruturados contendo:
- Informações básicas do sistema
- Detalhes do processador
- Configuração de memória RAM
- Placas de rede e endereços
- Armazenamento e partições
- Software instalado
- Links de acesso ao Datto

## 🧪 Testes de Conexão

### Teste Automático na Inicialização

```javascript
const { testarConexaoGLPI } = require('./testes/glpiAuthTeste');
```

### Teste Manual via Endpoint

```bash
curl -X GET http://localhost:3003/api/glpi/teste
```

## 📁 Estrutura do Projeto

```
serverglpi/
├── controllers/
│   └── glpiController.js          # Lógica principal da API
├── services/
│   └── glpiAuthService.js         # Serviço de autenticação
├── glpiRoutes/
│   └── glpiRoutes.js             # Definições das rotas
├── testes/
│   └── glpiAuthTeste.js          # Testes de conectividade
├── .env                          # Variáveis de ambiente
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── server.js                     # Servidor HTTP principal
├── package.json
└── README.md
```

## 📝 Tipos de Equipamento Suportados

| Tipo | ID GLPI | Descrição |
|------|---------|-----------|
| Desktop | 2 | Computadores de mesa |
| Laptop | 1 | Notebooks e laptops |
| Servidor | 4 | Servidores |
| Router | 5 | Equipamentos de rede |

## 🔐 Segurança e Autenticação

### Métodos de Autenticação Suportados:

1. **Session Token** (Preferencial)
   - Login/senha via API
   - Token temporário renovável

2. **User Token** (Fallback)
   - Token permanente do usuário
   - Backup caso Session Token falhe

### Configuração de Segurança:

```javascript
// Cabeçalhos de autenticação
headers: {
    'App-Token': 'seu-app-token',
    'Session-Token': 'token-temporario',
    'Content-Type': 'application/json'
}
```

## 🐛 Troubleshooting

### Problemas Comuns:

#### 1. **Erro 401 - Unauthorized**
```json
{
  "success": false,
  "error": "Falha na autenticação com a API do GLPI"
}
```
**Solução**: Verifique App-Token e credenciais no `.env`

#### 2. **Erro 400 - Dados inválidos**
```json
{
  "error": "Dados inválidos. O hostname e o Serial ou UUID são obrigatórios."
}
```
**Solução**: Certifique-se de enviar `hostname` e pelo menos `hardware.serial` ou `hardware.uuid`

#### 3. **Timeout na busca de entidades**
**Solução**: A API implementa busca em blocos otimizada. Aguarde o processamento completo.

#### 4. **Fabricante/Modelo não encontrado**
**Solução**: A API cria automaticamente. Verifique logs para confirmar a criação.

### Logs Detalhados:

```bash
# Ativar logs detalhados
DEBUG=* node server.js
```

### Teste de Conectividade:

```bash
# Teste rápido de conexão
npm test
```

## 📊 Monitoramento e Logs

### Logs de Sistema:
- ✅ Sucesso na autenticação
- 📝 Criação/atualização de entidades
- 🔍 Busca e criação de fabricantes/modelos
- 💾 Operações de CRUD no GLPI

### Exemplo de Log de Sucesso:
```
✅ Conexão com a API do GLPI bem-sucedida!
Entidade 'TI - INFRAESTRUTURA' encontrada com ID: 15
✓ Modelo encontrado e será reutilizado: ID 245
Computador atualizado com ID: 1234
```

## 🤝 Integração com Sistemas Externos

### Datto RMM Integration:
A API foi projetada para receber dados do Datto RMM, incluindo:
- Links diretos para dispositivos
- Informações de conexão remota
- Dados completos de inventário

### Exemplo de Integração:

```bash
# Via cURL
curl -X POST http://localhost:3003/api/glpi/inventario \
  -H "Content-Type: application/json" \
  -d @inventario.json
```

## 🔄 Versionamento e Updates

### Versão Atual: 1.0.0

### Recursos Implementados:
- ✅ CRUD completo de computadores
- ✅ Gestão automática de entidades hierárquicas  
- ✅ Criação dinâmica de fabricantes e modelos
- ✅ Suporte a múltiplos tipos de equipamento
- ✅ Formatação inteligente de comentários
- ✅ Autenticação robusta com fallback


## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [package.json](package.json) para detalhes.

---

**Desenvolvido para integração GLPI**  
**Versão:** 1.0.0  
**Porta padrão:** 3003
