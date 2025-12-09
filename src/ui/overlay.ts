import { SPIN_ANIMATION_STYLE_ID } from "../constants";

export type Overlay = {
  content: HTMLElement;
  showBackdrop: () => Promise<void>;
  showContent: () => Promise<void>;
  hideAll: () => Promise<void>;
  destroy: () => Promise<void>;
  onClose: (handler: () => void) => void;
};

export default function createOverlay(renderToElement?: HTMLElement): Overlay {
  const root = renderToElement ?? document.createElement("div");
  const originalStyles = renderToElement ? root.style.cssText : null;

  if (renderToElement) {
    const computed = window.getComputedStyle(root);

    if (computed.position === "static") {
      root.style.position = "relative";
    }

    root.style.display = "flex";
    root.style.alignItems = "center";
    root.style.justifyContent = "center";
    root.style.transition = "background 0.3s ease";
    root.style.borderRadius = "5px";
  } else {
    root.style.cssText = `
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      background: rgba(0, 0, 0, 0.7);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;

    document.body.appendChild(root);
  }

  const spinner = document.createElement("div");

  spinner.style.cssText = `
    width: 32px;
    height: 32px;
    border: 4px solid rgba(255, 255, 255, 0.7);
    border-bottom-color: transparent;
    border-radius: 50%;
    position: absolute;
    animation: paynow-gg_spin 1s linear infinite;
    transition: opacity 0.3s ease;
  `;

  if (!document.getElementById(SPIN_ANIMATION_STYLE_ID)) {
    const style = document.createElement("style");

    style.id = SPIN_ANIMATION_STYLE_ID;

    style.textContent = `
      @keyframes paynow-gg_spin {
        to { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
  }

  const content = document.createElement("div");

  content.style.cssText = `
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  root.appendChild(spinner);
  root.appendChild(content);

  let closeHandler: (() => void) | null = null;

  const handleKeydown = (e: KeyboardEvent) => {
    if (!renderToElement && e.key === "Escape" && closeHandler) {
      closeHandler();
    }
  };

  const showBackdrop = async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (renderToElement) {
      root.style.background = "rgba(0, 0, 0, 0.7)";
    } else {
      document.body.style.overflow = "hidden";

      root.style.opacity = "1";
      root.style.pointerEvents = "auto";
    }

    document.addEventListener("keydown", handleKeydown);
  };

  const showContent = async () => {
    spinner.style.opacity = "0";
    content.style.opacity = "1";
  };

  const hideAll = async () => {
    document.removeEventListener("keydown", handleKeydown);

    content.style.opacity = "0";
    spinner.style.opacity = "0";

    if (renderToElement) {
      root.style.background = "transparent";
    } else {
      document.body.style.overflow = "";

      root.style.opacity = "0";
      root.style.pointerEvents = "none";
    }

    await new Promise((resolve) => {
      root.addEventListener("transitionend", resolve, { once: true });
    });
  };

  const destroy = async () => {
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";

    spinner.remove();
    content.remove();

    if (renderToElement) {
      root.style.cssText = originalStyles ?? "";
    } else {
      root.remove();
    }

    closeHandler = null;
  };

  const onClose = (handler: () => void) => {
    closeHandler = handler;
  };

  return {
    content,
    showBackdrop,
    showContent,
    hideAll,
    destroy,
    onClose,
  };
}
