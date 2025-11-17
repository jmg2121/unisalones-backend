// ==============================================
// AGREGAR LOGO PERSONALIZADO EN EL HEADER DE SWAGGER
// ==============================================
function insertCustomLogo() {
  const checkInterval = setInterval(() => {
    const wrapper = document.querySelector(".swagger-ui .topbar .topbar-wrapper");

    // Asegurar que Swagger cargó y no hay logo repetido
    if (wrapper && !document.getElementById("custom-logo")) {

      // 1. Cambiar color de la barra superior
      const topbar = document.querySelector(".swagger-ui .topbar");
      if (topbar) {
        topbar.style.backgroundColor = "#003366"; // Azul institucional
        topbar.style.borderBottom = "3px solid #1e90ff"; // Línea azul clara
      }

      // 2. Eliminar el logo verde de Swagger
      const swaggerLogo = wrapper.querySelector("img");
      if (swaggerLogo) swaggerLogo.remove();

      // 3. Insertar tu logo
      const img = document.createElement("img");
      img.id = "custom-logo";
      img.src = "/assets/logo.png";
      img.style.height = "100px";
      img.style.marginRight = "50px";
      img.style.objectFit = "contain";

      wrapper.prepend(img);

      console.log("Logo Unisalones agregado ✔");
      clearInterval(checkInterval);
    }
  }, 300);
}

// ==============================================
// BOTÓN PARA COPIAR TOKEN EN EL INPUT DE AUTORIZACIÓN
// ==============================================
function enableCopyTokenFromAuthBox() {
  const observerAuth = new MutationObserver(() => {
    const tokenField = document.querySelector("input[placeholder='api_key']");

    if (tokenField && !document.getElementById("copyTokenBtn")) {
      const btn = document.createElement("button");
      btn.id = "copyTokenBtn";
      btn.innerText = "Copiar Token 📋";

      btn.style.marginLeft = "10px";
      btn.style.padding = "6px 12px";
      btn.style.background = "#1976D2";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";

      btn.onclick = () => {
        navigator.clipboard.writeText(tokenField.value);
        alert("UNISALONES: Token Copiado al Portapapeles 📋");
      };

      tokenField.parentNode.appendChild(btn);
    }
  });

  observerAuth.observe(document.body, { childList: true, subtree: true });
}

// ==============================================
// BOTÓN PARA COPIAR TOKEN DESDE RESPUESTA DEL LOGIN
// ==============================================
function enableCopyTokenFromResponse() {
  const observerResponse = new MutationObserver(() => {
    const preBlocks = document.querySelectorAll("pre");

    preBlocks.forEach(pre => {
      if (
        pre.innerText.includes('"token":') &&
        !pre.parentElement.querySelector(".copyTokenResponseBtn")
      ) {
        let token;

        try {
          const obj = JSON.parse(pre.innerText);
          token = obj.token;
        } catch (e) {
          return;
        }

        const btn2 = document.createElement("button");
        btn2.className = "copyTokenResponseBtn";
        btn2.innerText = "Copiar Token 📋";

        btn2.style.margin = "10px 0";
        btn2.style.padding = "6px 12px";
        btn2.style.background = "#0044ffff";
        btn2.style.color = "white";
        btn2.style.border = "none";
        btn2.style.borderRadius = "6px";
        btn2.style.cursor = "pointer";
        btn2.style.display = "block";

        btn2.onclick = () => {
          navigator.clipboard.writeText(token);
          alert("UNISALONES: Token Copiado al Portapapeles 📋");
        };

        pre.parentElement.appendChild(btn2);
      }
    });
  });

  observerResponse.observe(document.body, { childList: true, subtree: true });
}

// ==============================================
// EJECUTAR TODO AL CARGAR SWAGGER
// ==============================================
window.addEventListener("load", () => {
  console.log("Swagger Custom JS Cargado ✔");

  insertCustomLogo();              // Solo topbar azul + logo
  enableCopyTokenFromAuthBox();    // Copiar token en auth
  enableCopyTokenFromResponse();   // Copiar token desde login
});
