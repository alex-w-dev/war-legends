export function onWindowLoad(cb: () => void) {
  if (document.readyState === "complete") {
    cb();
  } else {
    window.onload = cb;
  }
}
