# tchoupi-audiobook-player

추피 오디오북을 책 번호 또는 QR 코드로 재생하는 정적 웹 플레이어입니다.

## 실행

```sh
docker-compose up -d
```

기본 주소는 `http://localhost:8080`입니다.

## QR 링크 형식

QR 코드에는 아래처럼 책 번호가 들어간 플레이어 URL을 넣는 것을 권장합니다.

```text
https://example.com/?book=6
https://example.com/?book=006
```

페이지는 `book`, `bookNumber`, `num`, `n`, `kind` 파라미터를 읽을 수 있습니다. 기존 QR처럼 `?kind=tchoupi_6` 형태도 지원합니다.

QR 코드가 오디오 파일 URL 자체를 담고 있는 경우에도 `bok_006.mp3`처럼 파일명에 책 번호가 있으면 번호를 추출합니다.

## 카메라 사용 조건

브라우저 카메라 권한은 일반적으로 HTTPS에서만 동작합니다. 로컬 개발 환경에서는 `localhost`가 허용되지만, 실제 배포 URL에서는 HTTPS를 사용해야 QR 스캔 버튼이 정상 동작합니다.
