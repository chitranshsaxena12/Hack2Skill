# FROM node:20-alpine AS runtime

# WORKDIR /app

# ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --chown=nextjs:nodejs ./.next/standalone ./
# COPY --chown=nextjs:nodejs ./.next/static ./.next/static
# USER nextjs

# EXPOSE 8080

# ENV PORT 8080

# CMD ["node", "server.js"]


## Dockerfile Examples

### 1. Voice Chat Backend (`voice_chat_backend/Dockerfile`)

FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]


### 2. Risk Production (`risk_production/Dockerfile`)

FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["sh", "-c", "python predict_maternal_risk.py & python predict_neonatal_risk.py"]


### 3. Neonatal Cry Analyzer (`neonatal/Dockerfile`)

FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5002
CMD ["python", "cry_analyzer_service.py"]


### 4. Frontend (`frontend/Dockerfile`)

FROM node:18
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
