# syntax=docker/dockerfile:1

# Use latest LTS version of Node.js on Debian.
# You can check the latest versions on the following links:
# - Docker Hub (Node.js): https://hub.docker.com/_/node
# - Node.js: https://nodejs.org/ja/about/previous-releases
# - Debian: https://wiki.debian.org/DebianReleases#Current_Debian_Releases_and_repositories
FROM node:26-trixie-slim

# Install OS-level dependencies.
# - Git: It should be installed to use git commands in container or via VSCode remote 
#        development extension.
# Note: After installing packages, we clean up the apt cache to reduce the image size.
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable sudo command to user 'node' w/o password.
# mkdir -p: Create all intermediate directories at once.
# /etc/sudoers.d: Directory to store configurations for each super user.
# 0440: The 'sudo' command ignores files with permissions other than 0440.
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

# Working directory in the container. This is where your application code will be located.
# '/app' is a common convention, but you can choose any directory name you prefer.
WORKDIR /app

# Change owner of the workspace to enable processing at Dev Container.
# --> Refer to .devcontainer/devcontainer.json.
RUN chown -R node:node /app

# Copy package.json and package-lock.json to the working directory, and install packages.
# DON'T use 'npm install' to prevent installing unintended latest versions of packages
# as Angular has very sensitive version dependencies.
COPY --chown=node:node package*.json ./
USER node
RUN npm ci
USER root

# DON'T copy the source code to the image because it's be mounted when the container running.
# COPY . .

# Mark that the container listen on following ports.
# DON'T FORGET to specify -p options when running the container to map these ports to your host machine.
# 4200: Angular development server port.
EXPOSE 4200 4000

# Build the application. 
# CMD ["npm", "run", "build"]
CMD ["sleep", "infinity"]

# Start the application. (disabled)
# Added --host 0.0.0.0 to allow access from outside the container.
# CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]

# ---- STAGE 2: runtime ----
# Stage 2 is separated into Dockerfile.release as the build environment is different.