const PROYECTO = "pokemon-gamedev";
const EVENTOS = ["visita", "inicio_ar", "pokemon_detectado"];
const COLUMNAS = ["fecha", "evento", "dispositivo_id", "sesion_id", "so", "so_version", "navegador", "tipo", "modelo", "pagina", "pokemon", "user_agent"];

function doPost(e) {
  const datos = JSON.parse(e.postData.contents);
  if (datos.proyecto !== PROYECTO || !EVENTOS.includes(datos.evento)) {
    return ContentService.createTextOutput("ignorado");
  }

  const fila = COLUMNAS.slice(1).map((columna) => limpiar(datos[columna]));
  const candado = LockService.getScriptLock();
  candado.waitLock(10000);
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Eventos").appendRow([new Date(), ...fila]);
  } finally {
    candado.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

function limpiar(valor) {
  const texto = valor == null ? "" : String(valor).slice(0, 300);
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
}

function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const eventos = libro.getSheetByName("Eventos") || libro.insertSheet("Eventos");
  eventos.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight("bold");
  eventos.getRange("B:L").setNumberFormat("@");
  eventos.setFrozenRows(1);

  const resumen = libro.getSheetByName("Resumen") || libro.insertSheet("Resumen");
  resumen.clear();
  resumen.getRange("A1:E1").setValues([["Dispositivos únicos", "Android", "iOS", "Otros", "Total"]]).setFontWeight("bold");
  [
    ["Visitaron la web", "visita"],
    ["Abrieron la cámara AR", "inicio_ar"],
    ["Detectaron un Pokémon", "pokemon_detectado"],
  ].forEach(([titulo, evento], indice) => {
    resumen.getRange(indice + 2, 1).setValue(titulo);
    resumen.getRange(indice + 2, 2, 1, 4).setFormulas([[
      contar(evento, 'Eventos!E2:E="Android"'),
      contar(evento, 'Eventos!E2:E="iOS"'),
      contar(evento, 'Eventos!E2:E<>"Android", Eventos!E2:E<>"iOS"'),
      contar(evento),
    ]]);
  });
  resumen.getRange("A6").setFormula(agrupar("G", "Navegador"));
  resumen.getRange("E6").setFormula(agrupar("F", "Versión"));
}

function contar(evento, condicion) {
  const filtros = ['Eventos!B2:B="' + evento + '"'].concat(condicion || []).join(", ");
  return "=IFERROR(COUNTUNIQUE(FILTER(Eventos!C2:C, " + filtros + ")), 0)";
}

function agrupar(columna, titulo) {
  const datos = "{Eventos!C2:C, Eventos!E2:E, Eventos!" + columna + "2:" + columna + "}";
  const consulta = "select Col2, Col3, count(Col1) group by Col2, Col3 order by count(Col1) desc " +
    "label Col2 'Sistema', Col3 '" + titulo + "', count(Col1) 'Dispositivos'";
  return '=IFERROR(QUERY(UNIQUE(FILTER(' + datos + ', Eventos!C2:C<>"")), "' + consulta + '", 0), "")';
}
