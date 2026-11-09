(function () {
    const URL_HOJA = "https://script.google.com/macros/s/AKfycbzbM9BeqVuUMOXX7eOnmKl6DvqQyTbBFsCWzXErh_gVmT-lFk_CobKgTk48lt53r65Q/exec";

    const PROYECTO = "pokemon-gamedev";
    const ua = navigator.userAgent;
    const memoria = {};
    const enviados = new Set();

    function crearId() {
        return window.crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function idGuardado(almacen, clave) {
        try {
            let id = window[almacen].getItem(clave);
            if (!id) {
                id = crearId();
                window[almacen].setItem(clave, id);
            }
            return id;
        } catch (error) {
            memoria[clave] = memoria[clave] || crearId();
            return memoria[clave];
        }
    }

    function yaEnviado(marca) {
        const clave = "pokemon-gamedev:registros";
        try {
            const lista = JSON.parse(sessionStorage.getItem(clave));
            const marcas = Array.isArray(lista) ? lista : [];
            if (marcas.includes(marca)) return true;
            sessionStorage.setItem(clave, JSON.stringify([...marcas, marca]));
            return false;
        } catch (error) {
            if (enviados.has(marca)) return true;
            enviados.add(marca);
            return false;
        }
    }

    function sistema() {
        const ipadComoMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
        if (/iPhone|iPad|iPod/.test(ua) || ipadComoMac) {
            const version = ua.match(/Version\/(\d+)\.(\d+)/) || ua.match(/OS (\d+)_(\d+)/);
            return {
                so: "iOS",
                so_version: version ? version[1] + "." + version[2] : "",
                tipo: /iPhone|iPod/.test(ua) ? "celular" : "tablet",
            };
        }

        const plataforma = navigator.userAgentData ? navigator.userAgentData.platform : "";
        if (/Android/.test(ua) || plataforma === "Android") {
            const version = ua.match(/Android (\d+)/);
            return {
                so: "Android",
                so_version: version ? version[1] : "",
                tipo: /Mobile/.test(ua) ? "celular" : "tablet",
            };
        }

        const escritorio = [["Windows", /Windows/], ["ChromeOS", /CrOS/], ["macOS", /Macintosh/], ["Linux", /Linux/]];
        const encontrado = escritorio.find(([, patron]) => patron.test(ua));
        return { so: encontrado ? encontrado[0] : "Otro", so_version: "", tipo: "computador" };
    }

    function navegador() {
        const lista = [
            ["Samsung Internet", /SamsungBrowser/],
            ["Edge", /Edg(A|iOS)?\//],
            ["Opera", /OPR\/|OPiOS|OPT\//],
            ["Instagram", /Instagram/],
            ["Facebook", /FBAN|FBAV/],
            ["Chrome", /CriOS/],
            ["Firefox", /FxiOS|Firefox\//],
            ["Chrome", /Chrome\//],
            ["Safari", /Safari\//],
        ];
        const encontrado = lista.find(([, patron]) => patron.test(ua));
        return encontrado ? encontrado[0] : "Otro";
    }

    function detalles() {
        const info = { ...sistema(), navegador: navegador(), modelo: "", user_agent: ua };
        const datosCliente = navigator.userAgentData;
        if (info.so !== "Android" || !datosCliente || !datosCliente.getHighEntropyValues) {
            return Promise.resolve(info);
        }
        return datosCliente
            .getHighEntropyValues(["platformVersion", "model"])
            .then((valores) => ({
                ...info,
                so_version: valores.platformVersion ? valores.platformVersion.split(".")[0] : info.so_version,
                modelo: valores.model || "",
            }))
            .catch(() => info);
    }

    const dispositivo = idGuardado("localStorage", "pokemon-gamedev:dispositivo");
    const sesion = idGuardado("sessionStorage", "pokemon-gamedev:sesion");
    const pagina = location.pathname.split("/").pop() || "index.html";
    const informacion = detalles();

    function registrar(evento, marca, pokemon) {
        if (yaEnviado(marca)) return;
        informacion.then((info) => {
            fetch(URL_HOJA, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({
                    ...info,
                    proyecto: PROYECTO,
                    evento,
                    pokemon: pokemon || "",
                    pagina,
                    dispositivo_id: dispositivo,
                    sesion_id: sesion,
                }),
            }).catch(() => {});
        });
    }

    registrar("visita", "visita");
    window.addEventListener("pokemon:ar-iniciado", () => registrar("inicio_ar", "inicio_ar"));
    window.addEventListener("pokemon:detectado", (evento) => {
        const { title } = evento.detail;
        registrar("pokemon_detectado", "pokemon:" + title, title);
    });
})();
