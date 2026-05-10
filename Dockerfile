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
# DATABASE_URL is needed at build time so db.ts can be imported without throwing.
# The real value is injected at runtime via .env — this dummy value is never used for queries.
RUN DATABASE_URL=mysql://build:build@localhost/build npm run build

EXPOSE 3000

# 5) Push schema, seed, start app at runtime
CMD ["sh", "-c", "npx prisma db push && npm run db:seed && npm start"]
