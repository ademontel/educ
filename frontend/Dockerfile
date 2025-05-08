FROM node:18

WORKDIR /app

COPY package*.json ./

# Clean install dependencies, force platform-specific packages
RUN npm cache clean --force && \
    npm install --force && \
    npm rebuild

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]