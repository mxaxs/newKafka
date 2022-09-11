#!/bin/sh
echo "Copying files to server"
ssh root@159.223.109.172 /
# Copy files from local to server
scp -r -P 22 docker-compose.yml root@159.223.109.172:/opt/app/ /
scp -r -P 22 docker-compose.env root@159.223.109.172:/opt/app/ /
scp -r -P 22 public root@159.223.109.172:/opt/app/ /
scp -r -P 22 services root@159.223.109.172:/opt/app/ /
scp -r -P 22 moleculer.config.js root@159.223.109.172:/opt/app/ /
scp -r -P 22 package.json root@159.223.109.172:/opt/app/ /
scp -r -P 22 package-lock.json root@159.223.109.172:/opt/app/ /
scp -r -P 22 Dockerfile root@159.223.109.172:/opt/app/ /
scp -r -P 22 Dockerfile root@159.223.109.172:/opt/app/ /

echo "Files copied to server"

