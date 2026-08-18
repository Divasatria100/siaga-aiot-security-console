# SIAGA Frontend — React 19 + Vite 8 development image.
#
# In development the application source is bind-mounted from the host and
# node_modules is kept in the `frontend_node_modules` named volume (see
# compose.yaml). Dependencies are pre-installed at build time so the first
# `docker compose up` is fast.

FROM node:22-alpine

# Set the working directory.
WORKDIR /app

# git is used by some npm scripts / dependencies.
RUN apk add --no-cache git

# Install dependencies (cached by package-lock.json).
COPY package.json package-lock.json ./
RUN npm install

# Copy the application source. (Bind-mounted over in development.)
COPY . .

# Expose the Vite development server port.
EXPOSE 5173

# Vite must bind to 0.0.0.0 so the dev server is reachable from the host.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]