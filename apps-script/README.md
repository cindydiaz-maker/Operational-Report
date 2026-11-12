# Conexión de Google Apps Script con ServiceNow

Esta carpeta contiene el proyecto de Apps Script que lee ServiceNow para el reporte **LA - Monthly Operations Report**. El reporte visual completo está en `index.html`, en la raíz del repositorio. Esta carpeta es la parte que trae los datos.

## Qué hay aquí

| Archivo | Para qué sirve |
|---|---|
| `Code.gs` | Corre en el servidor de Google. Consulta ServiceNow y devuelve totales. |
| `Index.html` | Página que se entrega al navegador. Hoy muestra el total de Incidents, Request y Changes. |

En Apps Script el HTML vive dentro del proyecto. Cuando alguien abre la dirección de la aplicación web, Apps Script lee `Index.html` y le envía una copia al navegador. El navegador nunca ve `Code.gs`.

## Cómo viajan los datos

1. La persona abre la dirección `/exec` de la aplicación web.
2. Apps Script entrega `Index.html` al navegador.
3. La página llama a `getReport()`. Esa llamada va a `Code.gs`.
4. `Code.gs` lee las credenciales de las propiedades del script y consulta la API de ServiceNow.
5. ServiceNow devuelve conteos.
6. El navegador recibe solo totales y los pinta.

La clave y el detalle de cada registro no salen del servidor.

## Propiedades de script

Se configuran en Apps Script, **Configuración del proyecto → Propiedades de script**. El nombre va en **Property** y el dato en **Value**. Los nombres deben ser exactamente estos.

| Property | Value |
|---|---|
| `SN_INSTANCE` | Host de ServiceNow sin `https://` y sin barra final. |
| `SN_USER` | Usuario de integración con permiso de solo lectura. |
| `SN_PASSWORD` | Clave de ese usuario. |
| `SN_QUERY_INCIDENTS` | Query codificado de la tabla `incident`. |
| `SN_QUERY_REQUEST` | Query codificado de la tabla `sc_request`. |
| `SN_QUERY_CHANGES` | Query codificado de la tabla `change_request`. |

Los queries se guardan como propiedades, no en el código, porque el repositorio es público y los queries llevan identificadores internos de ServiceNow. Un módulo sin query aparece como "Sin query" y no rompe a los demás.

## Cómo sacar un query desde un reporte de ServiceNow

1. Abre el reporte con esta dirección, cambiando el identificador por el del reporte: `https://TU-INSTANCIA/sys_report.do?XML&sys_id=ID_DEL_REPORTE`.
2. Con `Ctrl+F` busca `filter`.
3. Copia la primera línea después de `<filter table="...">`. Es la que usa `^` entre condiciones.
4. Pégala como Value de la propiedad que corresponda.

Los demás renglones, los `<item ...>`, son las mismas condiciones una por una y no se copian.

## Puesta en marcha

1. Crea un proyecto en [script.google.com](https://script.google.com).
2. Pega `Code.gs` en el archivo `Code.gs` del proyecto.
3. Crea un archivo HTML llamado `Index` y pega `Index.html`.
4. Guarda las propiedades de script de la tabla anterior.
5. Ejecuta las pruebas desde el editor.
6. Publica: **Implementar → Nueva implementación → Aplicación web**. Ejecutar como **Yo**. Empieza con acceso **Solo yo**.

## Pruebas

Se ejecutan desde el editor, eligiendo la función en la barra y pulsando **Run**. La primera vez Google pide permiso para conectarse a un servicio externo.

| Función | Qué comprueba | Resultado esperado en el registro |
|---|---|---|
| `probarConexion` | Instancia, usuario y clave. | `ServiceNow respondió 200` y un número de incidente. |
| `probarQueries` | Cada query guardado. | `"ok": true` y un `count` por módulo. |

Si falla:

| Código | Causa probable |
|---|---|
| `Falta la propiedad de script ...` | El nombre de la propiedad está mal escrito o no se guardó. |
| `401` | Usuario o clave incorrectos. |
| `403` | El usuario entró, pero no tiene permiso sobre esa tabla. |
| `404` | La instancia o el nombre de la tabla no existen. |

## Cambios de código y nuevas versiones

Una aplicación web publicada sigue sirviendo la versión anterior hasta que se actualice la implementación. Después de cada cambio: **Implementar → Administrar implementaciones**, edita la misma implementación y elige **Nueva versión**. La dirección no cambia.

## Seguridad

- Nunca pegues usuario ni clave en el código, en el repositorio ni en el chat. Solo van en las propiedades de script.
- Usa un usuario de integración con permiso de solo lectura.
- Si una clave se mostró en una captura o en un chat, cámbiala en ServiceNow y actualiza `SN_PASSWORD`.
- No subas exportaciones de ServiceNow ni nombres de personas al repositorio.
- Hacia el navegador solo viajan totales. No envíes números de incidente, descripciones ni nombres de personas.

## Estado del proyecto

- Probado contra ServiceNow: la conexión con usuario de integración, y el conteo de `change_request` con el query de Changes LA.
- Pendiente: los queries de Incidents y Request, y que `Index.html` pinte las cinco vistas del reporte con los datos reales en lugar de las cifras fijas de `index.html`.
- `probarQueries` y la lectura de queries desde propiedades se escribieron después de la prueba de conexión y todavía no se han ejecutado contra ServiceNow.
