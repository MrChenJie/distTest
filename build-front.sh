#!/usr/bin/env bash
# by haohan.yuan 20200630

# jenkins 脚本文件

set -e # 报错不继续执行

export BASE_PATH=BUILD_BASE_PATH
export API_HOST=BUILD_API_HOST
export CLIENT_ID=BUILD_CLIENT_ID
export WEBSOCKET_HOST=BUILD_WEBSOCKET_HOST
export PLATFORM_VERSION=BUILD_PLATFORM_VERSION
#export BPM_HOST=BUILD_BPM_HOST
export IM_ENABLE=BUILD_IM_ENABLE

# $UPDATE_MICRO_MODULES UPDATE_MICRO_MODULES 变量如果存在值的话就 增量更新微前端子模块。

if  [[ $UPDATE_MICRO_MODULES =~ "ALL" ]] || [[ ! -n "$UPDATE_MICRO_MODULES" ]] ;then
    echo 编译子模块
    #rm -rf yarn.lock
    yarn install
    yarn run build:dll
    yarn run transpile # 编译子模块
    yarn build
else
    echo 增量编译子模块 $UPDATE_MICRO_MODULES
    yarn run build:ms $UPDATE_MICRO_MODULES
fi

rm -rf ./html
cp -r ./dist ./html

export BUILD_BASE_PATH=/
#export BUILD_API_HOST=https://scm-uat.cmhktry.com:8082
export BUILD_API_HOST=https://scm-uat.cmhktry.com:8082
export BUILD_CLIENT_ID=localhost
export BUILD_WFP_EDITOR=""
export BUILD_WEBSOCKET_HOST=ws://192.168.16.152:8120
export BUILD_PLATFORM_VERSION=SAAS
#export BUILD_BPM_HOST=http://bpm.jd1.jajabjbj.top
export BUILD_IM_ENABLE=false
export BUILD_IM_WEBSOCKET_HOST=ws://192.168.16.152:9876

find ./html -name '*.js' | xargs sed -i "s BUILD_BASE_PATH $BUILD_BASE_PATH g"
find ./html -name '*.js' | xargs sed -i "s BUILD_API_HOST $BUILD_API_HOST g"
find ./html -name '*.js' | xargs sed -i "s BUILD_CLIENT_ID $BUILD_CLIENT_ID g"
find ./html -name '*.js' | xargs sed -i "s BUILD_BPM_HOST $BUILD_BPM_HOST g"
find ./html -name '*.js' | xargs sed -i "s BUILD_WFP_EDITOR $BUILD_WFP_EDITOR g"
find ./html -name '*.js' | xargs sed -i "s BUILD_WEBSOCKET_HOST $BUILD_WEBSOCKET_HOST g"
find ./html -name '*.js' | xargs sed -i "s BUILD_PLATFORM_VERSION $BUILD_PLATFORM_VERSION g"
