(function () {
  let painelInjetado = false;

  // function urlEhPermitida() {
  //   return window.location.href.includes("/folha-rosto");
  // }

  function injetarPainel() {
    if (document.getElementById("injected-panel")) return;

    const style = document.createElement("style");
    style.textContent = `
      * {
        font-family: 'Lucida Sans', sans-serif;
      }

      .iframe::before {
        content: "INDICADORES";
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        padding: 5px;
        height: auto;
        font-size: medium;
        background-color: #071D41;
        top: 40%;
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        z-index: 9990;
        cursor: pointer;
      }

      .iframe {
        height: 135px;
        width: 0px;
        position: fixed;
        z-index: 9990;
        top: 40%;
        right: 5px;
        background-color: #f0f8ff;
        padding-left: 10px;
        overflow: hidden;
        display: flex;
      }

      .iframe-content {
        opacity: 0;
        visibility: hidden;
        display: flex;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }

      .iframe.iframeClick, .iframe:hover {
        padding-block: 10px;
        padding-right: 20px;
        height: auto;
        width: auto;
        transition: all 0.3s ease-out;
        border-left: 10px solid #071D41;
      }

      .iframe.iframeClick .iframe-content, .iframe:hover .iframe-content {
        opacity: 1;
        visibility: visible;
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.className = "iframe";
    container.id = "injected-panel";
    container.innerHTML = `
      <div class="iframe-content">
        <span>Indicadores de Qualidade</span>
        <ul>
            <li>
                Hipertensão
            </li>
            <ul>
                <li>
                    Falta aferir PA
                </li>
            </ul>
            <li>
                Diabetes
            </li>
            <ul>
                <li>
                    Fazer exame de HbA1c
                </li>
                <li>
                    Realizar consulta no período
                </li>
            </ul>
            <li>
                Saúde da Mulher
            </li>
            <ul>
                <li>
                    Fazer exame de citopatologia
                </li>
            </ul>
        </ul>
      </div>
    `;
    document.body.appendChild(container);

    container.addEventListener("click", (e) => {
      container.classList.toggle("iframeClick");
      e.stopPropagation();
    });

    document.getElementById("downlaoad-icon").addEventListener("click", (e) => {
      container.classList.toggle("downlaoad-icon");
      const url = window.location.pathname;
      const partes = url.split("/");
      const index = partes.indexOf("folha-rosto");
      const code = partes[index - 1];

      try {
        const headers = new Headers();
        if(url.includes("lista-atendimento")) {
          headers.append("medicalRecordId", code);
        } else {
          headers.append("citizenCode", code);
        }

        fetch("/citizen", { //Utilizar o caminho utilizado no nginx pra fazer o proxy reverso
          headers: headers,
          method: "GET",
        }).then((response) => {
          if (!response.ok) throw new Error("Erro ao buscar PDF");
            return response.blob();
          })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = "folha_rosto.pdf";
          a.click();
        })
       
      } catch (error) {
        console.log(error);
      }

      e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        container.classList.remove("iframeClick");
      }
    });
  }

  function removerPainel() {
    const painel = document.getElementById("injected-panel");
    if (painel) painel.remove();
  }

  function verificarUrlPeriodicamente() {
    let urlAnterior = "";

    setInterval(() => {
      const urlAtual = window.location.href;
      if (urlAtual !== urlAnterior) {
        urlAnterior = urlAtual;

        if (1 == 1 || urlEhPermitida()) {
          if (!painelInjetado) {
            injetarPainel();
            painelInjetado = true;
          }
        } else {
          if (painelInjetado) {
            removerPainel();
            painelInjetado = false;
          }
        }
      }
    }, 100);
  }

  verificarUrlPeriodicamente();
})();