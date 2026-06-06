(function () {
  const defaultCoverUrl = "default_tchoupi_cover.png";
  const audioBaseUrl = "http://222.231.33.227:5104/taedong_audio/book";
  const coverBaseUrl = "http://222.231.33.227/webapp/taedong_turnjs/static/cover";
  const bookParamNames = ["book", "bookNumber", "num", "n"];
  const bookPathPattern = /^\/book\/(\d{1,3})\/?$/i;

  let scanner = null;

  function normalizeBookNumber(value) {
    if (value === null || value === undefined) {
      return null;
    }

    const match = String(value).trim().match(/^\d{1,3}$/);
    if (!match) {
      return null;
    }

    const number = Number.parseInt(match[0], 10);
    if (!Number.isInteger(number) || number < 1 || number > 999) {
      return null;
    }

    return String(number);
  }

  function getNumberFromKind(kind) {
    if (!kind) {
      return null;
    }

    const match = String(kind).match(/(?:^|[_-])(\d{1,3})$/);
    return normalizeBookNumber(match ? match[1] : kind);
  }

  function getNumberFromUrl(urlText) {
    let url;
    try {
      url = new URL(urlText, window.location.origin);
    } catch (_error) {
      return null;
    }

    for (const paramName of bookParamNames) {
      const bookNumber = normalizeBookNumber(url.searchParams.get(paramName));
      if (bookNumber) {
        return bookNumber;
      }
    }

    const kindNumber = getNumberFromKind(url.searchParams.get("kind"));
    if (kindNumber) {
      return kindNumber;
    }

    const canonicalPathMatch = url.pathname.match(bookPathPattern);
    if (canonicalPathMatch) {
      return normalizeBookNumber(canonicalPathMatch[1]);
    }

    const pathMatch = url.pathname.match(/(?:book|bok|tchoupi|kind)[_/-]?(\d{1,3})(?=$|[._/-])/i);
    return pathMatch ? normalizeBookNumber(pathMatch[1]) : null;
  }

  function extractBookNumber(text) {
    if (!text) {
      return null;
    }

    const rawText = String(text).trim();
    const urlNumber = getNumberFromUrl(rawText);
    if (urlNumber) {
      return urlNumber;
    }

    return normalizeBookNumber(rawText);
  }

  function setStatus(message) {
    const status = document.getElementById("status-message");
    if (status) {
      status.textContent = message || "";
    }
  }

  function showDefaultCover() {
    const cover = document.getElementById("cover-image");
    cover.src = defaultCoverUrl;
    cover.style.display = "block";
  }

  async function stopScanner() {
    const qrReader = document.getElementById("qr-reader");

    if (scanner) {
      try {
        await scanner.stop();
      } catch (_error) {
        // The scanner can already be stopped when camera permission fails.
      }
      scanner.clear();
      scanner = null;
    }

    qrReader.style.display = "none";
  }

  async function startScanner() {
    const qrReader = document.getElementById("qr-reader");

    if (!window.Html5Qrcode) {
      setStatus("QR 인식 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setStatus("카메라 사용을 위해 HTTPS 주소로 접속해주세요.");
      return;
    }

    await stopScanner();
    qrReader.style.display = "block";
    setStatus("카메라를 여는 중입니다.");

    scanner = new Html5Qrcode("qr-reader");

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          const bookNumber = extractBookNumber(decodedText);
          await stopScanner();

          if (!bookNumber) {
            setStatus("지원하지 않는 QR 코드입니다. 책 번호가 포함된 QR인지 확인해주세요.");
            return;
          }

          setStatus(`QR 인식 완료: ${bookNumber}번 책을 불러옵니다.`);
          playAudioFromBookNum(bookNumber, { updateUrl: true });
        },
        () => {}
      );
      setStatus("QR 코드를 화면 중앙에 맞춰주세요.");
    } catch (error) {
      await stopScanner();
      setStatus(`카메라를 시작하지 못했습니다: ${error && error.message ? error.message : error}`);
    }
  }

  function playFromInput() {
    const input = document.getElementById("book-number-input").value;
    const bookNumber = extractBookNumber(input);

    if (!bookNumber) {
      setStatus("책 번호를 정확히 입력해주세요.");
      return;
    }

    playAudioFromBookNum(bookNumber, { updateUrl: true });
  }

  function playAudioFromBookNum(number, options = {}) {
    const bookNumber = normalizeBookNumber(number);
    if (!bookNumber) {
      setStatus("책 번호를 정확히 입력해주세요.");
      return;
    }

    const cover = document.getElementById("cover-image");
    const audio = document.getElementById("audio-player");
    const input = document.getElementById("book-number-input");
    const paddedMp3 = bookNumber.padStart(3, "0");
    const paddedCover = bookNumber.padStart(2, "0");

    const audioUrl = `${audioBaseUrl}/bok_${paddedMp3}.mp3`;
    const coverUrl = `${coverBaseUrl}/cover_tchoupi_${paddedCover}.png`;

    input.value = bookNumber;
    showDefaultCover();
    setStatus(`${bookNumber}번 책을 재생합니다.`);

    const testImg = new Image();
    testImg.onload = () => {
      cover.src = coverUrl;
    };
    testImg.onerror = () => {
      showDefaultCover();
    };
    testImg.src = coverUrl;

    audio.src = audioUrl;
    audio.play().catch(() => {
      setStatus(`${bookNumber}번 책을 불러왔습니다. 재생 버튼을 눌러주세요.`);
    });

    if (options.updateUrl) {
      window.history.replaceState({}, "", `/book/${bookNumber}`);
    }
  }

  function playFromLocation() {
    const bookNumber = getNumberFromUrl(window.location.href);
    if (bookNumber) {
      playAudioFromBookNum(bookNumber);
    }
  }

  function init() {
    showDefaultCover();

    document.getElementById("book-number-input").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        playFromInput();
      }
    });

    document.getElementById("play-button").addEventListener("click", playFromInput);
    document.getElementById("scan-button").addEventListener("click", startScanner);

    playFromLocation();
  }

  window.tchoupiPlayer = {
    extractBookNumber,
    getNumberFromUrl,
    normalizeBookNumber,
    playAudioFromBookNum,
    playFromInput,
    startScanner,
  };

  document.addEventListener("DOMContentLoaded", init);
})();
