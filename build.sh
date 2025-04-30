#!/bin/bash
###
 # @Author: 陈杰 jie.chen06@hand-china.com
 # @Date: 2024-01-26 10:46:04
 # Copyright (c) 2024, All Rights Reserved. 
### 
source /etc/profile

git pull
yarn build:ms-prod-app01

version=`date '+%Y%m%d%H%M'`
svc_name=cmhk-front-core

sudo docker login -u cmhk-erp-scm-cmi-gnc-admin -p B45DAD4AADB05157DE61506D4107835B 172.22.139.11:1121
sudo docker build -t 172.22.139.11:1121/cmhk-scm/${svc_name}-prod:pj-${version} .
sudo docker push 172.22.139.11:1121/cmhk-scm/${svc_name}-prod:pj-${version}
sudo docker rmi 172.22.139.11:1121/cmhk-scm/${svc_name}-prod:pj-${version}

echo "镜像上传成"
