# Use a imagem oficial do Node.js como base
FROM node:20

# Crie e defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie os arquivos package.json e package-lock.json
# Use este passo para aproveitar o cache do Docker, acelerando builds futuros
COPY package*.json ./

# Instale as dependências da aplicação
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta que a aplicação escuta
EXPOSE 3003

# Defina o comando para rodar a aplicação
CMD ["node", "server.js"]