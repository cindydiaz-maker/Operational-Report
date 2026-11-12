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
 *   SN_QUERY_REQUEST    query codificado de request (opcional hasta tenerlo)
 *   SN_QUERY_CHANGES    query codificado de change_request
 */

var MODULOS = {
  incidents: { tabla: "incident", propiedad: "SN_QUERY_INCIDENTS" },
  request: { tabla: "sc_request", propiedad: "SN_QUERY_REQUEST" },
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

function contar_(tabla, query) {
  var ruta = "/api/now/stats/" + tabla +
    "?sysparm_count=true&sysparm_query=" + encodeURIComponent(query);
  var respuesta = pedir_(ruta);
  var codigo = respuesta.getResponseCode();
  if (codigo !== 200) {
    return { ok: false, codigo: codigo, detalle: respuesta.getContentText().slice(0, 300) };
  }
  var cuerpo = JSON.parse(respuesta.getContentText());
  return { ok: true, count: Number(cuerpo.result.stats.count) };
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
