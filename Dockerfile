# Dockerfile

# 1. pnpm이 설치된 Node.js 20-alpine 이미지를 기반으로 합니다.
FROM node:20-alpine

# 2. pnpm 활성화
RUN corepack enable

# 3. 컨테이너 내부의 작업 디렉토리 설정
WORKDIR /usr/src/app

# 4. 의존성 설치를 위해 루트 및 하위 패키지들의 package.json과
#    워크스페이스 설정 파일들을 먼저 복사합니다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# 5. 워크스페이스 루트에서 pnpm 의존성 설치 (전체)
RUN pnpm install

# 6. (삭제) 기본 CMD 라인을 제거합니다.
#    docker-compose.yml에서 항상 command를 지정해 사용할 것이기 때문입니다.