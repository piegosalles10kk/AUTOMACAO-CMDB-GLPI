# 🔄 Sistema de Automação GLPI

### Coleta automática de inventário e integração com GLPI

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

**• Início Rápido    • Instalação    • Configuração    • Documentação    • Troubleshooting**


---

## 🎯 Visão Geral

Este sistema automatiza completamente o processo de coleta de inventário de dispositivos e envio para o GLPI, eliminando trabalho manual e garantindo dados sempre atualizados.

### O que o sistema faz?

```
            ┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────┐
            │   Datto     │────▶│  API Coleta  │────▶│  Automação   │────▶│   GLPI   │
            │  Acronis    │      │              │      │   Script    │      │          │
            │   GLPI      │      │  (Port 3000) │      │             │      │(Port3003)│
            └─────────────┘      └──────────────┘      └─────────────┘      └──────────┘
               Fontes de            Centraliza            Processa e           Armazena
                 Dados                Dados                 Converte           Inventário
```


### Principais Funcionalidades

- ✅ **Coleta Automática** - Busca dados de múltiplas fontes
- ✅ **Conversão Inteligente** - Adapta formato para GLPI Agent
- ✅ **Criação Dinâmica** - Cria entidades, fabricantes e modelos automaticamente
- ✅ **Retry Automático** - Até 3 tentativas em caso de falha
- ✅ **Docker Ready** - Execute tudo com um comando

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais

```
📦 Sistema de Automação GLPI
 ┣ 🔌 API de Coleta (server-de-coleta)
 ┃  ┣ Integração Datto RMM
 ┃  ┣ Integração Acronis Backup
 ┃  ┗ Integração GLPI (leitura)
 ┃
 ┣ 📨 API GLPI (server-glpi)
 ┃  ┣ Recebe inventário formatado
 ┃  ┣ Cria/atualiza computadores
 ┃  ┗ Gerencia entidades e fabricantes
 ┃
 ┗ 🤖 Script de Automação (Automacao-glpi)
    ┣ Coleta dados da API de Coleta
    ┣ Converte para formato GLPI
    ┗ Envia para API GLPI
```

---

## 💻 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Requisito | Versão Mínima | Como Verificar |
|-----------|---------------|----------------|
| **Node.js** | 18.x | `node --version` |
| **npm** | 8.x | `npm --version` |
| **Docker** (opcional) | 20.x | `docker --version` |
| **Docker Compose** (opcional) | 2.x | `docker-compose --version` |

### Acessos Necessários

- 🔑 **Datto RMM**: API Key + Secret
- 🔑 **GLPI**: URL + App Token + Usuário/Senha

---

## 🚀 Início Rápido

### Opção 1: Docker (Recomendado) - 3 passos

```bash
# 1. Clone o repositório
git clone https://github.com/piegosalles10kk/AUTOMACAO-CMDB-GLPI
cd AUTOMACAO-CMDB-GLPI

# 2. Configure os arquivos .env
cp server-de-coleta/dotenv server-de-coleta/.env
cp server-glpi/dotenv server-glpi/.env
# Edite os arquivos .env com suas credenciais

# 3. Execute tudo
docker-compose up -d --build
```

✅ **Pronto!** APIs rodando em:
- API Coleta: http://localhost:3000
- API GLPI: http://localhost:3003

### Opção 2: Manual

#### Passo 1: API de Coleta
```bash
cd server-de-coleta
cp dotenv .env
# Configure o .env
npm install
npm start
```

#### Passo 2: API GLPI
```bash
cd server-glpi
cp dotenv .env
# Configure o .env
npm install
npm start
```

#### Passo 3: Script de Automação
```bash
cd Automacao-glpi
npm install
node automacaoGlpi.js
```

---

## ⚙️ Configuração

### 1. API de Coleta (.env)

```env
PORT=3000

# Datto RMM
DATTO_BASE=https://sua-api.centrastage.net/api/v2
DATTO_KEY=sua-chave-api
DATTO_SECRET=seu-secret

# GLPI (para leitura)
GLPI_API_URL=https://seu-glpi.com/apirest.php/
GLPI_APP_TOKEN=seu-token-app
GLPI_USER_LOGIN=seu-usuario
GLPI_USER_PASSWORD=sua-senha

# Acronis (opcional)
ACRONIS_BASE_URL=https://seu-datacenter.acronis.com
ACRONIS_CLIENT_ID=seu-client-id
ACRONIS_CLIENT_SECRET=seu-client-secret
```

### 2. API GLPI (.env)

```env
PORT=3003

GLPI_API_URL=https://seu-glpi.com/apirest.php/
GLPI_APP_TOKEN=seu-token-app
GLPI_USER_LOGIN=seu-usuario
GLPI_USER_PASSWORD=sua-senha
```

### 3. URLs do Script de Automação

O arquivo `automacaoGlpi.js` já está configurado para usar:
```javascript
const ApiColeta = "http://localhost:3000/api/datto";
const GlpiApi = 'http://localhost:3003';
```

