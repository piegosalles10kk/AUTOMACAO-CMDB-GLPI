# Automação GLPI - Integração com API Datto

Este projeto automatiza a coleta de dados de inventário da API Datto e os envia para uma API GLPI personalizada, convertendo os dados para o formato compatível com o GLPI Agent.

## 📋 Pré-requisitos

- Node.js (versão 12 ou superior)
- npm (Node Package Manager)
- Acesso às APIs:
  - API de Coleta Datto (rodando em `http://localhost:3000`)
  - API GLPI de post (rodando em `http://localhost:3003`)

## 🚀 Instalação

### 1. Clone ou baixe o projeto
```bash
# Se usando Git
git clone <url-do-repositorio>
cd <nome-da-pasta>
```

### 2. Instale as dependências
```bash
npm install
```

As seguintes dependências serão instaladas automaticamente:
- `axios` - Para requisições HTTP
- `dotenv` - Para gerenciamento de variáveis de ambiente

### 3. Configure as variáveis de ambiente (opcional)
Crie um arquivo `.env` na raiz do projeto se precisar de configurações específicas:
```env
# Exemplo de configurações (se necessário)
DATTO_API_URL=http://localhost:3000/api/datto
GLPI_API_URL=http://localhost:3003
```

## ⚙️ Configuração

### URLs das APIs
No arquivo `automacaoGlpi.js`, verifique se as URLs estão corretas:

```javascript
// API de Coleta (Datto)
const ApiColeta = "http://localhost:3000/api/datto";

// API GLPI
const GlpiApi = 'http://localhost:3003';
```

### Estrutura dos Endpoints
O script espera os seguintes endpoints funcionando:

**API Datto:**
- `GET /api/datto/devices` - Lista todos os dispositivos
- `GET /api/datto/audit/device/{deviceUid}` - Dados de auditoria do dispositivo
- `GET /api/datto/audit/device/{deviceUid}/software` - Lista de software do dispositivo

**API GLPI:**
- `GET /api/glpi/teste` - Endpoint de teste
- `POST /api/glpi/inventario` - Endpoint para receber inventários

## 🎯 Como Usar

### 1. Verifique a conectividade
Antes de executar o script principal, certifique-se de que ambas as APIs estão funcionando:

```bash
# Execute o script para testar as conexões
node automacaoGlpi.js
```

O script fará um teste inicial das APIs e mostrará:
- ✅ Conexão bem-sucedida
- ❌ Falha na conexão (verifique as APIs)

### 2. Execute o script completo
```bash
npm start
# ou
node automacaoGlpi.js
```

### 3. Monitore a execução
O script irá:

1. **Testar as conexões** com ambas as APIs
2. **Coletar dispositivos** da API Datto
3. **Para cada dispositivo:**
   - Coletar dados detalhados (auditoria e software)
   - Converter para formato GLPI
   - Enviar para a API GLPI (com até 3 tentativas)
4. **Exibir resultados** de cada operação

## 📊 Saída Esperada

Durante a execução, você verá logs como:

```
--- Iniciando teste da api http://localhost:3000/api/datto ---
✅ Conexão com a API de Coleta http://localhost:3000/api/datto bem-sucedida!
--- Iniciando teste da api http://localhost:3003/api/glpi/teste ---
✅ Conexão com a API http://localhost:3003/api/glpi/teste bem-sucedida!

Iniciando o processo de coleta e envio de inventário para a API GLPI.
Iniciando coleta de sites...
Coleta de sites concluída. Encontrados X sites.
Total de dispositivos a serem processados: X

Coletando dados detalhados para o deviceUid: XXXXX
Tentativa 1 de 3...
✅ Inventário enviado com sucesso na tentativa 1.
Inventário de 'hostname' para o site 'siteName' enviado com sucesso.
```

## 🔧 Estrutura de Dados

### Formato de Entrada (Datto)
O script espera dados no formato:
```json
{
  "uid": "device-unique-id",
  "hostname": "computer-name",
  "siteName": "client-site-name",
  "operatingSystem": "Windows 10",
  "domain": "domain.com",
  "deviceType": {
    "category": "Computer",
    "type": "Desktop"
  }
}
```

### Formato de Saída (GLPI)
Os dados são convertidos para o formato GLPI Agent:
```json
{
  "inventory_id": "device-unique-id",
  "version": "1.x",
  "entities": [{
    "entity_name": "client-site-name",
    "hostname": "computer-name",
    "hardware": {
      "uuid": "device-unique-id",
      "networks": [...],
      "processors": [...],
      "storages": [...],
      "software": [...]
    }
  }]
}
```

## 🐛 Solução de Problemas

### APIs não respondem
```
❌ Falha na conexão com a API
```
**Solução:** Verifique se as APIs estão rodando nas URLs corretas.

### Falha no envio do inventário
```
🚨 Atenção: Não foi possível enviar o inventário após 3 tentativas
```
**Soluções:**
- Verifique a conectividade de rede
- Confirme se a API GLPI está aceitando requisições POST
- Verifique os logs de erro para mais detalhes

### Nenhum dispositivo encontrado
```
Nenhum dispositivo encontrado. Encerrando o processo.
```
**Solução:** Verifique se a API Datto está retornando dispositivos no endpoint `/devices`.

### Dispositivos ignorados
```
Dispositivo com UID ou nome de site ausente. Ignorando
```
**Solução:** Certifique-se de que os dispositivos tenham os campos `uid` e `siteName` preenchidos.

## 📁 Estrutura do Projeto

```
├── automacaoGlpi.js    # Script principal
├── package.json        # Configurações e dependências
├── package-lock.json   # Lock das versões das dependências
├── .gitignore         # Arquivos ignorados pelo Git
└── .env               # Variáveis de ambiente (opcional)
```

## 🔄 Fluxo de Execução

1. **Inicialização:** Testa conexão com ambas as APIs
2. **Coleta:** Busca lista completa de dispositivos da API Datto
3. **Processamento:** Para cada dispositivo:
   - Coleta dados detalhados (auditoria + software)
   - Converte para formato GLPI
   - Envia para API GLPI com retry automático
4. **Finalização:** Exibe resumo do processo

## 📝 Logs e Monitoramento

O script fornece logs detalhados para monitoramento:
- ✅ Operações bem-sucedidas
- ❌ Falhas e erros
- 🚨 Alertas importantes
- Contadores de tentativas e dispositivos processados


## 📞 Suporte

Em caso de problemas:
1. Verifique os logs de erro detalhados
2. Confirme se todas as APIs estão funcionando
3. Valide se os dados estão no formato esperado
4. Teste a conectividade de rede entre os serviços
