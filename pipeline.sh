pipeline {
    agent any

    environment {
        IMAGE = "regis.pointit.co.th/${SITE}/${APP}"
        IMAGE_VERSION = "0.1.9"
        APP = 'tracking'
        SITE = 'ool'
        DOMAIN = 'kudsonmoo.co'
        GIT_SECRET = "git-${SITE}"
        REGIS_SECRET = 'regis'
        ARGO_SECRET = "argocd-${SITE}"

        BRANCH_NAME = 'main'
        REGIS_URL = 'https://regis.pointit.co.th/'
        GIT_URL = 'https://github.com/pointitconsulting/ool-tracking.git'

        ARGOCD_API_URL = "https://${SITE}.${DOMAIN}/cd/api/v1"

        API_URL = "https://${SITE}.${DOMAIN}/apij"
        APP_PATH = "/tracking"
        STORE = "https://${SITE}.${DOMAIN}/s3"
        KEYCLOAK_ID = 'gw'
        KEYCLOAK_ISSUER = "https://${SITE}.${DOMAIN}/sso"
        KEYCLOAK_REALM = "${SITE}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${BRANCH_NAME}"]],
                        userRemoteConfigs: [[
                            credentialsId: GIT_SECRET,
                            url: GIT_URL
                        ]]
                    ])
                }
            }
        }

        stage('Update values.yaml') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'nuxtLic', variable: 'NUXT_LIC_KEY'),
                        string(credentialsId: 'mapLic', variable: 'GOOGLE_MAP_KEY')
                    ]) {
                        sh """
                            echo "🔄 Updating values.yaml..."
                            sed -i 's|site: .*|site: "${SITE}"|' deploy/values.yaml
                            sed -i 's|tag: .*|tag: "${IMAGE_VERSION}"|' deploy/values.yaml
                            sed -i 's|repository: .*|repository: "regis.pointit.co.th/${SITE}/tracking"|' deploy/values.yaml
                            sed -i 's|baseUrl: .*|baseUrl: "https://${SITE}.${DOMAIN}/sso"|' deploy/values.yaml
                            sed -i 's|realm: .*|realm: "${SITE}"|' deploy/values.yaml
                            sed -i 's|clientSecret: .*|clientSecret: "SpK8EogubVevj5slyB9fU3tbA5VOUKFF"|' deploy/values.yaml

                            echo "📄 Updated values.yaml:"
                            cat deploy/values.yaml
                        """
                    }
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    withCredentials([
                        usernamePassword(credentialsId: REGIS_SECRET, usernameVariable: 'REGIS_USER', passwordVariable: 'REGIS_PASS'),
                        string(credentialsId: 'kcClientSecret', variable: 'KEYCLOAK_SECRET')
                    ]) {
                        sh """
                            echo "🚀 Building Docker Image..."
                            docker build --network=host \\
                                --build-arg VITE_KEYCLOAK_BASE_URL='${KEYCLOAK_ISSUER}' \\
                                --build-arg VITE_API_MAIN_PATH='${API_URL}' \\
                                --build-arg VITE_APP_BASE_PATH='${APP_PATH}' \\
                                --build-arg VITE_APP_TITLE="ATIS (Prod)" \\
                                --build-arg VITE_API_ENDPOINT='${API_URL}' \\
                                --build-arg VITE_KEYCLOAK_REALM=\$(echo ${SITE} | tr '[:lower:]' '[:upper:]') \\
                                --build-arg VITE_KEYCLOAK_CLIENT_ID='${KEYCLOAK_ID}' \\
                                --build-arg VITE_KEYCLOAK_CLIENT_SECRET='${KEYCLOAK_SECRET}' \\
                                -t ${IMAGE}:${IMAGE_VERSION} .
        
                            echo "🔐 Logging into Harbor Registry..."
                            echo ${REGIS_PASS} | docker login ${REGIS_URL} -u ${REGIS_USER} --password-stdin
        
                            echo "📤 Pushing Docker Image to Harbor..."
                            docker push ${IMAGE}:${IMAGE_VERSION}
        
                            echo "✅ Successfully pushed ${IMAGE}:${IMAGE_VERSION} to ${REGIS_URL}"
                        """
                    }
                }
            }
        }


        // stage('Generate .env File') {
        //     steps {
        //         script {
        //             sh """
        //                 echo "🔄 Generating .env file..."
        //                 cat <<EOF > .env
        //                 VITE_KEYCLOAK_BASE_URL=${KEYCLOAK_ISSUER}
        //                 VITE_API_MAIN_PATH=${API_URL}
        //                 VITE_APP_BASE_PATH=${APP_PATH}
        //                 VITE_APP_TITLE="ATIS (Prod)"
        //                 VITE_API_ENDPOINT=${API_URL}
        //                 VITE_KEYCLOAK_REALM=${KEYCLOAK_REALM}
        //                 VITE_KEYCLOAK_CLIENT_ID=${KEYCLOAK_ID}
        //                 VITE_KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_SECRET}
        //                 EOF
                        
        //                 echo "📄 Generated .env:"
        //                 cat .env
        //             """
        //         }
        //     }
        // }

        // stage('Build and Push Docker Image') {
        //     steps {
        //         script {
        //             withCredentials([usernamePassword(credentialsId: REGIS_SECRET, usernameVariable: 'REGIS_USER', passwordVariable: 'REGIS_PASS')]) {
        //                 sh """
        //                     echo "🚀 Building Docker Image..."
        //                     docker build --network=host --build-arg ENV_FILE=.env -t ${IMAGE}:${IMAGE_VERSION} .

        //                     echo "🔐 Logging into Harbor Registry..."
        //                     echo ${REGIS_PASS} | docker login ${REGIS_URL} -u ${REGIS_USER} --password-stdin

        //                     echo "📤 Pushing Docker Image to Harbor..."
        //                     docker push ${IMAGE}:${IMAGE_VERSION}

        //                     echo "✅ Successfully pushed ${IMAGE}:${IMAGE_VERSION} to ${REGIS_URL}"
        //                 """
        //             }
        //         }
        //     }
        // }

        stage('Update Image Tag in values.yaml') {
            steps {
                script {
                    sh """
                        echo "🔄 Updating image.tag in deploy/values.yaml..."
                        sed -i 's|tag: .*|tag: "${IMAGE_VERSION}"|' deploy/values.yaml

                        echo "📄 Updated values.yaml:"
                        cat deploy/values.yaml
                    """

                    withCredentials([usernamePassword(credentialsId: GIT_SECRET, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh """
                            git config --global user.email "jenkins@pointit.co.th"
                            git config --global user.name "Jenkins"

                            echo "🔄 Committing updated values.yaml..."
                            git add deploy/values.yaml
                            git commit -m "Update image.tag to ${IMAGE_VERSION}"
                            git push https://${GIT_USER}:${GIT_PASS}@github.com/pointitconsulting/${SITE}-${APP}.git HEAD:${BRANCH_NAME}
                        """
                    }
                }
            }
        }

        stage('Deploy with ArgoCD API') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: ARGO_SECRET, usernameVariable: 'ARGOCD_USERNAME', passwordVariable: 'ARGOCD_PASSWORD')]) {
                        sh ''' 
                            echo "🔐 Logging into ArgoCD..."
                            ARGOCD_AUTH_TOKEN=$(curl -s -X POST ${ARGOCD_API_URL}/session \
                                -H "Content-Type: application/json" \
                                -d '{ "username": "'"${ARGOCD_USERNAME}"'", "password": "'"${ARGOCD_PASSWORD}"'" }' | jq -r '.token')
                    
                            if [[ -z "$ARGOCD_AUTH_TOKEN" ]]; then
                                echo "❌ ArgoCD Authentication Failed!"
                                exit 1
                            fi
                    
                            echo "✅ Converting YAML to JSON..."
                            yq e -o=json deploy/argocd-deploy.yaml > deploy/argocd-deploy.json
                    
                            echo "✅ Deploying ArgoCD Application..."
                            curl -s -X POST ${ARGOCD_API_URL}/applications \
                                -H "Authorization: Bearer $ARGOCD_AUTH_TOKEN" \
                                -H "Content-Type: application/json" \
                                -d @deploy/argocd-deploy.json || { echo "❌ Deployment Failed!"; exit 1; }
                    
                            echo "🔄 Syncing ArgoCD Application..."
                            curl -s -X POST ${ARGOCD_API_URL}/applications/${APP}/sync \
                                -H "Authorization: Bearer $ARGOCD_AUTH_TOKEN" \
                                -H "Content-Type: application/json" \
                                -d '{}' || { echo "❌ Sync Failed!"; exit 1; }
                    
                            echo "⏳ Checking application health..."
                            curl -s -X GET ${ARGOCD_API_URL}/applications/${APP} \
                                -H "Authorization: Bearer $ARGOCD_AUTH_TOKEN" | jq '.status.health'
                        '''
                    }
                }
            }
        }
    }
}
