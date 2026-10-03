import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const browserPath = process.env.BROWSER;
const baseUrl = process.env.VISUAL_REVIEW_URL ?? "http://127.0.0.1:3000/";
const outputDirectory = path.resolve(process.argv[2] ?? "visual-review");
const debugPort = 9333;
const userDataDirectory = `/tmp/cm-radio-visual-${process.pid}`;

if (!browserPath) {
  throw new Error("BROWSER must point to a Chromium-compatible executable.");
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForDebugTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((target) => target.type === "page");
        if (page?.webSocketDebuggerUrl) return page;
      }
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error("Timed out waiting for Chromium DevTools.");
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
  }

  async connect() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timed out opening DevTools WebSocket.")), 5000);
      this.socket.addEventListener("open", () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      this.socket.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("DevTools WebSocket failed."));
      }, { once: true });
    });

    this.socket.addEventListener("message", (event) => {
      const raw = typeof event.data === "string"
        ? event.data
        : Buffer.from(event.data).toString("utf8");
      const message = JSON.parse(raw);

      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result ?? {});
        return;
      }

      const waiter = this.waiters.get(message.method);
      if (!waiter) return;
      this.waiters.delete(message.method);
      clearTimeout(waiter.timeout);
      waiter.resolve(message.params ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`DevTools command timed out: ${method}`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method, timeoutMilliseconds = 10000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.waiters.delete(method);
        reject(new Error(`DevTools event timed out: ${method}`));
      }, timeoutMilliseconds);
      this.waiters.set(method, { resolve, reject, timeout });
    });
  }

  close() {
    this.socket.close();
  }
}

async function navigate(client, width, height, mobile = false) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile
  });
  const loaded = client.waitFor("Page.loadEventFired");
  await client.send("Page.navigate", { url: baseUrl });
  await loaded;
  await delay(1700);
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed.");
  }
  return result.result?.value;
}

async function screenshot(client, fileName) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true
  });
  await writeFile(path.join(outputDirectory, fileName), Buffer.from(result.data, "base64"));
}

await mkdir(outputDirectory, { recursive: true });

const chrome = spawn(browserPath, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDirectory}`,
  "about:blank"
], {
  stdio: "ignore"
});

try {
  const target = await waitForDebugTarget();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  await navigate(client, 1760, 824, false);
  const desktopFocused = await evaluate(
    client,
    `(() => {
      const separator = document.querySelector('[role="separator"]');
      if (!(separator instanceof HTMLElement)) return false;
      separator.focus();
      separator.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true
      }));
      return true;
    })()`
  );
  if (!desktopFocused) throw new Error("Desktop Radio separator was not found.");
  await delay(1100);
  const focusLayoutReached = await evaluate(
    client,
    `document.querySelector('[data-radio-expanded="true"] [data-radio-focus="true"]') !== null`
  );
  if (!focusLayoutReached) throw new Error("Desktop Radio did not reach focus composition.");
  await screenshot(client, "desktop-radio-focus-1760x824.png");

  const desktopClicked = await evaluate(
    client,
    `(() => {
      const link = document.querySelector('a[href="#radio"]');
      if (!(link instanceof HTMLElement)) return false;
      link.click();
      return true;
    })()`
  );
  if (!desktopClicked) throw new Error("Desktop Radio navigation control was not found.");
  await delay(140);
  await screenshot(client, "desktop-radio-transition-140ms.png");
  await delay(220);
  await screenshot(client, "desktop-radio-transition-360ms.png");
  await delay(420);
  await screenshot(client, "desktop-radio-transition-780ms.png");
  await delay(360);
  const desktopFullscreen = await evaluate(
    client,
    `document.querySelector('[data-radio-fullscreen="true"]') !== null`
  );
  if (!desktopFullscreen) throw new Error("Desktop Radio did not reach fullscreen state.");
  await screenshot(client, "desktop-radio-fullscreen-1760x824.png");

  await navigate(client, 1760, 824, false);
  const studioRouteClicked = await evaluate(
    client,
    `(() => {
      const link = document.querySelector('a[aria-label="Explore o estúdio"]');
      if (!(link instanceof HTMLElement)) return false;
      link.click();
      return true;
    })()`
  );
  if (!studioRouteClicked) throw new Error("Studio route CTA was not found.");
  await delay(180);
  await screenshot(client, "desktop-studio-route-enter-180ms.png");
  await delay(340);
  await screenshot(client, "desktop-studio-route-enter-520ms.png");
  await delay(720);
  const studioRouteReached = await evaluate(
    client,
    `window.location.pathname === "/studio" &&
      document.querySelector('[data-studio-route="detail"]') !== null`
  );
  if (!studioRouteReached) throw new Error("Studio route did not reach the detail world.");
  await screenshot(client, "desktop-studio-route-detail-1760x824.png");

  const studioBackClicked = await evaluate(
    client,
    `(() => {
      const link = document.querySelector('main a[aria-label="Voltar ao início"]');
      if (!(link instanceof HTMLElement)) return false;
      link.click();
      return true;
    })()`
  );
  if (!studioBackClicked) throw new Error("Studio back route control was not found.");
  await delay(320);
  await screenshot(client, "desktop-studio-route-exit-320ms.png");
  await delay(900);
  const homeRouteReached = await evaluate(
    client,
    `window.location.pathname === "/" &&
      document.querySelector('[data-studio-route="home"]') !== null`
  );
  if (!homeRouteReached) throw new Error("Studio route did not return to Home.");

  await navigate(client, 390, 844, true);
  const mobileStudioRouteClicked = await evaluate(
    client,
    `(() => {
      const link = document.querySelector('a[aria-label="Explore o estúdio"]');
      if (!(link instanceof HTMLElement)) return false;
      link.click();
      return true;
    })()`
  );
  if (!mobileStudioRouteClicked) throw new Error("Mobile Studio route CTA was not found.");
  await delay(360);
  await screenshot(client, "mobile-studio-route-transition-390x844.png");
  await delay(900);
  const mobileStudioReached = await evaluate(
    client,
    `window.location.pathname === "/studio" &&
      document.querySelector('[data-studio-route="detail"]') !== null`
  );
  if (!mobileStudioReached) throw new Error("Mobile Studio route did not open.");
  await screenshot(client, "mobile-studio-detail-390x844.png");

  await navigate(client, 390, 844, true);
  const mobileClicked = await evaluate(
    client,
    `(() => {
      const button = document.querySelector('button[aria-label="Abrir rádio completa"]');
      if (!(button instanceof HTMLElement)) return false;
      button.click();
      return true;
    })()`
  );
  if (!mobileClicked) throw new Error("Mobile Radio open control was not found.");
  await delay(1100);
  const mobileOpen = await evaluate(
    client,
    `document.querySelector('dialog[open][aria-label="CM Rádio completa"]') !== null`
  );
  if (!mobileOpen) throw new Error("Mobile Radio dialog did not open.");
  await screenshot(client, "mobile-radio-open-390x844.png");

  client.close();
} finally {
  chrome.kill("SIGTERM");

  await Promise.race([
    new Promise((resolve) => chrome.once("close", resolve)),
    delay(1200)
  ]);

  await rm(userDataDirectory, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100
  }).catch(() => undefined);
}
