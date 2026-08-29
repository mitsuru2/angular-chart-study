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
# - locales: The slim base image only ships the C/POSIX/C.UTF-8 locales. VS Code's
#            Dev Containers extension forwards the host locale (en_US.UTF-8) to the
#            integrated terminal, which otherwise fails with "setlocale" warnings.
# - iptables/ipset/dnsutils/jq: Required by .devcontainer / scripts/init-firewall.sh to
#            restrict outbound network access to an allowlist (github.com, anthropic.com)
#            for Claude Code sessions.
# - gnupg: Required to import the GitHub CLI apt repository signing key below.
# Note: After installing packages, we clean up the apt cache to reduce the image size.
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    curl \
    ca-certificates \
    locales \
    gnupg \
    iptables \
    ipset \
    dnsutils \
    jq \
    && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
    && locale-gen \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI (gh).
# Official install instructions: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

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

# Install Playwright's Chromium browser binary and its OS-level dependencies for E2E
# testing (see playwright.config.ts / e2e/). Only chromium is installed since this is a
# personal study project (see playwright.config.ts, which only defines a chromium
# project). This must run as the 'node' user (the devcontainer's remoteUser) so the
# browser lands in node's cache dir (~/.cache/ms-playwright) where `npx playwright test`
# looks for it at runtime; '--with-deps' uses the passwordless sudo configured above to
# apt-get install the required shared libraries (fonts, libnss3, etc.).
RUN npx playwright install --with-deps chromium
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