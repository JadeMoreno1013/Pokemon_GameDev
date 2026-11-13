/* Fecha del temporizador (ej. "2026-12-31T00:00:00"). Con null muestra "Próximamente". */
const FECHA_OBJETIVO = "2026-11-16T11:00:00-05:00";

document.addEventListener("DOMContentLoaded", () => {
    iniciarCarrusel();
    iniciarTemporizador();
});

function iniciarCarrusel() {
    if (!document.querySelector(".pokemonSwiper")) return;

    new Swiper(".pokemonSwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: 1,
        // Con solo 3 cartas el loop falla al arrastrar; rewind vuelve al inicio
        rewind: true,
        observer: true,
        observeParents: true,
        coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
}

function iniciarTemporizador() {
    const timer = document.getElementById("countdown-timer");
    if (!timer || !FECHA_OBJETIVO) return;

    const objetivo = new Date(FECHA_OBJETIVO).getTime();
    const dosDigitos = (n) => String(n).padStart(2, "0");

    function actualizar() {
        const distancia = objetivo - Date.now();

        if (distancia <= 0) {
            clearInterval(intervalo);
            timer.textContent = "¡ACTUALIZADO!";
            timer.style.fontSize = "1.5rem";
            return;
        }

        const dias = Math.floor(distancia / 86400000);
        const horas = Math.floor((distancia % 86400000) / 3600000);
        const minutos = Math.floor((distancia % 3600000) / 60000);
        const segundos = Math.floor((distancia % 60000) / 1000);

        const hora = `${dosDigitos(horas)}:${dosDigitos(minutos)}:${dosDigitos(segundos)}`;
        timer.textContent = dias > 0 ? `${dias}d ${hora}` : hora;
    }

    const intervalo = setInterval(actualizar, 1000);
    actualizar();
}