> 💡 **Dica**: Se as APIs estiverem em outros servidores, atualize essas URLs.

---

## 🎯 Como Usar

### Método 1: Windows - Duplo Clique

1. Certifique-se de que as APIs estão rodando
2. Duplo clique em: `executar-coleta.bat`
3. Aguarde o processo concluir

### Método 2: Linha de Comando

```bash
cd Automacao-glpi
node automacaoGlpi.js
```

### O que você verá:

```
--- Iniciando teste da api http://localhost:3000/api/datto ---
✅ Conexão com a API de Coleta bem-sucedida!
--- Iniciando teste da api http://localhost:3003/api/glpi/teste ---
✅ Conexão com a API bem-sucedida!

Iniciando o processo de coleta e envio de inventário para a API GLPI.
Iniciando coleta de sites...
Coleta de sites concluída. Encontrados 25 sites.
Total de dispositivos a serem processados: 156

Coletando dados detalhados para o deviceUid: abc123...
Tentativa 1 de 3...
✅ Inventário enviado com sucesso na tentativa 1.
Inventário de 'DESKTOP-JOAO' para o site 'Escritório SP' enviado.

Processo de coleta de dados e importação para a API GLPI concluído.
```

---

## 🔄 Fluxo de Execução

![Imagens do app](https://i.ibb.co/N633Rz1W/COMPLETA.png)

### Etapas do Processo

```
1. INÍCIO
   ↓
2. TESTE DE CONEXÕES
   ↓
3. APIs OK?
   ├─ Não → Erro: Verificar APIs
   └─ Sim → BUSCAR DISPOSITIVOS
              ↓
4. PARA CADA DISPOSITIVO:
   ├─ Coletar Dados Detalhados
   ├─ Converter para Formato GLPI
   ├─ Enviar para API GLPI
   └─ Sucesso?
      ├─ Não → Tentar novamente (até 3x)
      └─ Sim → Próximo Dispositivo
                ↓
5. FIM
```


### Detalhamento das Etapas

| Etapa | Descrição | Tempo Médio |
|-------|-----------|-------------|
| 1️⃣ **Teste de Conexões** | Verifica se APIs estão online | ~2 segundos |
| 2️⃣ **Coleta de Dispositivos** | Busca lista completa do Datto | ~5-10 segundos |
| 3️⃣ **Processamento** | Para cada dispositivo, coleta detalhes e envia | ~2-5 seg/dispositivo |
| 4️⃣ **Finalização** | Exibe resumo e estatísticas | ~1 segundo |

### Tradução dos campos entre api

![Imagens do app](https://i.ibb.co/ccLtFsDq/tradutor.png)

---

## 🔗 Endpoints da API

### API de Coleta (Port 3000)

#### Datto RMM

**Listar todos os dispositivos**
```http
GET /api/datto/devices
```

**Dados de auditoria do dispositivo**
```http
GET /api/datto/audit/device/{deviceUid}
```

**Software instalado**
```http
GET /api/datto/audit/device/{deviceUid}/software
```

**Exemplo de resposta:**
```json
{
  "uid": "12345-abcde",
  "hostname": "DESKTOP-001",
  "siteName": "Escritório SP",
  "operatingSystem": "Windows 11 Pro",
  "ipAddress": "192.168.1.100"
}
```

#### GLPI

**Buscar tickets**
```http
GET /api/glpi/search/{status}/{entityName}
```

**Exemplo:**
```http
GET /api/glpi/search/10/TI
```

Status disponíveis:
- `10` - Todos abertos (1,2,3,4)
- `1` - Novo
- `2` - Em andamento
- `3` - Pendente
- `4` - Resolvido
- `5` - Fechado

### API GLPI (Port 3003)

#### Teste de Conexão

```http
GET /api/glpi/teste
```

**Resposta:**
```json
{
  "success": true,
  "message": "Conexão com a API do GLPI bem-sucedida!",
  "token": "session-token-here"
}
```

#### Criar/Atualizar Inventário

```http
POST /api/glpi/inventario
```

**Payload de exemplo:**
```json
{
  "entities": [{
    "hostname": "DESKTOP-ABC123",
    "entity_name": "Escritório Principal",
    "osname": "Windows 11 Pro",
    "domain": "EMPRESA.LOCAL",
    "hardware": {
      "uuid": "12345-abcde",
      "serial": "SN123456",
      "manufacturer": "Dell Inc.",
      "model": "OptiPlex 7090",
      "memorysize": 17179869184,
      "processors": [
        {
          "name": "Intel Core i7-11700",
          "cores": 8
        }
      ],
      "networks": [
        {
          "description": "Intel Ethernet",
          "mac_address": "AA:BB:CC:DD:EE:FF",
          "ipv4_addresses": ["192.168.1.100"]
        }
      ]
    }
  }]
}
```

---

## 🤖 Automação

### Windows - Agendador de Tarefas

1. Abra o **Agendador de Tarefas do Windows**
2. Clique em **Criar Tarefa Básica**
3. Configure:
   - **Nome**: "Coleta GLPI"
   - **Gatilho**: Diariamente às 8:00
   - **Ação**: Iniciar programa
   - **Programa**: `C:\caminho\para\executar-coleta.bat`

### Linux - Cron Job

```bash
# Editar crontab
crontab -e

# Adicionar linha (executa todo dia às 8h)
0 8 * * * cd /caminho/Automacao-glpi && node automacaoGlpi.js >> /var/log/glpi-auto.log 2>&1

# Ou a cada 6 horas
0 */6 * * * cd /caminho/Automacao-glpi && node automacaoGlpi.js >> /var/log/glpi-auto.log 2>&1
```

### Docker - Scheduled Task

```yaml
# docker-compose.yml
services:
  automation:
    image: node:20
    volumes:
      - ./Automacao-glpi:/app
    working_dir: /app
    command: sh -c "while true; do node automacaoGlpi.js; sleep 21600; done"
    # Executa a cada 6 horas (21600 segundos)
```

---

## 📊 Monitoramento

### Como verificar se está funcionando?

#### 1. Verificar APIs Online
```bash
# Teste API de Coleta
curl http://localhost:3000

# Teste API GLPI
curl http://localhost:3003/api/glpi/teste
```

#### 2. Verificar Logs
```bash
# Logs do Docker
docker-compose logs -f

# Logs do script (se salvou em arquivo)
tail -f /var/log/glpi-automation.log
```

#### 3. Verificar no GLPI
- Acesse seu GLPI
- Vá em **Ativos > Computadores**
- Verifique se os dispositivos foram criados/atualizados

### Indicadores de Sucesso

- ✅ APIs respondem nos endpoints de teste
- ✅ Logs mostram "✅ Inventário enviado com sucesso"
- ✅ Computadores aparecem atualizados no GLPI
- ✅ Nenhum erro "🚨" nos logs

---

## 🔧 Troubleshooting

### Problema 1: APIs não respondem

```
❌ Falha na conexão com a API
```

**Soluções:**
1. Verifique se as APIs estão rodando:
   ```bash
   docker-compose ps
   ```
2. Confirme as URLs no `.env`
3. Teste manualmente:
   ```bash
   curl http://localhost:3000
   curl http://localhost:3003/api/glpi/teste
   ```

### Problema 2: Credenciais inválidas

```
❌ Falha na autenticação
```

**Soluções:**
1. Verifique usuário/senha no `.env`
2. Confirme se o App Token está correto
3. Teste login manual no GLPI
4. Verifique se o usuário tem permissões corretas

### Problema 3: Nenhum dispositivo encontrado

```
Nenhum dispositivo encontrado. Encerrando o processo.
```

**Soluções:**
1. Verifique se há dispositivos no Datto
2. Confirme credenciais do Datto no `.env`
3. Teste manualmente:
   ```bash
   curl http://localhost:3000/api/datto/devices
   ```

### Problema 4: Falha no envio após 3 tentativas

```
🚨 Não foi possível enviar o inventário após 3 tentativas
```

**Soluções:**
1. Verifique se a API GLPI está rodando
2. Confirme conectividade de rede
3. Veja logs de erro detalhados
4. Verifique se o formato do payload está correto

### Problema 5: Docker não inicia

```
Error response from daemon: port is already allocated
```

**Soluções:**
1. Verifique se as portas 3000 e 3003 estão livres:
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :3003
   ```
2. Pare processos usando essas portas
3. Ou altere as portas no `docker-compose.yml`

---

## 📁 Estrutura de Pastas

```
AUTOMACAO-CMDB-GLPI/
│
├── README.md                      # Este arquivo
├── docker-compose.yml             # Orquestração Docker
├── executar-coleta.bat           # Script Windows
│
├── server-de-coleta/             # API de Coleta
│   ├── .env                      # Configurações (criar)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── src/
│   │   ├── controllers/          # Lógica das rotas
│   │   ├── routes/               # Definição de rotas
│   │   ├── services/             # Integração APIs externas
│   │   └── tests/                # Testes de conexão
│   └── README.md
│
├── server-glpi/                  # API GLPI
│   ├── .env                      # Configurações (criar)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── controllers/              # Lógica de inventário
│   ├── services/                 # Autenticação GLPI
│   ├── glpiRoutes/              # Rotas da API
│   ├── testes/                  # Testes de conexão
│   └── README.md
│
└── Automacao-glpi/               # Script de Automação
    ├── automacaoGlpi.js          # Script principal
    ├── package.json
    └── README.md
```

---

## 📝 Changelog

### Versão 1.0.0 (Atual)
- ✨ Primeira versão estável
- 🔌 Integração completa Datto + GLPI
- 🐳 Suporte Docker
- 🔄 Sistema de retry automático
- 📊 Logs detalhados

---


## 📞 Suporte

Encontrou algum problema? Precisa de ajuda?

1. 📖 Verifique a seção [Troubleshooting](#-troubleshooting)
2. 🔍 Procure em Issues existentes
3. 💬 Abra uma Nova Issue

---

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido por Piego**

**Última atualização**: Setembro 2025


