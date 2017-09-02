#!/bin/sh

# Install Hugo
wget https://github.com/gohugoio/hugo/releases/download/v0.26/hugo_0.26_Linux-64bit.tar.gz
tar -xzf hugo_0.26_Linux-64bit.tar.gz
sudo mv hugo /usr/local/bin/

# Build Hugo, And frontend resources
yarn run build

# Deploy
sudo apt install rsync
rsync -av --delete --omit-dir-times -e "ssh -p ${DEPLOY_PORT}" ./public/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}

