import dataset from "../data/dataset-v7.6.js";

const colors = ["#e10600", "#111111", "#6b7280", "#c7a33c", "#2563eb"];

function lineChart(series) {
  const width = 1040;
  const height = 340;
  const margin = { top: 20, right: 24, bottom: 42, left: 42 };
  const years = [...new Set(series.flatMap((team) => team.values.map((value) => value.year)))].sort();
  const max = Math.max(...series.flatMap((team) => team.values.map((value) => value.titles)));
  const x = (year) => margin.left + ((year - years[0]) / (years.at(-1) - years[0])) * (width - margin.left - margin.right);
  const y = (value) => height - margin.bottom - (value / max) * (height - margin.top - margin.bottom);
  const yTicks = [0, 4, 8, 12, 16];
  const xTicks = [1958, 1970, 1980, 1990, 2000, 2010, 2020, 2024];

  return `
    <div class="chart-wrap">
      <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolución acumulada de campeonatos de constructores entre 1958 y 2024">
        ${yTicks.map((tick) => `<line x1="${margin.left}" y1="${y(tick)}" x2="${width - margin.right}" y2="${y(tick)}" class="grid"/><text x="${margin.left - 10}" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`).join("")}
        ${xTicks.map((tick) => `<text x="${x(tick)}" y="${height - 14}" text-anchor="middle">${tick}</text>`).join("")}
        ${series.map((team, index) => {
          const points = team.values.map((value) => `${x(value.year)},${y(value.titles)}`).join(" ");
          return `<polyline points="${points}" fill="none" stroke="${colors[index]}" stroke-width="3" vector-effect="non-scaling-stroke"/>`;
        }).join("")}
      </svg>
    </div>
    <div class="legend">${series.map((team, index) => `<span><i style="background:${colors[index]}"></i>${team.team}</span>`).join("")}</div>`;
}

function ranking(items, label) {
  return `<ol class="ranking">${items.map((item) => `
    <li>
      <span class="rank">${item.position}</span>
      <span class="name">${item.name}<small>${item.detail}</small></span>
      <strong>${item.points}<small>${label}</small></strong>
    </li>`).join("")}</ol>`;
}

document.querySelector("#app").innerHTML = `
  <header>
    <div>
      <p class="eyebrow">ANÁLISIS DE FÓRMULA 1 · DATASET ${dataset.version}</p>
      <h1>Telemetry One</h1>
      <p class="intro">Una lectura simple de la evolución histórica y el presente competitivo de la Fórmula 1.</p>
    </div>
    <p class="academic">Trabajo universitario<br><span>698 pilotos · 930 autos · 1950–2025</span></p>
  </header>

  <section aria-labelledby="history-title">
    <div class="section-title">
      <div><p class="number">01</p><h2 id="history-title">Historia de los constructores</h2></div>
      <p>Campeonatos acumulados por año</p>
    </div>
    ${lineChart(dataset.constructorHistory)}
    <p class="note">La línea muestra el crecimiento acumulado de títulos de los cinco constructores más exitosos.</p>
  </section>

  <div class="two-columns">
    <section aria-labelledby="drivers-title">
      <div class="section-title compact"><div><p class="number">02</p><h2 id="drivers-title">Clasificación de pilotos</h2></div><p>Ranking histórico ELO</p></div>
      ${ranking(dataset.driverStandings, "ELO")}
    </section>
    <section aria-labelledby="teams-title">
      <div class="section-title compact"><div><p class="number">03</p><h2 id="teams-title">Clasificación de autos</h2></div><p>Índice histórico de dominio</p></div>
      ${ranking(dataset.constructorStandings, "ÍNDICE")}
    </section>
  </div>

  <section aria-labelledby="fan-title">
    <div class="section-title">
      <div><p class="number">04</p><h2 id="fan-title">Fan Index</h2></div>
      <p>Participación ponderada de preferencias</p>
    </div>
    <div class="fan-list">${dataset.fanIndex.map((item) => `
      <div class="fan-row"><span>${item.position}</span><strong>${item.name}</strong><div class="bar"><i style="width:${item.visual}%"></i></div><b>${item.score}%</b></div>`).join("")}</div>
    <p class="note">Índice compuesto del repositorio original a partir de votos y conversaciones con respaldo. Es una medida comparativa, no una encuesta oficial.</p>
  </section>

  <footer><span>TELEMETRY ONE</span><p>Proyecto académico · Dataset ${dataset.version}</p></footer>
`;
