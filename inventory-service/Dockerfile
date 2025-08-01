# Temel image
FROM node:20-alpine

# Çalışma dizini oluştur
WORKDIR /app

# package.json ve lock dosyasını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Diğer dosyaları kopyala
COPY . .

# (Eğer TypeScript kullanıyorsan)
# RUN npm run build

# Uygulamayı başlat
CMD ["npm", "run", "start:dev"]
