# Usa uma imagem base Node.js
FROM node:20-slim

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia o código da aplicação do subdiretório para o diretório de trabalho
# O EasyPanel já clonou o repositório, então copiamos o que está no subdiretório
COPY zaia-marcha-bridge/package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY zaia-marcha-bridge/ .

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Define o comando de inicialização
CMD ["npm", "start"]
