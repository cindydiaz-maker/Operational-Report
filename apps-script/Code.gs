/**
 * LA - Monthly Operations Report: servidor de Google Apps Script.
 *
 * Lee ServiceNow con la API REST y le entrega a Index.html solo totales.
 * Ninguna credencial ni query vive en este archivo: todo sale de las
 * propiedades del script (Configuración del proyecto > Propiedades de script).
 *
 * Propiedades necesarias:
 *   SN_INSTANCE         host sin https://, por ejemplo miempresa.service-now.com
 *   SN_USER             usuario de integración de solo lectura
 *   SN_PASSWORD         clave de ese usuario
 *   SN_QUERY_INCIDENTS  query codificado de incident (opcional hasta tenerlo)
 *   SN_QUERY_REQUEST    query codificado de sc_task (opcional hasta tenerlo).
 *                       El reporte LA de Request se arma sobre la tabla task.
 *   SN_QUERY_CHANGES    query codificado de change_request
 *
 * Cada conteo se limita desde FECHA_INICIO hasta el final del día anterior
 * (hora del usuario de integración en ServiceNow, que debe ser America/Bogota).
 */

var FECHA_INICIO = "2026-01-01";
var CAMPO_CORTE = "closed_at";

var MODULOS = {
  incidents: { tabla: "incident", propiedad: "SN_QUERY_INCIDENTS" },
  request: { tabla: "sc_task", propiedad: "SN_QUERY_REQUEST" },
  changes: { tabla: "change_request", propiedad: "SN_QUERY_CHANGES" }
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("LA - Monthly Operations Report");
}

/** Llamada desde Index.html con google.script.run.getReport(). */
function getReport() {
  var salida = {};
  Object.keys(MODULOS).forEach(function (nombre) {
    var modulo = MODULOS[nombre];
    var query = leerPropiedad_(modulo.propiedad, false);
    if (!query) {
      salida[nombre] = { ok: false, motivo: "Sin query" };
      return;
    }
    salida[nombre] = contar_(modulo.tabla, query);
  });
  return salida;
}

/**
 * Prueba 1: confirma instancia, usuario y clave. Pide un solo incidente.
 * Ejecutar desde el editor. Esperado en el registro: "ServiceNow respondió 200".
 */
function probarConexion() {
  var respuesta = pedir_("/api/now/table/incident?sysparm_limit=1&sysparm_fields=number");
  Logger.log("ServiceNow respondió " + respuesta.getResponseCode());
  Logger.log(respuesta.getContentText().slice(0, 300));
}

/**
 * Prueba 2: cuenta los registros de cada módulo que ya tiene query guardado.
 * Esperado: ok true y un count por módulo.
 */
function probarQueries() {
  Logger.log(JSON.stringify(getReport(), null, 2));
}

/**
 * Cuenta como la lista de ServiceNow. El API de stats no aplica ^NQ igual
 * que la lista, y por eso el total no coincidía con el export directo.
 * X-Total-Count es el mismo número que muestra la lista al bajarla.
 */
function contar_(tabla, query) {
  var limpio = query;
  if (query.indexOf("%5E") !== -1 || query.indexOf("%3D") !== -1) {
    try {
      limpio = decodeURIComponent(query.replace(/\+/g, " "));
    } catch (error) {
      limpio = query;
    }
  }
  limpio = hastaAyer_(limpio);
  var ruta = "/api/now/table/" + tabla +
    "?sysparm_limit=1&sysparm_fields=sys_id&sysparm_exclude_reference_link=true&sysparm_query=" +
    encodeURIComponent(limpio);
  var respuesta = pedir_(ruta);
  var codigo = respuesta.getResponseCode();
  if (codigo !== 200) {
    return { ok: false, codigo: codigo, detalle: respuesta.getContentText().slice(0, 300) };
  }
  var total = encabezado_(respuesta, "X-Total-Count");
  if (total === "") {
    return { ok: false, codigo: codigo, detalle: "ServiceNow no devolvió X-Total-Count." };
  }
  return { ok: true, count: Number(total) };
}

/**
 * ^NQ separa bloques unidos con OR, así que el límite se agrega a cada uno;
 * si solo va al final, los demás bloques quedan sin fecha.
 */
function hastaAyer_(query) {
  var filtro = "^" + CAMPO_CORTE + "BETWEENjavascript:gs.dateGenerate('" + FECHA_INICIO +
    "','00:00:00')@javascript:gs.endOfYesterday()";
  return query.split("^NQ").map(function (bloque) {
    var limpio = bloque.replace(/^\^+|\^+$/g, "");
    return limpio ? limpio + filtro : limpio;
  }).join("^NQ");
}

function encabezado_(respuesta, nombre) {
  var headers = respuesta.getAllHeaders();
  var buscado = nombre.toLowerCase();
  var claves = Object.keys(headers);
  for (var i = 0; i < claves.length; i++) {
    if (claves[i].toLowerCase() === buscado) {
      var valor = headers[claves[i]];
      return Array.isArray(valor) ? String(valor[0]) : String(valor);
    }
  }
  return "";
}

function pedir_(ruta) {
  var instancia = leerPropiedad_("SN_INSTANCE", true);
  var usuario = leerPropiedad_("SN_USER", true);
  var clave = leerPropiedad_("SN_PASSWORD", true);
  var auth = Utilities.base64Encode(usuario + ":" + clave);
  return UrlFetchApp.fetch("https://" + instancia + ruta, {
    headers: { Authorization: "Basic " + auth, Accept: "application/json" },
    muteHttpExceptions: true
  });
}

function leerPropiedad_(nombre, obligatoria) {
  var valor = PropertiesService.getScriptProperties().getProperty(nombre);
  if (!valor && obligatoria) {
    throw new Error("Falta la propiedad de script " + nombre + ".");
  }
  return valor;
}
