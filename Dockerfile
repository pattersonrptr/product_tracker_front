# Etapa de build
FROM node:20.19.1 AS builder

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante da aplicação
COPY . .

# Build da aplicação
RUN npm run build

# Etapa final para servir os arquivos
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos do build para o Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copia configuração customizada do Nginx, se quiser (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expõe a porta
EXPOSE 80

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]
