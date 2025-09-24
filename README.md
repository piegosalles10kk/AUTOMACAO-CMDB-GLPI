# Guia de Uso - Sistema de Automação GLPI

Este guia mostra como instalar e usar o sistema completo de automação para coleta de dados e envio automático ao GLPI.

## 📋 O que é este sistema?

Este sistema coleta dados de dispositivos automaticamente e os envia para o GLPI (sistema de gestão de ativos), organizando inventário de computadores, servidores e equipamentos de rede.

**Componentes:**
- **API de Coleta**: Busca dados de dispositivos (Datto, Acronis, GLPI)
- **API GLPI**: Recebe e processa inventário no GLPI
- **Script de Automação**: Conecta tudo e executa o processo

## 🚀 Instalação Rápida

### Pré-requisitos
- **Node.js** instalado (versão 18 ou superior)
- **Docker** (opcional, mas recomendado)
- **Acesso às APIs** (Datto, GLPI, etc.)

### Opção 1: Usando Docker (Recomendado)

1. **Baixe ou clone o projeto**
```bash
git clone https://github.com/piegosalles10kk/automacao-cmdb-glpi
cd automacao-cmdb-glpi
```

2. **Configure as variáveis de ambiente**
   - Na pasta `server-de-coleta`: copie `dotenv` para `.env` e configure
   - Na pasta `server-glpi`: copie `dotenv` para `.env` e configure

3. **Execute tudo com um comando**
```bash
docker-compose up -d --build
```

✅ **Pronto!** As APIs estarão rodando:
- API de Coleta: `http://localhost:3000`  
- API GLPI: `http://localhost:3003`

### Opção 2: Instalação Manual

1. **Instale as APIs separadamente**

**API de Coleta:**
```bash
cd server-de-coleta
cp dotenv .env
# Configure o .env com suas credenciais
npm install
npm start
```

**API GLPI:**
```bash
cd server-glpi  
cp dotenv .env
# Configure o .env com suas credenciais
npm install
npm start
```

2. **Script de Automação:**
```bash
cd Automacao-glpi
npm install
```

## ⚙️ Configuração

### 1. API de Coleta (.env)
```env
PORT=3000

# Datto RMM
DATTO_BASE=https://sua-api.centrastage.net/api/v2
DATTO_KEY=sua-chave-api
DATTO_SECRET=seu-secret

# GLPI (para buscar dados)
GLPI_API_URL=https://seu-glpi.com/apirest.php/
GLPI_APP_TOKEN=seu-token-app
GLPI_USER_LOGIN=seu-usuario
GLPI_USER_PASSWORD=sua-senha

# Acronis (implementação futura)
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

## 🎯 Como Usar

### Método 1: Script Automático (Windows)
1. **Execute o arquivo bat**
```
double-click em: executar-coleta.bat
```
Este arquivo vai:
- Instalar dependências automaticamente
- Executar o script de coleta
- Mostrar o progresso na tela

### Método 2: Comando Manual
1. **Na pasta Automacao-glpi**
```bash
cd Automacao-glpi
node automacaoGlpi.js
```


## 📊 O que acontece durante a execução

### 1. **Teste de Conexões**
```
--- Iniciando teste da api http://localhost:3000/api/datto ---
✅ Conexão com a API de Coleta bem-sucedida!
--- Iniciando teste da api http://localhost:3003/api/glpi/teste ---
✅ Conexão com a API bem-sucedida!
```

### 2. **Coleta de Dados**
```
Iniciando coleta de sites...
Coleta de sites concluída. Encontrados 25 sites.
Total de dispositivos a serem processados: 156
```

### 3. **Processamento por Dispositivo**
```
Coletando dados detalhados para o deviceUid: 12345...
Tentativa 1 de 3...
✅ Inventário enviado com sucesso na tentativa 1.
Inventário de 'DESKTOP-JOAO' para o site 'Escritório SP' enviado com sucesso.
```

### 4. **Finalização**
```
Processo de coleta de dados e importação para a API GLPI concluído.
```

## ✅ Verificando se Funcionou

### 1. **Verificar APIs Online**
- Abra `http://localhost:3000` (deve mostrar que a API está funcionando)
- Abra `http://localhost:3003/api/glpi/teste` (deve mostrar conexão ok com GLPI)

