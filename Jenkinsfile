pipeline {
    agent any
    environment {
        DOCKER_REGISTRY_URL = 'https://192.168.0.102'
        SSH_HOST = '192.168.0.104'
        SSH_USERNAME = 'root'
        CONTAINER_NAME = 'personal.book.api'
        ANGULAR_CLI_VERSION = "20.3.11"
    }
    tools {
        nodejs "nodejs"
    }
    stages {
       stage('Install Dependencies') {
            steps {
                sh "npm install -g @angular/cli@${env.ANGULAR_CLI_VERSION}"
                sh "npm install"
            }
        }

        stage('Build') {
            steps {
                sh "ng build"
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['jenkins-server']) {
                    sh "ssh -o StrictHostKeyChecking=no $SSH_USERNAME@$SSH_HOST 'rm -rf /var/www/html/*'"
                    sh "scp -r ./dist/apollo-ng/* $SSH_USERNAME@$SSH_HOST:/var/www/html"
                    sh "ssh -o StrictHostKeyChecking=no $SSH_USERNAME@$SSH_HOST 'sudo systemctl restart nginx'"
                }
            }
        }
    }
}

