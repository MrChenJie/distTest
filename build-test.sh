#!/bin/bash
source /etc/profile

git pull
yarn build:ms-test

version=`date '+%Y%m%d%H%M'`
svc_name=cmhk-front-core

docker login -u cmhk-erp-scm-cmi-gnc-admin -p F59BC5F22FC254675510907401485037 172.22.196.11:1121
docker build -t 172.22.196.11:1121/cmhk-scm/${svc_name}-uat:pj-${version} .
docker push 172.22.196.11:1121/cmhk-scm/${svc_name}-uat:pj-${version}
docker rmi 172.22.196.11:1121/cmhk-scm/${svc_name}-uat:pj-${version}

echo "镜像上传成功"