### 2. **Verificar no GLPI**
- Acesse seu GLPI
- Vá em **Ativos > Computadores**
- Veja se os dispositivos foram criados/atualizados

### 3. **Logs de Sucesso**
Durante a execução, você deve ver:
- ✅ Conexões bem-sucedidas
- ✅ Dispositivos processados
- ✅ Inventários enviados

## ⚠️ Problemas Comuns e Soluções

### 🔴 APIs não respondem
**Sintoma:**
```
❌ Falha na conexão com a API
```
**Solução:**
1. Verifique se as APIs estão rodando (`docker-compose up`)
2. Confirme as URLs no arquivo `.env`
3. Teste acesso manual às URLs

### 🔴 Credenciais inválidas
**Sintoma:**
```
❌ Falha na autenticação com a API do GLPI
```
**Solução:**
1. Verifique usuário/senha no `.env`
2. Confirme se o App Token está correto
3. Teste login manual no GLPI

### 🔴 Nenhum dispositivo encontrado
**Sintoma:**
```
Nenhum dispositivo encontrado. Encerrando o processo.
```
**Solução:**
1. Verifique se há dispositivos no Datto
2. Confirme credenciais do Datto no `.env`
3. Teste manualmente: `http://localhost:3000/api/datto/devices`

### 🔴 Falha no envio
**Sintoma:**
```
🚨 Não foi possível enviar o inventário após 3 tentativas
```
**Solução:**
1. Verifique se a API GLPI está rodando
2. Confirme conectividade de rede
3. Veja logs de erro detalhados

## 🔄 Automatização

### Para Windows (Agendador de Tarefas)
1. Abra o **Agendador de Tarefas**
2. Crie nova tarefa
3. Configure para executar: `C:\caminho\executar-coleta.bat`
4. Defina horário (ex: todo dia às 8h)

### Para Linux (Cron)
```bash
# Execute a cada 6 horas
0 */6 * * * cd /caminho/Automacao-glpi && node automacaoGlpi.js >> /var/log/glpi-automation.log 2>&1
```

## 📁 Estrutura de Pastas

```
projeto/
├── docker-compose.yml          # Executa tudo com Docker
├── executar-coleta.bat         # Script Windows
├── server-de-coleta/           # API de coleta de dados
│   ├── .env                   # Configurações
│   └── server.js              # Servidor
├── server-glpi/               # API GLPI
│   ├── .env                   # Configurações  
│   └── server.js              # Servidor
└── Automacao-glpi/            # Script principal
    ├── automacaoGlpi.js       # Script que faz tudo
    └── package.json           # Dependências
```

## 🚀 Fluxo Completo de Uso

### 1. **Primeira Execução**
```bash
# 1. Configure os .env de cada pasta
# 2. Execute as APIs
docker-compose up -d --build

# 3. Execute a coleta
cd Automacao-glpi
node automacaoGlpi.js
```

### 2. **Uso Diário**
```bash
# Apenas execute a coleta (APIs já estão rodando)
double-click em: executar-coleta.bat
```

### 3. **Verificação**
- Acesse GLPI e veja os computadores atualizados
- Confira logs para identificar problemas
- Monitore status das APIs

## 🎯 Dicas de Uso

### ✅ **Boas Práticas**
- Execute primeiro manualmente para testar
- Configure agendamento após confirmar funcionamento  
- Mantenha backups dos arquivos `.env`
- Monitore logs regularmente

### ⚡ **Otimização**
- Execute durante horários de menor uso
- Configure para rodar 1-2x por dia
- Use Docker para melhor estabilidade

### 🔍 **Monitoramento**
- Verifique se APIs estão online: `http://localhost:3000` e `http://localhost:3003`
- Acompanhe logs durante execução
- Confirme atualizações no GLPI

## 📞 Resumo Rápido

1. **Instalar**: `docker-compose up -d --build`
2. **Configurar**: Editar arquivos `.env` com suas credenciais
3. **Executar**: Double-click em `executar-coleta.bat` ou `node automacaoGlpi.js`
4. **Verificar**: Acessar GLPI e ver computadores atualizados

**URLs importantes:**
- API Coleta: http://localhost:3000
- API GLPI: http://localhost:3003
- Teste GLPI: http://localhost:3003/api/glpi/teste

**Pronto! Seu sistema estará coletando e enviando inventário automaticamente para o GLPI!** 🎉
