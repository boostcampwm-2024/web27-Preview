# ✨ Preview

<img width="100%" src="https://github.com/user-attachments/assets/4894268d-c31d-44d6-9e6c-9c37b86a4a99" />

<br/>

<div align="center">면접 연습을 하고 싶은데.. 🧐</div>
<div align="center">다른 사람과 함께 할 수 없을까? 👥</div>

<h3 align="center">✨ Preview에서 면접 연습 시작하자! ✨</h3>

<br/>

<div align="center">

[노션 홈](https://alpine-tiglon-9f0.notion.site/PREVIEW-HOME-12d696f85d1f805b9787e26374b3d209?pvs=4) | [프로젝트](https://github.com/orgs/boostcampwm-2024/projects/51) | [피그마](https://www.figma.com/file/YunC4M9LWDRROD2pyXL8jE/boostcamp-booskit)
 | [위키](https://github.com/boostcampwm-2024/web27-Preview/wiki) 

![Hits](https://hits.sh/github.com/boostcampwm-2024/web27-Preview.svg?style=flat-square)

</div>


## ☃️ 프로젝트 소개

> "오프라인으로 모이기 쉽지 않은 면접 스터디!"

> "실제 소통이 아쉬운 AI 면접 서비스!"

나의 성공적인 면접 스터디, **PREVIEW**로 시작해보세요!

**실시간 화상 스터디**로 장소에 구애받지 않고 **면접 연습**을 시작할 수 있습니다.

## 실행해보기

현재 배포 링크는 중단되었습니다.

하지만 로컬로 각자 테스트해볼 수 있도록 Dockerized 해두었습니다!

아래 명령어대로 `Dockerfile` 을 빌드하면서 Docker compose 를 실행하면 테스트해볼 수 있습니다.

```shell
docker compose up --build
# 이후 http://localhost:5173 으로 접속
```

## 📣 핵심 기능

### WebRTC 기반 실시간 화상 면접

- 실제 면접과 비슷한 화상 환경에서 연습
- 다자간 화상 연결로 실제 면접 분위기 조성
- 즉각적인 피드백 교환 가능

### 스터디 채널

- 함께 면접을 연습하고 싶은 동료들과 스터디 채널 개설
- 공개/비공개 채널 지원

### 맞춤형 질문지 생성 및 공유

- 면접 질문지 생성 및 공유
- 면접 질문지 공유로 다양한 질문에 대비
- 사용량에 따른 인기 질문지 제공

### 면접 스터디 기능

- 실제 면접처럼 질문을 하나씩 받고 서로 대답해보는 스터디 기능
- 면접 질문에 대한 피드백을 주고 받을 수 있음
- 면접 스터디 결과를 기록하고 공유할 수 있음

## 🧩 설계

![image](https://github.com/user-attachments/assets/1725bf0f-8ff3-4dfe-b11e-e5b0c053514f)


## 🛠 기술 스택

| Category | Stack                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Frontend | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Backend  | ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-E83524?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI1NiAyNTYiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0yNDEuMzUyIDI1LjcyN2wtNTQuOTQtMTkuMjhBMjcuNTE3IDI3LjUxNyAwIDAgMCAxNjcuMjE1IDRIMTA3LjE4YTI3LjQ4NCAyNy40ODQgMCAwIDAtMTkuMTk3IDIuNDQ3TDMzLjAzOCAyNS43MjdDMTguNDc3IDMyLjQxMyAxMCA0Ny40NTEgMTAgNjMuOTc3djkzLjU1NmMwIDIzLjcxIDEzLjA3IDQ1LjUyNiAzNC4wMjMgNTYuNTU3bDYzLjE5NyAzMy4xOTVjMTEuOTUgNi4yNzcgMjYuMDM3IDcuOTc0IDM5LjE1OCA0Ljc4NGw3Ni4wMTEtMTguNTRDMjQxLjg2NSAyMjYuOTc4IDI1NSAyMDguOTg4IDI1NSAxODguNDcyVjYzLjk3N2MwLTE2LjUyNi04LjQ3OC0zMS41NjQtMjMuMDM4LTM4LjI1Wm0tMjkuMDYgNjkuNzk2YTguMDY3IDguMDY3IDAgMCAxLTguNDc3IDEzLjY2OGwtOC40NzctNS4yNjJ2NjIuNTgzYTguMDY0IDguMDY0IDAgMCAxLTQuMDkyIDcuMDA4bC00OS45NjcgMjkuODk4Yy0yLjUwMyAxLjQ5Ny01LjU4NSAxLjUzMS04LjEyMS4wODlMODQuMTkgMTc0LjA1OGE4LjA2NSA4LjA2NSAwIDAgMS00LjA5NC03LjAwOFY5OC43MDhhOC4wNjQgOC4wNjQgMCAwIDEgMy45NDktNi45MjlsNDAuMzU1LTI1LjE1N2E4LjA2NCA4LjA2NCAwIDAgMSA4LjQzMS0uMDM0bDQwLjA5NSAyNC40ODRhOC4wNjQgOC4wNjQgMCAwIDEgNC4wOTMgNi45OTd2OS40NzJsOC40NzctNS4wOGE4LjA2NCA4LjA2NCAwIDAgMSA4LjQ3Ny0uMTI3bDE4LjMxNSAxMS4xODlaIi8+PC9zdmc+&logoColor=white) |
| Common   | ![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Husky](https://img.shields.io/badge/Husky-000000?style=for-the-badge&logo=husky&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| DevOps   | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![NCP](https://img.shields.io/badge/Naver_Cloud-03C75A?style=for-the-badge&logo=naver&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CI/CD    | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Etc      | ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white) ![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

<br>   

## 🥊 기술적 경험

저희들의 휘발되기엔 아까운 우리 팀의 개발 경험입니다! 더 자세한 경험들은 [이곳](https://alpine-tiglon-9f0.notion.site/87b7f1ce19564eda8127eca29d567d0f?v=f2df7d634605464d876ccf43c9197db4&pvs=4) 에서 확인하실 수 있습니다.

### [BE] Coturn 설치 및 config 파일 수정

`coturn`은 WebRTC에서 NAT와 방화벽 문제를 해결하기 위해 사용되는 오픈소스 TURN/STUN 서버입니다. 설치 후 `/etc/turnserver.conf` 파일에서 `listening-port`, `external-ip`, `min-port`, `verbose` 등을 설정하여 서버 동작을 최적화했습니다. 인증 방식(`lt-cred-mech`)과 사용자 계정을 설정해 보안을 강화하며, NAT 뒤에서의 통신을 지원하도록 `external-ip`를 공인 IP와 매핑했습니다.

> 작성자: 송수민
> 
> 🔗 [coturn 설치 및 config 파일 수정](https://www.notion.so/coturn-config-299c854b69dd4bd9ac5823830ef3bc8d?pvs=21)
> 

### [BE] 트랜잭션 최적화: queryRunner는 만능이 아니다

프로젝트에서 데이터 일관성을 보장하기 위해 질문지 생성과 질문 삭제 로직에서 트랜잭션이 필요했습니다. 초기에 `@Transactional()`을 사용해 메서드 단위로 트랜잭션을 구현했고, 불필요한 트랜잭션 범위를 없애기 위해 `queryRunner`로 대체해서 개선했습니다. `k6`를 이용한 부하 테스트를 진행했고, 그 결과 `queryRunner`를 사용하는 것이 무조건 성능 개선을 보장하는 것은 아니며, 상황에 따라 적합한 방식을 선택하는 것이 중요하다는 것을 알게 되었습니다.

> 작성자: 송수민
> 
> 🔗 [트랜잭션 최적화: queryRunner는 만능이 아니다](https://www.notion.so/TypeORM-queryRunner-6037e88d14c94cf29046114f5de21e81?pvs=21)
> 

### [FE] 토큰 재발급부터 요청 재시도까지 한번에 axios interceptor

액세스 토큰 만료시 401 에러를 `Axios Interceptor`로 일괄 처리하여 자동으로 토큰 재발급 및 요청 재시도 구현했습니다. 토큰 재발급 실패시 세션 만료로 간주하여 로그인 페이지로 리다이렉트하는 일관된 에러 처리 구축해보았습니다. 중앙화된 토큰 관리가 되니, 코드 중복 제거 및 유지보수성이 향상되었고, 개별 컴포넌트의 토큰 관리 부담이 줄었습니다.

> 작성자: 서정우
> 
> 🔗 [axios interceptor를 사용한 401에러 일관적 처리](https://www.notion.so/axios-interceptor-401-151696f85d1f80cf9e6fe73452dcecb2?pvs=21)
> 

### [FE] 카메라 인디케이터 항상 켜져있던 문제 해결하기

카메라 끄기시 인디케이터 계속 켜지는 UX 문제를 `track.stop()`으로 해결하고, `useRef`+`useState`로 스트림 관리 구조 개선했습니다. 이 과정에서 발생한 다른 참가자 화면 멈춤 문제를 `PeerConnections` 업데이트로 해결했고, 결과적으로 카메라 끄기시 인디케이터도 꺼지고 참가자간 동기화도 잘 되는 안정적인 기능이 되었습니다.

> 작성자: 서정우
> 
> 🔗 [카메라 인디케이터 항상 켜져있던 문제 해결하기](https://www.notion.so/151696f85d1f80b78315ef65a8011d48?pvs=21)
> 

### [BE] Facade 패턴으로 redis-om 엔티티에 도메인 로직 결합하기

Redis에서 복잡한 객체를 직렬화/역직렬화하는 반복 작업의 문제를 인식하였습니다. 그래서 여러 해결 방안을 시도하고 각각의 장단점을 분석하는 과정을 통해, DDD의 개념을 완전히 도입하기보다, 도메인 로직 분리라는 핵심 아이디어만 채택하여서 문제를 해결했습니다. 그 과정에서 결과적으로 Facade 패턴을 자연스럽게 도출이 되었습니다.

> 작성자: 김찬우
> 
> 🔗 [Facade 패턴으로 redis-om 엔티티에 도메인 로직 결합하기](https://www.notion.so/Facade-redis-om-4f02cb197ced4835bbf11824c1323c6f?pvs=21)
> 

### [BE] 협업을 위한 더러운 코드

`깔끔한 코드`를 만들기 위해 과도한 리팩토링을 시도했습니다. 협업보다 개인의 코드 품질 추구가 우선시되고 있었고, 멘토링을 통해 `코드의 길이보다 구조와 역할이 더 중요함`을 깨달았습니다. 절대적인 규칙이나 패턴을 맹목적으로 따르지 않고 상황에 맞는 판단의 중요성을 배웠습니다.

> 작성자: 김찬우
> 
> 🔗 [협업을 위한 더러운 코드](https://www.notion.so/88d142476081439380ae207edc25c400?pvs=21)
> 

### [FE] 상대방의 비디오가 보이지 않던 문제 해결하기

내 비디오는 보이는데 상대방의 비디오가 보이지 않는 문제가 있었습니다. 소켓 연결부터 피어의 상태관리까지 디버깅 코드를 넣어 관찰한 결과 디버깅 코드는 문제가 없었고, 비디오 스트림을 처리하는 코드를 보고 잘못된 방식으로 처리하고 있다는 것을 깨달았습니다. 문제가 생긴 부분을 체크하기 위해 단계별로 어디가 문제인지 찾아가며 문제를 찾는 범위를 좁히는 것의 중요성을 배웠습니다.

> 작성자: 이승윤
> 
> 🔗 [상대방의 비디오가 보이지 않던 문제 해결하기](https://www.notion.so/151660556051802d911bf5421f085ffd?pvs=21)
> 

### [FE] useSession 테스트 코드 작성하기

핵심 기능인 화상회의에 관한 코드가 모여있는 useSession 훅이 너무 많은 일을 하고 있었습니다. 분리해서 리팩토링을 진행하고 싶었는데 잘못하다가 여태까지 구현했던 것에 문제가 생길거 같았고, 클라이언트 측 동작을 테스트하기 위해 모킹을 이용해 테스트 코드를 작성했습니다. 이후 해당 훅을 분리하는 과정에서 테스트 코드를 통해 오류 없이 리팩토링을 진행할 수 있었고, 테스트 코드의 필요성에 대해 배웠습니다.

> 작성자: 이승윤
> 
> 🔗 [useSession 테스트 코드 작성하기](https://www.notion.so/1426605560518007b5e7ed30b2cdb8ee?pvs=21)
>

## 👋 팀원 소개

|                          [김찬우](https://github.com/blu3piece)                           |                        [서정우](https://github.com/ShipFriend0516)                        |                                        [송수민](https://github.com/twalla26)                                         |                                       [이승윤](https://github.com/yiseungyun)                                        |
|:--------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------:|
| <img style="width: 400px" src="https://avatars.githubusercontent.com/u/65532873?v=4"/> | <img style="width: 400px" src="https://avatars.githubusercontent.com/u/98446924?v=4"/> | <img style="width: 400px" src="https://github.com/user-attachments/assets/71176cea-caf4-4b00-816f-ba83ec9bf45d"/> | <img style="width: 400px" src="https://github.com/user-attachments/assets/85d13af3-91b4-4225-bc2f-3f83e9883a02"/> |
|                                         WEB BE                                         |                                         WEB FE                                         |                                                      WEB BE                                                       |                                                      WEB FE                                                       |

<br/>

> 🐧 **김찬우**
>
> '함께 자라는 개발도 잘하는 사람'이 되고 싶은 그저 프로그래밍이 재밌는 사람입니다. 펭귄처럼 바보라도 당당하게 호기심 있게 되고 싶습니다!

> 💣 **서정우**
>
> 멈추지 않는 기술의 변화를 즐기는 개발자가 되고 싶은 서정우입니다!

> 🐬 **송수민**
>
> 안녕하세요! 저는 수영장에 가거나 차 마시는 것을 좋아하는 백엔드 개발자 송수민입니다.

> 🦄 **이승윤**
>
> 안녕하십니까마귀. 저는 즐겁게 개발하는 걸 좋아합니다! 🎉

<br>   
