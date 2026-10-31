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

    function aplicar() {
        const lista = leer();
        document.querySelectorAll(".tcg-card[data-pokemon]").forEach((img) => {
            img.classList.toggle("unlocked", lista.includes(img.dataset.pokemon));
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
            aplicar();
        },
    };

    document.addEventListener("DOMContentLoaded", aplicar);
    window.addEventListener("storage", aplicar);
})();
