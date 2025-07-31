(function () {
  let injectedPanel = false;

  function isAllowedUrl() {
    return window.location.href.includes("/lista-atendimento/atendimento/");
  }

  function handleUrlChange() {
    if (isAllowedUrl()) {
      if (!injectedPanel) {
        injectPanel();
        injectedPanel = true;
      }
    } else {
      if (injectedPanel) {
        removePanel();
        injectedPanel = false;
      }
    }
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    window.dispatchEvent(new Event("urlchange"));
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    window.dispatchEvent(new Event("urlchange"));
  };

  window.addEventListener("popstate", handleUrlChange);
  window.addEventListener("urlchange", handleUrlChange);

  handleUrlChange();

  async function getIndicators() {
    try {
      const response = await fetch(`/citizen-indicators`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Erro ao buscar dados");

      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  }

  function generateHTML(data) {
    let hasAlert = false;

    if (data.status) {
      return `<span>${data.status}</span>`;
    }

    if (data.error) {
      return `<span>Erro: ${data.error}</span>`;
    }

    const groups = {
      ind2: { title: "Crianças", items: [] },
      ind4: { title: "Diabéticos", items: [] },
      ind5: { title: "Hipertensos", items: [] },
      ind6: { title: "Idosos", items: [] },
      ind7: { title: "Mulheres na prevenção do cancêr", items: [] },
    };

    for (const [key, value] of Object.entries(data)) {
      if (!value) continue;
      const prefix = key.match(/^ind\d/);
      if (prefix && groups[prefix[0]]) {
        groups[prefix[0]].items.push(value);
        hasAlert = true;
      }
    }

    const htmlParts = ['<ul style="overflow: auto;">'];

    for (const group of Object.values(groups)) {
      if (group.items.length === 0) continue;
      htmlParts.push(`<li>${group.title}</li><ul>`);
      for (const item of group.items) {
        htmlParts.push(`<li>${item}</li>`);
      }
      htmlParts.push(`</ul>`);
    }

    if (data.st_cad) {
      htmlParts.push(`<li>Cadastro</li><ul><li>${data.st_cad}</li></ul>`);
    }

    htmlParts.push('</ul>');

    return { html: htmlParts.join('\n'), hasAlert };
  }

  async function injectPanel() {
    if (document.getElementById("injected-panel")) return;

    const style = document.createElement("style");
    style.textContent = `
      * {
        font-family: "IBM Plex Sans", sans-serif;
      }

      .iframe {
        position: fixed;
        top: 50%;
        right: 5px;
        height: 250px;
        width: 0;
        z-index: 9990;
        background: rgb(240, 240, 245);
        overflow: hidden;
        display: flex;
        justify-content: center;
        border-radius: 4px;
        transition: width 0.4s ease, box-shadow 0.4s ease, border 0.4s ease;
      }

      .iframe::before {
        content: "INDICADORES";
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        padding-block: 5px;
        height: 250px;
        background: rgb(0, 81, 162);
        #background: rgb(255, 255, 255);
        #color: rgb(36, 37, 46);
        #border: 1px solid rgb(211, 212, 221);
        position: fixed;
        top: 50%;
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9991;
        cursor: pointer;
        border-radius: 4px;
      }

      .iframe-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 250px;
        color: rgb(36, 37, 46);
        font-size: 1rem;
        opacity: 0;
        visibility: hidden;
        padding-block: 10px;
        transition: opacity 0.4s ease;
        padding-right: 15px;
      }

      .iframe.iframeClick,
      .iframe:hover {
        width: 350px;
        padding-right: 8px;
        border: 1px solid rgb(143, 143, 162);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
                    0 2px 1px -1px rgba(0, 0, 0, 0.12),
                    0 1px 1px rgba(0, 0, 0, 0.14);
      }

      .iframe.iframeClick .iframe-content,
      .iframe:hover .iframe-content {
        opacity: 1;
        visibility: visible;
      }

      .iframe.alert {
        animation: blink-red 1s infinite;
      }

      .iframe.alert::before {
        animation: blink-red 1s infinite;
        box-shadow: 0 0 8px red;
      }

      @keyframes blink-red {
        0%, 100% { box-shadow: 0 0 10px red; }
        50% { box-shadow: 0 0 0 transparent; }
      }
    `;

    document.head.appendChild(style);

    const container = document.createElement("div");
    container.className = "iframe";
    container.id = "injected-panel";

    const indicators = await getIndicators();
    const { html, hasAlert } = generateHTML(indicators);

    container.innerHTML = `
      <div class="iframe-content">
        <span style="font-weight: bold;">Indicadores de Qualidade</span>
        ${html}
      </div>
    `;

    if (hasAlert) {
      container.classList.add("alert");
    }

    document.body.appendChild(container);

    container.addEventListener("click", (e) => {
      container.classList.toggle("iframeClick");
      e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        container.classList.remove("iframeClick");
      }
    });
  }

  function removePanel() {
    const panel = document.getElementById("injected-panel");
    if (panel) panel.remove();
  }
})();