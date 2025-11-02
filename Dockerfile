# Dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy application files
COPY . .

EXPOSE 5000

CMD ["npm", "start"] 