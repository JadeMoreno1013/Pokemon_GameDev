/*
 * Colección de cartas: recuerda cuáles se han escaneado y devuelve el color
 * a su imagen en la página de Cartas (clase .unlocked).
 */
(function () {
    const CLAVE = "pokemon-gamedev:cartas";

    // Cartas de la página de Cartas (valor de data-pokemon).
    // Haunter aún no tiene target en el archivo .mind del AR.
    const CARTAS = [
        "garchomp", "baxcalibur", "diglett", "gengar", "haunter",
        "ho-oh", "lugia", "marowak", "ursaluna", "vaporeon",
        "snorlax", "charmander", "clefairy", "clefable", "lunala",
        "metagross", "naganadel",
    ];

    // Si el navegador bloquea localStorage, la colección dura mientras la página esté abierta
    let memoria = [];

    function leer() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE));
            return Array.isArray(datos) ? datos : memoria;
        } catch (error) {
            return memoria;
        }
    }

    function guardar(lista) {
        memoria = lista;
        try {
            localStorage.setItem(CLAVE, JSON.stringify(lista));
        } catch (error) {
            /* sin almacenamiento: se queda en memoria */
        }
    }

    const CLAVE_VISTAS = "pokemon-gamedev:cartas-vistas";
    let memoriaVistas = [];

    function leerVistas() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE_VISTAS));
            return Array.isArray(datos) ? datos : memoriaVistas;
        } catch (error) {
            return memoriaVistas;
        }
    }

    function guardarVistas(lista) {
        memoriaVistas = lista;
        try {
            localStorage.setItem(CLAVE_VISTAS, JSON.stringify(lista));
        } catch (error) {
            return;
        }
    }

    function prepararDorso(marco) {
        if (marco.querySelector(".carta-dorso")) return;
        const dorso = document.createElement("div");
        dorso.className = "carta-dorso";
        dorso.setAttribute("aria-hidden", "true");
        dorso.innerHTML = '<span class="carta-dorso-signo">?</span><span class="carta-dorso-marca">GAME DEV</span>';
        marco.appendChild(dorso);
    }

    function mostrar(img, revelada) {
        const marco = img.closest(".holo-border");
        const nombre = marco.parentElement.querySelector(".name-pill");
        marco.classList.toggle("revelada", revelada);
        if (nombre) nombre.textContent = revelada ? img.alt : "???";
    }

    function voltear(marco) {
        const img = marco.querySelector(".tcg-card");
        marco.classList.add("volteando");
        marco.addEventListener("animationend", () => marco.classList.remove("volteando"), { once: true });
        setTimeout(() => mostrar(img, true), 400);
        const vistas = leerVistas();
        if (!vistas.includes(img.dataset.pokemon)) guardarVistas([...vistas, img.dataset.pokemon]);
    }

    const observador = "IntersectionObserver" in window
        ? new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                observador.unobserve(entrada.target);
                voltear(entrada.target);
            });
        }, { threshold: 0.6 })
        : null;

    function aplicar() {
        const lista = leer();
        const vistas = leerVistas();
        document.querySelectorAll(".tcg-card[data-pokemon]").forEach((img) => {
            const id = img.dataset.pokemon;
            const marco = img.closest(".holo-border");
            const desbloqueada = lista.includes(id);
            img.classList.toggle("unlocked", desbloqueada);
            prepararDorso(marco);
            if (!desbloqueada) {
                if (observador) observador.unobserve(marco);
                mostrar(img, false);
                return;
            }
            if (marco.classList.contains("revelada")) return;
            if (vistas.includes(id) || !observador) {
                mostrar(img, true);
                return;
            }
            observador.observe(marco);
        });
    }

    window.Cartas = {
        lista: CARTAS,
        existe: (id) => CARTAS.includes(id),
        desbloqueadas: leer,
        estaDesbloqueada: (id) => leer().includes(id),

        // Devuelve true si la carta era nueva
        desbloquear(id) {
            const lista = leer();
            if (!id || lista.includes(id)) return false;
            guardar([...lista, id]);
            aplicar();
            return true;
        },

        reiniciar() {
            guardar([]);
            guardarVistas([]);
            aplicar();
        },
    };

    document.addEventListener("DOMContentLoaded", aplicar);
    window.addEventListener("storage", aplicar);
})();
