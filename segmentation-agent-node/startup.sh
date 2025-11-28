#!/bin/sh
echo "Starting ChainReach Segmentation API..."
cd /home/site/wwwroot
npm install --production
node dist/app.js
