// ==============================================
// BOTÓN PARA COPIAR TOKEN EN EL INPUT DE AUTORIZACIÓN
// ==============================================
window.addEventListener("load", () => {
  console.log("Swagger Custom JS Cargado ✔");

  // Observador para detectar cuando Swagger genera el input
  const observerAuth = new MutationObserver(() => {
    const tokenField = document.querySelector("input[placeholder='api_key']");

    if (tokenField && !document.getElementById("copyTokenBtn")) {

      const btn = document.createElement("button");
      btn.id = "copyTokenBtn";
      btn.innerText = "Copiar Token";

      // Estilos
      btn.style.marginLeft = "10px";
      btn.style.padding = "6px 12px";
      btn.style.background = "#1976D2";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";

      btn.onclick = () => {
        navigator.clipboard.writeText(tokenField.value);
        alert("Token copiado al portapapeles ✔");
      };

      tokenField.parentNode.appendChild(btn);
    }
  });

  observerAuth.observe(document.body, { childList: true, subtree: true });

  // ==============================================
  // BOTÓN PARA COPIAR TOKEN EN LA RESPUESTA DEL LOGIN
  // ==============================================

  const observerResponse = new MutationObserver(() => {
    const preBlocks = document.querySelectorAll("pre");

    preBlocks.forEach(pre => {
      if (
        pre.innerText.includes('"token":') &&
        !pre.parentElement.querySelector(".copyTokenResponseBtn")
      ) {
        let jsonText = pre.innerText;
        let token;

        try {
          // Obtener el token del JSON
          const obj = JSON.parse(jsonText);
          token = obj.token;
        } catch (e) {
          return; // no es JSON válido
        }

        // Crear botón
        const btn2 = document.createElement("button");
        btn2.className = "copyTokenResponseBtn";
        btn2.innerText = "Copiar Token";

        btn2.style.margin = "10px 0";
        btn2.style.padding = "6px 12px";
        btn2.style.background = "#4CAF50";
        btn2.style.color = "white";
        btn2.style.border = "none";
        btn2.style.borderRadius = "6px";
        btn2.style.cursor = "pointer";
        btn2.style.display = "block";

        btn2.onclick = () => {
          navigator.clipboard.writeText(token);
          alert("Token copiado desde la respuesta ✔");
        };

        pre.parentElement.appendChild(btn2);
      }
    });
  });

  observerResponse.observe(document.body, { childList: true, subtree: true });
});
