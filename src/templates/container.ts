import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../constants";

export default function createContainerTemplate({
  frame,
  prerenderFrame,
}: {
  frame: HTMLIFrameElement;
  prerenderFrame: HTMLIFrameElement;
}) {
  const container = document.createElement("div");

  container.style.cssText = `
    position: relative;
    width: ${DEFAULT_WIDTH}px;
    height: ${DEFAULT_HEIGHT}px;
  `;

  prerenderFrame.style.cssText = `
    position: absolute;
    width: 100%;
    height: 100%;
    border: none;
  `;

  frame.style.cssText = `
    position: absolute;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 5px !important;
  `;

  container.appendChild(prerenderFrame);
  container.appendChild(frame);

  return container;
}
