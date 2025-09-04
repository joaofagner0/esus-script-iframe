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

      if (!response.ok) throw new Error("Falha na obtenção dos dados");

      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  }

  function generateHTML(data) {
    let alertCount = 0;

    if (data.status) {
      return { html: `<span>${data.status}</span>`, alertCount };
    }

    if (data.error) {
      return { html: `<span>${data.error}</span>` };
    }

    const groups = {
      ind2: { title: "Crianças", items: [] },
      ind3: { title: "Gestantes e Puérperas", items: [] },
      ind4: { title: "Diabéticos", items: [] },
      ind5: { title: "Hipertensos", items: [] },
      ind6: { title: "Idosos", items: [] },
      ind7: { title: "Mulheres na prevenção do câncer", items: [] },
    };

    for (const [key, value] of Object.entries(data)) {
      if (!value) continue;
      const prefix = key.match(/^ind\d/);
      if (prefix && groups[prefix[0]]) {
        groups[prefix[0]].items.push(value);
        alertCount++;
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
      alertCount++;
    }

    htmlParts.push('</ul>');

    return {
      html: htmlParts.join('\n'),
      alertCount
    };
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

      .iframe-button {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        padding-block: 5px;
        height: 252px;
        background: rgb(0, 81, 162);
        position: fixed;
        top: 50%;
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        z-index: 9991;
        cursor: pointer;
        border-radius: 4px;
        gap: 10px;
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

      .iframe-content > * :not(header, span, img) {
        width: 250px;
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

      .notification-badge {
        color: white;
        font-weight: bold;
        width: 18px;
        height: 18px;
        margin: 0;
        padding-left: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        font-size: 12px;
      }

      .notification-badge-square {
        color: white;
        font-weight: bold;
        padding: 6px 2px 7px 4px;
        border-radius: 10px;
        font-size: 12px;
        vertical-align: middle;
      }

      .badge-error {
        background-color: rgb(208, 29, 40);
      }

      .badge-beta {
        background-color: rgb(211, 212, 221);
        color: rgb(0, 81, 162);
      }

      .badge-success {
        background-color: rgb(35, 123, 1);
      }

      .iframe-button img {
        transform: rotate(180deg);
        width: 20px;
        margin-left: 1px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 307px;
      }
      
      .header img {
        width: 35px;
        margin: 0;
      }
    `;

    document.head.appendChild(style);

    const container = document.createElement("div");
    container.className = "iframe";
    container.id = "injected-panel";

    const indicators = await getIndicators();
    const { html, alertCount } = generateHTML(indicators);

    container.innerHTML = `
      <div class="iframe-button" id="iframe-button">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAASFBMVEVHcExApvY/pfY/pfYaddNApvcsi+ITcdBBp/cXdNI+pPUUctBAp/cXddIujuQ0lelAp/cWdNE/pfUoiOAXdNIYddIUctAYddLAdsKQAAAAGHRSTlMAjZ94Df//blSk/v7p/7jL8OKyRhe1MVpeXAiJAAAAgUlEQVR4Ad3OAQqDQAxE0bHadTWmVVf1/jd1kwA44An8AAOBB8ELaz41oLXpwLXfWuqzzwDOjqPIZKsalKGkGB2e4BgwKMFfwL+oGiU4Y3GIhWljxxx+RVGjBCfAoWxECSbdiQa0iVeJMlSi3Q3Obo6gG4C81gqKTT72Wg+fEy/qAmzyCRz5hTsqAAAAAElFTkSuQmCC">
        <section style="display: flex; align-items: center; gap: 5px;">
          INDICADORES
          ${
            indicators.error
              ? `<span class="notification-badge badge-error">x</span>`
              : alertCount > 0
                ? `<span class="notification-badge badge-error">${alertCount}</span>`
                : `<span class="notification-badge badge-success">v</span>`
          }
        </section>
        <span class="notification-badge-square badge-beta">BETA</span>
      </div>
      <div class="iframe-content">
        <div class="header">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAASFBMVEVHcExApvY/pfY/pfYaddNApvcsi+ITcdBBp/cXdNI+pPUUctBAp/cXddIujuQ0lelAp/cWdNE/pfUoiOAXdNIYddIUctAYddLAdsKQAAAAGHRSTlMAjZ94Df//blSk/v7p/7jL8OKyRhe1MVpeXAiJAAAAgUlEQVR4Ad3OAQqDQAxE0bHadTWmVVf1/jd1kwA44An8AAOBB8ELaz41oLXpwLXfWuqzzwDOjqPIZKsalKGkGB2e4BgwKMFfwL+oGiU4Y3GIhWljxxx+RVGjBCfAoWxECSbdiQa0iVeJMlSi3Q3Obo6gG4C81gqKTT72Wg+fEy/qAmzyCRz5hTsqAAAAAElFTkSuQmCC">
          <span style="font-weight: bold;">Indicadores de Qualidade</span>
          <span style="width: 35px;"></span>
        </div>
        ${indicators.error ? '<span style="font-size: small; margin-bottom: 7px;">(Os dados serão atualizados após o processamento)</span>' : '<span></span>'}
        ${html}
      </div>
    `;

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
