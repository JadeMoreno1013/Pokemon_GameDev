/*
 * Escáner: abre la cámara AR a pantalla completa y permite volver a la web.
 * El motor AR (Three.js + MindAR) se descarga solo cuando hace falta.
 */
(function () {
    const overlay = document.getElementById("ar-overlay");
    const btnEscanear = document.getElementById("btn-escanear");
    const btnVolver = document.getElementById("ar-back");
    const enlaceCartas = document.getElementById("ar-cards");
    const btnIniciar = document.getElementById("start-ar");
    const textoEstado = document.getElementById("status-text");
    const aviso = document.getElementById("ar-toast");
    const avisoTexto = document.getElementById("ar-toast-text");

    let motor = null;
    let cargando = null;
    let abierto = false;
    let temporizadorAviso = null;

    function cargarMotor() {
        if (!cargando) {
            cargando = import("./ar/main.js")
                .then((modulo) => (motor = modulo))
                .catch((error) => {
                    cargando = null;
                    throw error;
                });
        }
        return cargando;
    }

    function mostrarErrorDeCarga() {
        textoEstado.textContent = "No se pudo cargar la experiencia AR. Revisa tu conexión e inténtalo de nuevo.";
    }

    function pedirPantallaCompleta() {
        try {
            if (overlay.requestFullscreen) {
                overlay.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
            } else if (overlay.webkitRequestFullscreen) {
                overlay.webkitRequestFullscreen();
            }
        } catch (error) {
            /* sin pantalla completa nativa: el overlay ya cubre toda la ventana */
        }
    }

    function salirDePantallaCompleta() {
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } catch (error) {
            /* nada que cerrar */
        }
    }

    async function abrir() {
        if (abierto) return;
        abierto = true;

        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("ar-open");
        pedirPantallaCompleta();
        // Con una entrada de historial, el botón "atrás" del celular cierra la cámara
        history.pushState({ arAbierto: true }, "");
        btnVolver.focus();

        try {
            const ar = await cargarMotor();
            if (abierto) await ar.startAR();
        } catch (error) {
            console.error(error);
            mostrarErrorDeCarga();
        }
    }

    async function cerrar(desdeHistorial) {
        if (!abierto) return;
        abierto = false;

        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("ar-open");
        ocultarAviso();
        salirDePantallaCompleta();
        if (!desdeHistorial && history.state && history.state.arAbierto) history.back();
        btnEscanear.focus();

        if (motor) {
            await motor.closeAR();
            // Si se volvió a abrir mientras se cerraba, se reanuda
            if (abierto) motor.startAR();
        }
    }

    function mostrarAviso(titulo) {
        avisoTexto.textContent = `¡Carta desbloqueada: ${titulo}!`;
        aviso.hidden = false;
        aviso.classList.add("is-visible");
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(ocultarAviso, 7000);
    }

    function ocultarAviso() {
        clearTimeout(temporizadorAviso);
        aviso.classList.remove("is-visible");
        aviso.hidden = true;
    }

    // El motor AR avisa cada vez que detecta una carta
    window.addEventListener("pokemon:detectado", (evento) => {
        const { cardId, title } = evento.detail;
        const esNueva = window.Cartas && window.Cartas.desbloquear(cardId);
        if (esNueva && window.Cartas.existe(cardId)) mostrarAviso(title);
    });

    btnEscanear.addEventListener("click", abrir);
    btnVolver.addEventListener("click", () => cerrar(false));
    enlaceCartas.addEventListener("click", () => {
        if (motor) motor.closeAR();
    });
    window.addEventListener("popstate", () => cerrar(true));
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") cerrar(false);
    });

    // Si el motor no pudo cargarse, el botón principal del overlay reintenta
    btnIniciar.addEventListener("click", () => {
        if (motor || !abierto) return;
        cargarMotor()
            .then((ar) => ar.startAR())
            .catch(mostrarErrorDeCarga);
    });

    // Se precarga en segundo plano para que la cámara abra rápido
    const alTenerTiempo = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    alTenerTiempo(() => cargarMotor().catch(() => {}));
})();
