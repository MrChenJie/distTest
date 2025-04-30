pipeline {
    agent any

    options {
         skipDefaultCheckout(false)  // 禁止自动清理和克隆
    }

    environment {
        // 定义环境变量
//         GIT_REPO = 'https://code.choerodon.com.cn/hand-301117-cmhk/cmhk-register.git'
        HARBOR_URL = '192.168.0.218:5000'
//         HARBOR_PROJECT = 'cmhk-uat'
        DOCKER_CREDENTIALS_ID = 'harbor'
        GIT_CREDENTIALS_ID = 'git43346'
//         BRANCH = 'uat'
        DOCKERFILE_PATH = "Dockerfile" // 新增Dockerfile路径变量
//         PORT = '8000'
//         TARGET_SERVERS = '10.0.59.41,10.0.59.45'
        SSH_CREDENTIALS_ID = 'SSH'
        // 固定文件路径
//         ENV_FILE = '/app-data/jenkins-env/cmhk_uat.env'
        PATH = "/usr/bin:$PATH"
    }

    stages {
        stage('Validate Env File') {
            steps {
                script {
                    // 检查文件是否存在
                    if (!fileExists(params.ENV_FILE)) {
                        error "环境变量文件不存在: ${params.ENV_FILE}"
                    }

                    // 验证文件内容（调试用）
                    sh """
                        echo "===== 环境变量文件内容 ====="
                        cat ${params.ENV_FILE} | grep -v '^#' | head -n 10
                        echo "..."
                        echo "============================"
                    """
                }
            }
        }

        stage('Check Versions') {
              steps {
                  sh 'node -v'
                  sh 'yarn -v'
              }
        }


        stage('Prepare Image Name') {
                steps {
                    script {
                        // 生成时间戳：年月日时分（例如202504021110）
                        def dateTime = new Date().format('yyyyMMddHHmm', TimeZone.getTimeZone('Asia/Shanghai'))
                        // 组合完整镜像名称
                        env.IMAGE_NAME = "${env.HARBOR_URL}/${params.HARBOR_PROJECT}/${params.POD_NAME}:${dateTime}"
                        env.IMAGE_NAME_RMI = "${env.HARBOR_URL}/${params.HARBOR_PROJECT}/${params.POD_NAME}"
                        echo "Generated image name: ${env.IMAGE_NAME}"
                    }
                }
        }


        stage('Checkout') {
            steps {
//                 deleteDir()  // 确保清空之前的缓存，避免 fetch 被使用
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "${params.BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${params.GIT_REPO}",
                        credentialsId: "${env.GIT_CREDENTIALS_ID}"
                    ]],
                    extensions: [
                        [$class: 'CloneOption',
                         noTags: true,
                         shallow: true,
                         depth: 1,
                         honorRefspec: true]
                    ]
                ])
            }
        }



        stage('Verify Dockerfile') {
            steps {
                script {
                   // 验证Dockerfile是否存在
                   if (!fileExists(env.DOCKERFILE_PATH)) {
                       error "Dockerfile not found at ${env.DOCKERFILE_PATH}!"
                   }
                   // 打印Dockerfile内容用于调试
                   sh "cat ${env.DOCKERFILE_PATH} || true"
                }
            }
        }

        stage('Restore Dependency Cache') {
            steps {
                script {
                    try {
                        unstash 'node-modules'
                        echo '✅ 已恢复 node_modules 缓存'
                    } catch (e) {
                        echo '📦 无可用缓存，首次安装依赖'
                    }
                }
            }
        }

        stage('Install Dependencies (Node 18)') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                    nvm use 18

                    yarn install --frozen-lockfile --registry http://nexus.saas.hand-china.com/content/groups/hzero-npm-group/
                    yarn run transpile
                '''
                script {
                    // 安装后缓存 node_modules
                    if (fileExists('node_modules')) {
                        stash name: 'node-modules', includes: 'node_modules/**'
                        echo '📦 缓存 node_modules 完成'
                    }
                }
            }
        }

        stage('Build(Node 16)') {
            steps {
                script {
                    def nvmInit = '''
                        export NVM_DIR="$HOME/.nvm"
                        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                        nvm use 16
                    '''.stripIndent()

                    params.buildSh.split(';').each { cmd ->
                        if (cmd.trim()) {
                            sh """
                                ${nvmInit}
                                ${cmd.trim()}
                            """
                        }
                    }
                }
            }
        }


        stage('Build Docker Image') {
            steps {
                // 构建Docker镜像
                script {
                    try {
                        // 使用docker命令明确指定Dockerfile路径
                        sh """
                            docker build -t ${env.IMAGE_NAME} \
                                -f ${env.DOCKERFILE_PATH} \
                                .
                        """
                    } catch(e) {
                        error "Docker build failed: ${e}"
                    }
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                // 推送镜像到Harbor
                script {
                    try {
                        // 使用withCredentials安全登录Harbor
                        withCredentials([usernamePassword(
                            credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                            usernameVariable: 'HARBOR_USER',
                            passwordVariable: 'HARBOR_PASS'
                        )]) {
                            sh """
                                docker login -u ${HARBOR_USER} -p ${HARBOR_PASS} ${env.HARBOR_URL}
                                docker push ${env.IMAGE_NAME}
                                docker logout ${env.HARBOR_URL}
                            """
                        }
                    } catch(e) {
                        error "Failed to push image: ${e}"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def targetServers = params.TARGET_SERVERS.split(',')
                    def selectedServer = targetServers[env.BUILD_NUMBER.toInteger() % targetServers.size()]

                    withCredentials([
                        usernamePassword(
                            credentialsId: "${env.SSH_CREDENTIALS_ID}",
                            usernameVariable: 'SSH_USER',
                            passwordVariable: 'SSH_PASS'
                        ),
                        usernamePassword(
                            credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                            usernameVariable: 'HARBOR_USER',
                            passwordVariable: 'HARBOR_PASS'
                        )
                    ]) {
                        // 方法1：直接传递命令（推荐简单场景）
                        sh """
                            sshpass -p '${SSH_PASS}' ssh -o StrictHostKeyChecking=no \\
                                ${SSH_USER}@${selectedServer} '
                                # 切换到工作目录1
                                cd /app-data || exit 1

                                # 安全删除容器
                                docker stop ${params.POD_NAME} || true
                                # docker rm ${params.POD_NAME} || true
                                # docker rmi ${env.IMAGE_NAME}:latest || true
                                # 安全删除以 ${params.POD_NAME} 开头的容器（仅当容器已停止时）
                                docker ps -a --filter "name=${params.POD_NAME}*" --format "{{.Names}}" | xargs -r docker rm
                                # 安全删除以 ${env.IMAGE_NAME} 开头的镜像（仅当镜像未被使用）
                                docker images --filter "reference=${env.IMAGE_NAME_RMI}*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi

                                # 拉取并运行新镜像
                                docker login -u ${HARBOR_USER} -p ${HARBOR_PASS} ${env.HARBOR_URL}
                                docker pull ${env.IMAGE_NAME}
                                docker run -d \\
                                    --name ${params.POD_NAME} \\
                                    --env-file ${params.ENV_FILE} \\
                                    --restart unless-stopped \\
                                    --log-driver=json-file \\
                                    --log-opt max-size=10m \\
                                    --log-opt max-file=3 \\
                                    -e JAVA_OPTS="-Xms${params.JVM_XMS} -Xmx${params.JVM_XMX}" \\
                                    -e EUREKA_SERVER_DEFAULT_ZONE="${params.EUREKA_SERVER_DEFAULT_ZONE}" \\
                                    -p ${params.PORT}:${params.PORT} \\
                                    -p ${params.PORTH}:${params.PORTH} \\
                                    -v /app-data/logs:/logs  \\
                                    ${env.IMAGE_NAME}
                                docker logout ${env.HARBOR_URL}
                            '
                        """
                        echo "✅ 已部署到服务器: ${selectedServer}"
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def targetServers = params.TARGET_SERVERS.split(',')
                    def selectedServer = targetServers[env.BUILD_NUMBER.toInteger() % targetServers.size()]
                    def healthCheckUrl = "http://${selectedServer}:${params.PORTH}/actuator/health"

                    // 初始等待1分钟（让服务完全启动）
                    echo "⏳ 等待服务初始化（10秒）..."
                    sleep 10

                    // 重试配置
                    def maxAttempts = 30
                    def attempt = 0
                    def healthCheckPassed = false

                    while (attempt < maxAttempts && !healthCheckPassed) {
                        attempt++
                        try {
                            // 直接通过curl访问目标服务器的健康检查接口
                            def response = sh(
                                script: "curl -sS --connect-timeout 5 ${healthCheckUrl}",
                                returnStdout: true
                            ).trim()

                            // 验证响应（根据实际接口调整条件）
                            if (response.contains('"status":"UP"') || response.contains('"success":true')) {
                                healthCheckPassed = true
                                echo "✅ 健康检查通过: ${response}"
                            } else {
                                error "健康检查失败: ${response}"
                            }
                        } catch (Exception e) {
                            echo "⚠️ 健康检查尝试 ${attempt}/${maxAttempts} 失败 (${healthCheckUrl})，等待重试..."
                            sleep 5
                        }
                    }

                    if (!healthCheckPassed) {
                        error "健康检查超时！服务未在 ${maxAttempts * 5} 秒内响应"
                    }
                }
            }
        }
    }

    post {
        always {
            // 清理工作
            echo 'Cleaning up...'
            sh """
                # 删除以 ${env.IMAGE_NAME} 开头的镜像（精确匹配标签）
                docker images --filter "reference=${env.IMAGE_NAME_RMI}*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi
            """
        }
        success {
            // 构建成功通知
            echo 'Pipeline succeeded!'
        }
        failure {
            // 构建失败通知
            echo 'Pipeline failed!'
        }
    }
}
