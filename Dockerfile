FROM node:20

WORKDIR /app

# 1) Install dependencies
COPY package*.json ./
RUN npm install

# 2) Copy source and prisma schema
COPY . .

# 3) Generate Prisma client
RUN npx prisma generate

# 4) Build Next.js app
RUN npm run build

EXPOSE 3000

# 5) Push schema, seed, start app at runtime
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run db:seed && npm start"]
