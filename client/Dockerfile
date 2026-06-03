FROM node:22-alpine

WORKDIR /workspace

# Install dependencies first for caching
COPY package.json ./
RUN npm install

# Copy application files
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
