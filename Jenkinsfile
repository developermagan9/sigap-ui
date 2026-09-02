pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '15'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    IMAGE_NAME                = 'sigap-ui'
    COMPOSE_FILE              = 'docker-compose.deploy.yml'
    NODE_IMAGE                = 'node:20-alpine'

    NEXT_PUBLIC_API_URL       = 'http://43.133.144.108:3001/v1'
    NEXT_PUBLIC_EXPLORER_BASE = 'https://amoy.polygonscan.com'
    NEXT_PUBLIC_CHAIN_NAME    = 'Polygon Amoy'
  }

  stages {

    stage('Metadata') {
      steps {
        script {
          env.GIT_SHA   = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.IMAGE_TAG = "${env.GIT_SHA}-b${env.BUILD_NUMBER}"
        }
        echo "Branch : ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'n/a'}"
        echo "Commit : ${env.GIT_SHA}"
        echo "Image  : ${IMAGE_NAME}:${env.IMAGE_TAG}"
        echo "API    : ${NEXT_PUBLIC_API_URL}"
      }
    }

    stage('Quality') {
      steps {
        sh '''
          docker run --rm \
            -v "$WORKSPACE":/app -w /app \
            -u "$(id -u):$(id -g)" \
            -e HOME=/tmp \
            "$NODE_IMAGE" \
            sh -c "npm ci && npm run typecheck"
        '''
      }
    }

    stage('Docker image') {
      steps {
        sh '''
          docker build \
            --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
            --build-arg NEXT_PUBLIC_EXPLORER_BASE="$NEXT_PUBLIC_EXPLORER_BASE" \
            --build-arg NEXT_PUBLIC_CHAIN_NAME="$NEXT_PUBLIC_CHAIN_NAME" \
            -t "$IMAGE_NAME:$IMAGE_TAG" -t "$IMAGE_NAME:latest" .
        '''
      }
    }

    stage('Deploy & Smoke test') {
      when { expression { return shouldDeploy() } }
      steps {
        sh '''
          set -e
          export IMAGE_TAG
          docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

          cid="$(docker compose -f "$COMPOSE_FILE" ps -q sigap-ui)"
          echo "Menunggu container sigap-ui sehat ..."
          for i in $(seq 1 40); do
            running="$(docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null || echo false)"
            status="$(docker inspect -f '{{.State.Health.Status}}' "$cid" 2>/dev/null || echo none)"
            echo "  [$((i*3))s] running=$running health=$status"
            if [ "$status" = "healthy" ]; then
              echo "OK - UI sehat."
              exit 0
            fi
            if [ "$running" != "true" ]; then
              echo "GAGAL - container sigap-ui berhenti. Log:"
              docker compose -f "$COMPOSE_FILE" logs --tail=200 sigap-ui
              exit 1
            fi
            sleep 3
          done
          echo "GAGAL - UI tidak sehat setelah 120 detik."
          echo "===== compose logs ====="
          docker compose -f "$COMPOSE_FILE" logs --tail=200 sigap-ui || true
          echo "===== healthcheck detail (State.Health) ====="
          docker inspect --format '{{json .State.Health}}' "$cid" || true
          echo "===== probe manual dari dalam container ====="
          docker exec "$cid" node -e "require('http').get('http://127.0.0.1:3000/health',r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>console.log('GET /health ->',r.statusCode,b.slice(0,200)))}).on('error',e=>console.log('GET /health ERROR:',e.message))" || true
          docker exec "$cid" node -e "require('http').get('http://127.0.0.1:3000/',r=>{console.log('GET / ->',r.statusCode);r.resume()}).on('error',e=>console.log('GET / ERROR:',e.message))" || true
          exit 1
        '''
      }
    }
  }

  post {
    success {
      echo "OK  ${IMAGE_NAME}:${env.IMAGE_TAG} berhasil dibangun" +
           (shouldDeploy() ? ' & dideploy.' : ' (stage deploy dilewati untuk branch ini).')
    }
    failure {
      echo "GAGAL  Pipeline merah - periksa stage di atas."
    }
    always {
      sh 'docker image prune -f || true'
    }
    cleanup {
      cleanWs()
    }
  }
}

boolean shouldDeploy() {
  def deployable = ['main', 'origin/main', 'develop', 'origin/develop']
  def b = env.BRANCH_NAME ?: env.GIT_BRANCH
  return (b == null) || deployable.contains(b)
}
