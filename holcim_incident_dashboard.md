<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Holcim: dashboard de incidentes</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <style>
    :root {
      --bg: #f3f5f6;
      --card: #fff;
      --tx: #17262f;
      --mut: #5f7380;
      --line: #dde4e8;
      --p: #1d4370;
      --a: #04bbf1;
      --bad: #e6007e;
      --good: #94c12e;
      box-sizing: border-box;
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --bg: #0f171d;
        --card: #17222b;
        --tx: #e5edf1;
        --mut: #90a3af;
        --line: #293842;
        --p: #04bbf1;
        --a: #94c12e;
        --bad: #ff4fb8;
      }
    }
    :root[data-theme="dark"] {
      --bg: #0f171d;
      --card: #17222b;
      --tx: #e5edf1;
      --mut: #90a3af;
      --line: #293842;
      --p: #04bbf1;
      --a: #94c12e;
      --bad: #ff4fb8;
    }
    
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--tx);
      font: 14px/1.45 "Montserrat", "Segoe UI", Roboto, Arial, sans-serif;
    }
    .foot { height: 12px; background: linear-gradient(90deg, #94c12e, #04bbf1, #1d4370); }
    h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; color: var(--p); }
    h1::after {
      content: "";
      display: block;
      height: 4px;
      margin-top: 8px;
      border-radius: 2px;
      background: linear-gradient(90deg, #94c12e, #04bbf1, #1d4370);
    }
    
    header { padding: 18px 20px 0; max-width: 1200px; margin: auto; }
    .sub { color: var(--mut); font-size: 13px; margin-top: 2px; }
    
    .bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin: 14px 0 0; }
    .bar label, .bar .lb { display: flex; flex-direction: column; font-size: 12px; color: var(--mut); gap: 3px; }
    select, button {
      font: inherit;
      font-size: 13px;
      padding: 6px 12px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--card);
      color: var(--tx);
    }
    button { cursor: pointer; transition: background 0.2s; }
    button:hover { background: var(--line); }
    button:focus-visible, select:focus-visible { outline: 2px solid var(--p); outline-offset: 1px; }
    
    .tabs { display: flex; gap: 4px; margin-top: 14px; border-bottom: 1px solid var(--line); overflow-x: auto; }
    .tabs button {
      border: 0;
      border-bottom: 3px solid transparent;
      border-radius: 0;
      background: none;
      padding: 9px 14px;
      color: var(--mut);
      font-size: 14px;
      white-space: nowrap;
    }
    .tabs button.on { color: var(--tx); border-color: var(--p); font-weight: 600; }
    
    main { max-width: 1200px; margin: auto; padding: 16px 20px 30px; }
    .view { display: none; }
    .view.on { display: block; }
    
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 14px; }
    .k {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      border-left: 4px solid var(--p);
    }
    .k b { display: block; font-size: 26px; font-weight: 650; letter-spacing: -.02em; }
    .k span { font-size: 12px; color: var(--mut); }
    .k.w { border-left-color: var(--p); }
    .k.r { border-left-color: var(--bad); }
    .k.g { border-left-color: var(--good); }
    
    .g { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 14px; }
    .c { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; }
    .c h2 { margin: 0 0 8px; font-size: 14px; font-weight: 600; }
    .ch { position: relative; height: 270px; }
    .wide { grid-column: 1 / -1; }
    
    .cards2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0 14px; }
    @media(max-width:760px) { .cards2 { grid-template-columns: 1fr; } }
    
    .ic { background: var(--card); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; min-height: 96px; }
    .ih { background: #041739; color: #fff; text-align: center; font-weight: 700; padding: 6px; }
    .icg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 12px 8px; text-align: center; }
    .icg span { display: block; font-size: 11px; color: var(--mut); }
    .icg b { font-size: 20px; }
    .icg .bad b { color: var(--bad); }
    .icg .big b { font-size: 22px; color: var(--a); }
    
    .tw { overflow-x: auto; max-width: 100%; margin-top: 10px; }
    table { border-collapse: collapse; width: 100%; font-size: 13px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); white-space: nowrap; }
    th { color: #fff; font-weight: 600; position: sticky; top: 0; background: #041739; }
    tr:hover { background: rgba(0, 0, 0, 0.02); }
    
    #loc th:nth-child(n+2), #loc td:nth-child(n+2) { text-align: center; }
    
    .chips { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
    .chips > span { font-size: 12px; color: var(--mut); width: 48px; flex: none; }
    .chips > div { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 12px;
      border: 1px solid var(--line);
      background: var(--card);
      cursor: pointer;
    }
    .chip.on { background: var(--p); color: #fff; border-color: var(--p); }
    
    @media print {
      .chips, .bar, .tabs, .noprint { display: none; }
      .view { display: block !important; break-inside: avoid; }
      body { background: #fff; }
    }
  </style>
</head>
<body>

  <header>
    <h1>Holcim: Dashboard de Incidentes</h1>
    <div class="sub">Sistema de Monitoreo de Seguridad Industrial y Salud Ocupacional</div>
    
    <div class="bar">
      <label>
        Región / País
        <select id="selRegion" onchange="applyFilters()">
          <option value="ALL">Todas las regiones</option>
          <option value="LATAM">Latinoamérica</option>
          <option value="NA">Norteamérica</option>
          <option value="EU">Europa</option>
        </select>
      </label>
      <label>
        Planta / Operación
        <select id="selPlanta" onchange="applyFilters()">
          <option value="ALL">Todas las plantas</option>
          <option value="Planta Central">Planta Central</option>
          <option value="Planta Norte">Planta Norte</option>
          <option value="Cantera Sur">Cantera Sur</option>
          <option value="Terminal Puerto">Terminal Puerto</option>
        </select>
      </label>
      <button onclick="toggleTheme()">🌓 Cambiar Tema</button>
      <button onclick="exportData()" class="noprint">📊 Exportar a Excel</button>
    </div>

    <div class="tabs">
      <button class="tab-btn on" onclick="switchTab(0)">General</button>
      <button class="tab-btn" onclick="switchTab(1)">Ubicaciones</button>
      <button class="tab-btn" onclick="switchTab(2)">Tendencias</button>
    </div>
  </header>

  <main>
    <!-- VISTA 1: GENERAL -->
    <div class="view on" id="view-0">
      <div class="kpis">
        <div class="k g">
          <b id="kpi-days">285</b>
          <span>Días sin Accidentes</span>
        </div>
        <div class="k w">
          <b id="kpi-total">142</b>
          <span>Total Incidentes (YTD)</span>
        </div>
        <div class="k r">
          <b id="kpi-high">4</b>
          <span>Severidad Alta (LTI)</span>
        </div>
        <div class="k w">
          <b id="kpi-med">38</b>
          <span>Severidad Media</span>
        </div>
        <div class="k g">
          <b id="kpi-low">100</b>
          <span>Severidad Baja / Near Miss</span>
        </div>
      </div>

      <div class="cards2">
        <div class="ic">
          <div class="ih">RESUMEN ANUAL DE SEGURIDAD</div>
          <div class="icg">
            <div class="big"><b id="card-ltifr">0.42</b><span>LTIFR</span></div>
            <div><b id="card-tri">12</b><span>TRI</span></div>
            <div class="bad"><b id="card-high">4</b><span>Graves</span></div>
            <div><b id="card-closed">94%</b><span>Cerrados</span></div>
          </div>
        </div>
        <div class="ic">
          <div class="ih">INSPECCIONES Y PREVENCIÓN</div>
          <div class="icg">
            <div class="big"><b id="card-obs">1,240</b><span>Observaciones</span></div>
            <div><b id="card-audit">88</b><span>Auditorías</span></div>
            <div><b id="card-train">96%</b><span>Capacitación</span></div>
            <div><b id="card-actions">15</b><span>Acciones Pdt.</span></div>
          </div>
        </div>
      </div>

      <div class="g">
        <div class="c">
          <h2>Incidentes por Severidad</h2>
          <div class="ch"><canvas id="chartSeverity"></canvas></div>
        </div>
        <div class="c">
          <h2>Incidentes por Tipo / Causa</h2>
          <div class="ch"><canvas id="chartType"></canvas></div>
        </div>
      </div>
    </div>

    <!-- VISTA 2: UBICACIONES -->
    <div class="view" id="view-1">
      <div class="c wide">
        <h2>Detalle de Incidentes por Planta y Ubicación</h2>
        <div class="tw">
          <table id="loc">
            <thead>
              <tr>
                <th>Planta / Ubicación</th>
                <th>Región</th>
                <th>Total Incidentes</th>
                <th>Alta (LTI)</th>
                <th>Media</th>
                <th>Baja / Near Miss</th>
                <th>Días sin Accidentes</th>
                <th>Estado Compliance</th>
              </tr>
            </thead>
            <tbody id="locTableBody">
              <!-- Cargado dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VISTA 3: TENDENCIAS -->
    <div class="view" id="view-2">
      <div class="c wide">
        <h2>Evolución Mensual de Incidentes (Comparativo)</h2>
        <div class="ch" style="height: 380px;"><canvas id="chartTrend"></canvas></div>
      </div>
    </div>
  </main>

  <footer class="foot"></footer>

  <script>
    // Datos de Muestra
    const locationData = [
      { name: "Planta Central", region: "LATAM", total: 45, high: 1, med: 12, low: 32, days: 310, status: "Excelente" },
      { name: "Planta Norte", region: "LATAM", total: 38, high: 2, med: 10, low: 26, days: 145, status: "Aceptable" },
      { name: "Cantera Sur", region: "NA", total: 29, high: 0, med: 8, low: 21, days: 420, status: "Excelente" },
      { name: "Terminal Puerto", region: "EU", total: 30, high: 1, med: 8, low: 21, days: 98, status: "Atención Requ." }
    ];

    let chartSeverityInstance = null;
    let chartTypeInstance = null;
    let chartTrendInstance = null;

    function initCharts() {
      // Chart Severidad (Doughnut)
      const ctxSev = document.getElementById('chartSeverity').getContext('2d');
      chartSeverityInstance = new Chart(ctxSev, {
        type: 'doughnut',
        data: {
          labels: ['Alta (LTI)', 'Media', 'Baja / Near Miss'],
          datasets: [{
            data: [4, 38, 100],
            backgroundColor: ['#e6007e', '#04bbf1', '#94c12e']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });

      // Chart Tipo de Incidente (Bar)
      const ctxType = document.getElementById('chartType').getContext('2d');
      chartTypeInstance = new Chart(ctxType, {
        type: 'bar',
        data: {
          labels: ['Caídas', 'EPI / EPP', 'Maquinaria', 'Cortes/Golpes', 'Ergonomía'],
          datasets: [{
            label: 'Número de Casos',
            data: [24, 45, 12, 38, 23],
            backgroundColor: '#1d4370'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });

      // Chart Tendencias (Line)
      const ctxTrend = document.getElementById('chartTrend').getContext('2d');
      chartTrendInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          datasets: [
            {
              label: 'Near Miss / Baja',
              data: [8, 12, 9, 11, 15, 10, 8, 14, 13, 10, 0, 0],
              borderColor: '#94c12e',
              tension: 0.3,
              fill: false
            },
            {
              label: 'Severidad Media / Alta',
              data: [4, 3, 5, 2, 6, 3, 2, 5, 4, 3, 0, 0],
              borderColor: '#e6007e',
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    function renderTable() {
      const tbody = document.getElementById('locTableBody');
      const regionFilter = document.getElementById('selRegion').value;
      const plantaFilter = document.getElementById('selPlanta').value;

      tbody.innerHTML = '';

      locationData.forEach(item => {
        if (regionFilter !== 'ALL' && item.region !== regionFilter) return;
        if (plantaFilter !== 'ALL' && item.name !== plantaFilter) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${item.name}</strong></td>
          <td>${item.region}</td>
          <td>${item.total}</td>
          <td style="color: var(--bad); font-weight: bold;">${item.high}</td>
          <td>${item.med}</td>
          <td>${item.low}</td>
          <td>${item.days}</td>
          <td><span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; background: rgba(148,193,46,0.2); color: var(--tx);">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    function switchTab(index) {
      document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('on', i === index);
      });
      document.querySelectorAll('.view').forEach((view, i) => {
        view.classList.toggle('on', i === index);
      });
    }

    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }

    function applyFilters() {
      renderTable();
      // Opcional: Modificar dinámicamente los KPIs según filtros
      const reg = document.getElementById('selRegion').value;
      if (reg === 'LATAM') {
        document.getElementById('kpi-total').innerText = '83';
        document.getElementById('kpi-high').innerText = '3';
      } else if (reg === 'NA') {
        document.getElementById('kpi-total').innerText = '29';
        document.getElementById('kpi-high').innerText = '0';
      } else {
        document.getElementById('kpi-total').innerText = '142';
        document.getElementById('kpi-high').innerText = '4';
      }
    }

    function exportData() {
      const ws = XLSX.utils.json_to_sheet(locationData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Incidentes_Ubicacion");
      XLSX.writeFile(wb, "Holcim_Incidentes_Report.xlsx");
    }

    document.addEventListener('DOMContentLoaded', () => {
      initCharts();
      renderTable();
    });
  </script>
</body>
</html>