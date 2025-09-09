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
      removePanel();

      if (injectedPanel) {
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

  const indicatorPdfMap = {
    'ind2a': 'https://drive.google.com/file/d/1HaSh3wgVByXU3HxoFSzB-IKldAeZR2cm/preview',
    'ind2b': 'https://drive.google.com/file/d/1gIdFoCq6F1AO6FH4nGEomKGkpMe_TXNu/preview',
    'ind2c': 'https://drive.google.com/file/d/1fpZeisAEXEclmfaEXEKUkvGvjPTUBN5r/preview',
    'ind2d': 'https://drive.google.com/file/d/1pj0jJeqhXcm5xiqYcKynQjQcxuETJAHg/preview',
    'ind2e': 'https://drive.google.com/file/d/14Tumo_0ETnJSewD55j2Kdu4Vlgt6svBD/preview',
    'ind3a': 'https://drive.google.com/file/d/1Q42w69j6-SwsHUeABBV34o6mSUWE4dsL/preview',
    'ind3b': 'https://drive.google.com/file/d/1iWqIxE5ngDjwB1snqdR3HCHltA9vr3tb/preview',
    'ind3c': 'https://drive.google.com/file/d/1HZx26fB3sc8Y8w7VJUnzkfBBFE9RyqGV/preview',
    'ind3d': 'https://drive.google.com/file/d/1hj157QrGYvAcqrMS04h0JEOdGD0-ho0Z/preview',
    'ind3e': 'https://drive.google.com/file/d/1E8D8Zp08Xm1U_tltEgcp1RJVe0KHsuPm/preview',
    'ind3f': 'https://drive.google.com/file/d/1BuE-auyn8NdrvZR8Kpu_VM5X98JkUbBi/preview',
    'ind3g': 'https://drive.google.com/file/d/1ZJGyn8tCz3kVRezmE0BlrxexD_eTbSJq/preview',
    'ind3h': 'https://drive.google.com/file/d/15NFpABg2SD4BCVEVPRR3ASFpPpLkcOKb/preview',
    'ind3j': 'https://drive.google.com/file/d/15WMD1tU5qTDwLYYytaoHz3KI-dKph6NY/preview',
    'ind4a': 'https://drive.google.com/file/d/1wcAXjLE9PgqdvGYayoUkdxjt0px6Mc-3/preview',
    'ind4b': 'https://drive.google.com/file/d/1kJ9jZkvDrHQjiN0bgRq46iswcL0hbcf7/preview',
    'ind4c': 'https://drive.google.com/file/d/1mQe0A447WCrM8XpZKNNrUiDpXfnT35L0/preview',
    'ind4d': 'https://drive.google.com/file/d/1vMP1B2PeSkd11N6QzYgNoAiVYJznA-dD/preview',
    'ind4e': 'https://drive.google.com/file/d/17q_-kqCfArho0NUhRB0hcPAaEsoTxmvr/preview',
    'ind4f': 'https://drive.google.com/file/d/1gt5zyg1hBTZBi0EtHSOZvR7_K4Iu-8r4/preview',
    'ind5a': 'https://drive.google.com/file/d/1mlQ-4zwH-pbegDFklyG0Wen9ef-xYvaQ/preview',
    'ind5b': 'https://drive.google.com/file/d/1EwnPPWOcJGuYCyD3ZTiViwrgw4FiLxrg/preview',
    'ind5c': 'https://drive.google.com/file/d/1FHOpRXt2iqm7gmoXLKByqhirDn_B45pw/preview',
    'ind5d': 'https://drive.google.com/file/d/1ys-TZEuZShipjO7kOY2nMnuQVmesQM_P/preview',
    'ind6a': 'https://drive.google.com/file/d/1WtPfmnpeDVVjbxnsCGEtxhoJugGErXNn/preview',
    'ind6b': 'https://drive.google.com/file/d/1EZ47Ry4z7BZItl7MDamAc81xYmPju2gT/preview',
    'ind6c': 'https://drive.google.com/file/d/11dcGXvchik2eLKsgAihUlCMCZImyeLVu/preview',
    'ind7a': 'https://drive.google.com/file/d/10UXYtqk-bD8oEUJkey825Cn6jtWVX_h0/preview',
    'ind7c': 'https://drive.google.com/file/d/1moN6dE1U4fnyWw3ksMDxey_0sNrkmBFe/preview',
    'ind7d': 'https://drive.google.com/file/d/1ut8A9Iff5o40iGjDaBUE7GNk520M-4p_/preview'
  };

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
        groups[prefix[0]].items.push({ text: value, indicator: key });
        alertCount++;
      }
    }

    const htmlParts = ['<div class="indicators-container">'];

    for (const group of Object.values(groups)) {
      if (group.items.length === 0) continue;
      htmlParts.push(`<div class="group-title">${group.title}</div>`);
      for (const item of group.items) {
        const indicator = item.indicator;
        const text = item.text;
        const hasPdf = indicator && indicatorPdfMap[indicator];
        
        if (hasPdf) {
          htmlParts.push(`<div class="indicator-row has-pdf" data-indicator="${indicator}">
            <span>${text}</span>
          </div>`);
        } else {
          htmlParts.push(`<div class="indicator-row no-pdf" data-indicator="${indicator || 'unknown'}">
            <span>${text}</span>
          </div>`);
        }
      }
    }

    if (data.st_cad) {
      htmlParts.push(`<div class="group-title">Cadastro</div>`);
      htmlParts.push(`<div class="indicator-row no-pdf" data-indicator="cadastro">
        <span>${data.st_cad}</span>
      </div>`);
      alertCount++;
    }

    htmlParts.push('</div>');

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
        z-index: 9997;
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
        align-items: flex-start;
        height: 250px;
        color: rgb(36, 37, 46);
        font-size: 1rem;
        opacity: 0;
        visibility: hidden;
        padding: 10px 15px;
        transition: opacity 0.4s ease;
        width: 100%;
        box-sizing: border-box;
      }

      .iframe.iframeClick,
      .iframe:hover {
        width: 380px;
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
        width: 340px;
      }
      
      .header img {
        width: 35px;
        margin: 0;
      }

      .pdf-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        justify-content: center;
        align-items: center;
      }

      .pdf-modal.active {
        display: flex;
      }

      .pdf-container {
        position: relative;
        width: 90vw;
        height: 80vh;
        background: #fff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }

      .pdf-container iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 10px;
      }

      .pdf-close {
        position: absolute;
        top: 12px;
        right: 75px;
        background: rgba(0,0,0,0);
        color: #c4c7c5;
        border: none;
        padding: 11px 12px;
        cursor: pointer;
        z-index: 10001;
        font-size: 18px;
        line-height: 1;
        font-weight: bold;
        transition: background-color 0.2s ease;
      }

      .pdf-close:hover {
        background: #060606;
      }

      .indicators-container {
        overflow-y: auto;
        max-height: 200px;
        padding: 0;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .group-title {
        font-weight: bold;
        color: rgb(36, 37, 46);
        margin: 8px 0 4px 0;
        padding: 0 8px;
        font-size: 16px;
      }

      .processing-text {
        text-align: center;
        font-size: 13px;
        padding: 0 15px;
        margin-bottom: 8px;
      }

      .indicator-row {
        cursor: pointer;
        padding: 6px 8px;
        margin: 5px 0;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-size: 14px;
        line-height: 1.3;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        max-width: 100%;
        box-sizing: border-box;
      }

      .indicator-row span {
        flex: 1;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        min-width: 0;
      }

      .indicator-row:hover {
        background-color: rgba(0, 81, 162, 0.1);
      }

      .indicator-row.has-pdf {
        border-left: 3px solid rgb(0, 81, 162);
      }

      .indicator-row.no-pdf {
        border-left: 3px solid rgb(208, 29, 40);
      }

      .pdf-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        color: #666;
        z-index: 10002;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid rgb(0, 81, 162);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        font-size: 14px;
        font-weight: 500;
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
          ${indicators.error
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

        ${!indicators.error ? '<div class="processing-text">(Os dados serão atualizados após o processamento)</div>' : '<div></div>'}
        ${html}
      </div>
    `;

    document.body.appendChild(container);

    let pdfModalOpen = false;
    let currentPdfModal = null;

    container.addEventListener("click", (e) => {
      const indicatorRow = e.target.closest(".indicator-row");
      if (indicatorRow) {
        const indicator = indicatorRow.getAttribute("data-indicator");
        const pdfUrl = indicatorPdfMap[indicator];
        
        if (pdfUrl) {
          if (currentPdfModal) {
            currentPdfModal.remove();
          }
          
          currentPdfModal = document.createElement("div");
          currentPdfModal.className = "pdf-modal active";
          currentPdfModal.setAttribute("role", "dialog");
          currentPdfModal.setAttribute("aria-hidden", "false");
          currentPdfModal.innerHTML = `
            <div class="pdf-container">
              <div class="pdf-loading">
                <div class="spinner"></div>
                <div class="loading-text">Carregando PDF...</div>
              </div>
              <iframe src="${pdfUrl}" allow="autoplay" style="opacity: 0;"></iframe>
              <button class="pdf-close" aria-label="Fechar">✕</button>
            </div>
          `;
          document.body.appendChild(currentPdfModal);
          
          const closeBtn = currentPdfModal.querySelector(".pdf-close");
          closeBtn.addEventListener("click", () => {
            currentPdfModal.remove();
            currentPdfModal = null;
            pdfModalOpen = false;
          });

          const iframe = currentPdfModal.querySelector("iframe");
          const loadingDiv = currentPdfModal.querySelector(".pdf-loading");
          
          iframe.addEventListener("load", () => {
            loadingDiv.style.display = "none";
            iframe.style.opacity = "1";
            iframe.style.transition = "opacity 0.3s ease";
          });

          setTimeout(() => {
            if (loadingDiv && loadingDiv.style.display !== "none") {
              loadingDiv.style.display = "none";
              iframe.style.opacity = "1";
              iframe.style.transition = "opacity 0.3s ease";
            }
          }, 5000);
          
          currentPdfModal.addEventListener("click", (e) => {
            if (e.target === currentPdfModal) {
              currentPdfModal.remove();
              currentPdfModal = null;
              pdfModalOpen = false;
            }
          });
          
          pdfModalOpen = true;
          container.classList.remove("iframeClick");
        } else {
          alert(`PDF em implementação para este indicador.`);
        }
      }
    });



    container.addEventListener("click", (e) => {
      if (!e.target.closest(".indicator-row") && !pdfModalOpen) {
        container.classList.toggle("iframeClick");
      }
      e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target) && !pdfModalOpen) {
        container.classList.remove("iframeClick");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && currentPdfModal) {
        currentPdfModal.remove();
        currentPdfModal = null;
        pdfModalOpen = false;
      }
    });
  }

  function removePanel() {
    const panel = document.getElementById("injected-panel");
    
    if (panel) panel.remove();
  }
})();
