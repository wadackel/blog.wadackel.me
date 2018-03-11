#!/bin/sh

# Install Hugo
wget https://github.com/gohugoio/hugo/releases/download/v0.37/hugo_0.37_Linux-64bit.tar.gz
tar -xzf hugo_0.37_Linux-64bit.tar.gz
sudo mv hugo /usr/local/bin/

# Build Hugo, And frontend resources
yarn build

# Deploy
rsync -av --delete --omit-dir-times -e "ssh -p $DEPLOY_PORT" ./public/ $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR >/dev/null 2>&1
