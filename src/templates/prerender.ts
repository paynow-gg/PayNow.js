export default function createPrerenderTemplate({ doc }: { doc: Document }) {
  const html = doc.createElement("html");
  const body = doc.createElement("body");

  body.style.cssText = `
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none !important;
  `;

  html.appendChild(body);

  return html;
}
