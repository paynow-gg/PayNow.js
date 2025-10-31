export type Modal = {
  root: HTMLElement;
  content: HTMLElement;
  showBackdrop: () => Promise<void>;
  showContent: () => Promise<void>;
  hideAll: () => Promise<void>;
  destroy: () => Promise<void>;
  onClose: (handler: () => void) => void;
};

export default function createModal(): Modal {
  const root = document.createElement("div");

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

  const spinner = document.createElement("div");

  spinner.style.cssText = `
    width: 32px;
    height: 32px;
    border: 4px solid rgba(255, 255, 255, 0.7);
    border-bottom-color: transparent;
    border-radius: 50%;
    position: absolute;
    animation: paynow-gg_spin 1s linear infinite;
  `;

  const style = document.createElement("style");

  style.textContent = `
    @keyframes paynow-gg_spin {
      to { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);

  const content = document.createElement("div");

  content.style.cssText = `
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  root.appendChild(spinner);
  root.appendChild(content);

  document.body.appendChild(root);

  let closeHandler: (() => void) | null = null;

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && closeHandler) {
      closeHandler();
    }
  };

  const showBackdrop = async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    document.body.style.overflow = "hidden";
    root.style.opacity = "1";
    root.style.pointerEvents = "auto";

    document.addEventListener("keydown", handleKeydown);
  };

  const showContent = async () => {
    spinner.style.opacity = "0";
    content.style.opacity = "1";
  };

  const hideAll = async () => {
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";

    content.style.opacity = "0";
    root.style.opacity = "0";
    root.style.pointerEvents = "none";

    await new Promise((resolve) => {
      root.addEventListener("transitionend", resolve, { once: true });
    });
  };

  const destroy = async () => {
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";

    if (root.parentNode) {
      document.body.removeChild(root);
    }

    closeHandler = null;
  };

  const onClose = (handler: () => void) => {
    closeHandler = handler;
  };

  return {
    root,
    content,
    showBackdrop,
    showContent,
    hideAll,
    destroy,
    onClose,
  };
}
