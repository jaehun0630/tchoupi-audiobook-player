const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const appJs = fs.readFileSync(path.join(__dirname, "../html/app.js"), "utf8");

const context = {
  Image: function Image() {},
  URL,
  console,
  document: {
    addEventListener() {},
    getElementById() {
      return {
        addEventListener() {},
        play() {
          return Promise.resolve();
        },
        set src(_value) {},
        get src() {
          return "";
        },
        style: {},
        value: "",
      };
    },
  },
  window: {
    history: {
      replaceState() {},
    },
    isSecureContext: true,
    location: {
      href: "http://localhost:8080/",
      hostname: "localhost",
      origin: "http://localhost:8080",
    },
  },
};

context.window.window = context.window;
context.window.document = context.document;
context.window.URL = URL;
context.window.Image = context.Image;

vm.createContext(context);
vm.runInContext(appJs, context);

const { extractBookNumber, getNumberFromUrl, normalizeBookNumber } = context.window.tchoupiPlayer;

assert.equal(normalizeBookNumber("006"), "6");
assert.equal(normalizeBookNumber("0"), null);
assert.equal(normalizeBookNumber("1000"), null);

assert.equal(extractBookNumber("6"), "6");
assert.equal(extractBookNumber("book_006"), "6");
assert.equal(extractBookNumber("https://example.com/?book=6"), "6");
assert.equal(extractBookNumber("https://example.com/?book=006"), "6");
assert.equal(extractBookNumber("https://example.com/?kind=tchoupi_6"), "6");
assert.equal(extractBookNumber("https://example.com/?kind=tchoupi-006"), "6");
assert.equal(extractBookNumber("https://example.com/player/bok_006.mp3"), "6");
assert.equal(extractBookNumber("not-a-book"), null);

assert.equal(getNumberFromUrl("http://localhost:8080/?book=12"), "12");
assert.equal(getNumberFromUrl("http://localhost:8080/"), null);

console.log("app parser tests passed");
