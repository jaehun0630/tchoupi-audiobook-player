# tchoupi-audiobook-player

추피 오디오북을 책 번호 또는 QR 코드로 재생하는 정적 웹 플레이어입니다. QR에는 이 서버의 책 링크를 넣고, 플레이어가 내부에서 출판사 MP3 링크를 불러오는 wrapper 구조입니다.

## 실행

```sh
docker-compose up -d
```

기본 주소는 `http://localhost:8090`입니다.

## Portainer Stack 배포

Portainer에서 Git repository 방식으로 stack을 추가할 때 아래 값을 사용합니다.

```text
Repository URL: https://github.com/jaehun0630/tchoupi-audiobook-player.git
Compose path: portainer-stack.yml
```

기본 공개 포트는 `8090`입니다. 다른 포트를 사용하려면 stack 환경 변수에 아래 값을 추가합니다.

```text
TCHOUPI_HTTP_PORT=9010
```

## QR 링크 형식

QR 코드에는 아래처럼 책 번호가 들어간 이 서버의 플레이어 URL을 넣는 것을 권장합니다.

```text
https://example.com/book/6
https://example.com/book/006
```

사용자가 QR을 찍으면 이 서버의 웹 플레이어가 열리고, 플레이어는 내부적으로 출판사에서 제공한 MP3 URL을 오디오 소스로 사용합니다.

호환을 위해 `?book=6`, `?book=006`, `?kind=tchoupi_6` 형태도 읽을 수 있습니다.

QR 코드가 오디오 파일 URL 자체를 담고 있는 경우에도 `bok_006.mp3`처럼 파일명에 책 번호가 있으면 번호를 추출합니다.

## 카메라 사용 조건

브라우저 카메라 권한은 일반적으로 HTTPS에서만 동작합니다. 로컬 개발 환경에서는 `localhost`가 허용되지만, 실제 배포 URL에서는 HTTPS를 사용해야 QR 스캔 버튼이 정상 동작합니다.
