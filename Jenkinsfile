pipeline {

    agent any
    environment {
        IMAGE = 'weibeld/ktest-web'
        DOCKER_HUB_PW = credentials('docker-hub-weibeld-password')
    }

    stage('Create Docker Image') {
        steps {
            sh 'docker build -t "$IMAGE" .'
        }
    }

    stage('Publish Docker Image') {
        steps {
            sh 'docker login -u weibeld -p "$DOCKER_HUB_PW"'
            sh 'docker push "$IMAGE"'
        }
    }
}
