# Instrucciones para agentes (Cursor, Claude Code y otros)

## Qué es
`index.html` es una aplicación de un solo archivo (HTML, CSS y JavaScript). Los datos de incidentes van incrustados en el mismo archivo. Las gráficas usan Chart.js desde CDN y la letra es Montserrat (Google Fonts). Lee el archivo antes de editarlo: es grande y tiene su propio JavaScript para filtros, gráficas y exportación a PowerPoint.

## Estructura
- Barra superior: **Incidents**, **Request**, **Changes**.
- Dentro de Incidents: General Data, Data por país, Data por team, Performance YTD, Tendencias.
- Request y Changes están vacías ("Sin datos cargados"). No inventes datos: espera el export de ServiceNow.

## Convenciones acordadas con el dueño del proyecto (verifícalas en el código antes de cambiar nada)
- Idioma de la interfaz: español, con términos de ITSM en inglés. Usar "incidentes", no "tickets".
- Colores de marca Holcim: Premium Blue #041739, Medium Blue #1d4370, Bright Blue #04bbf1, Medium Green #4bb05b, Bright Green #94c12e. Excepciones pedidas: fucsia #e6007e para incumplimientos de SLA y semáforo de cumplimiento (rojo #d8452b menos de 80%, amarillo #d99a00 de 80% a menos de 95%, azul claro 95% o más).
- Letra: Montserrat. Nombre del reporte: "LA - Monthly Operations Report".
- Filtros: listas desplegables con casillas (varias opciones a la vez), buscador, conteo y botón "SOLO".
- SLA: incumplido = columna "Out of sla" en verdadero. En la vista por país, SLA = 1 − (cerrados fuera de SLA ÷ cerrados).
- Empresas fuera de Latinoamérica se agrupan como "Global" (Canadá ECAN, Corporate France, EMEA Digital Center, Filipinas, South Asia, Technology and Services).

## Trampas conocidas de los datos de ServiceNow
- Algunas fechas vienen como `yyyy-dd-mm` (día y mes invertidos) mezcladas con `dd-mm-yyyy`. Verifica que cierre ≥ creación al interpretarlas.
- "Business duration" viene en segundos.

## Reglas
- Privacidad: no subir exports de ServiceNow ni nombres de personas al repositorio (la carpeta `data/` está ignorada).
- No hacer cambios sin probar: abrir `index.html` en un navegador y recorrer todas las pestañas.
