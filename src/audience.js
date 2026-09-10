import Plotly from "plotly.js-dist-min";
import {
  surveyMeta,
  tenureAge,
  emotionalInvestment,
  motivators,
  emotionalAnchors,
  newsEngagement,
  socialImportance,
  onlineDiscussion,
  contentFormats,
  liveRace,
  liveEvents,
  culture
} from "./audience-data.js";

const app = document.querySelector("#audience-app");
const percent = (value) => `${value}%`;
const pageRef = (pages) => `PDF · ${Array.isArray(pages) ? `pp. ${pages.join("–")}` : `p. ${pages}`}`;
const chartConfig = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"] };
const plotFont = { family: "Arial, Helvetica, sans-serif", color: "#565650", size: 11 };
const stackColors = ["#e10600", "#f06b66", "#9b9b95", "#242420"];

function sourceTag(pages) {
  return `<span class="source-tag">${pageRef(pages)}</span>`;
}

function stackBar(series, index) {
  return `<div class="mini-stack" aria-label="Distribución porcentual">${series.map((item, seriesIndex) => `<span style="width:${item.values[index]}%;--stack:${stackColors[seriesIndex]}" title="${item.label}: ${item.values[index]}%"></span>`).join("")}</div>`;
}

function combinedShare(series, index) {
  return series[0].values[index] + series[1].values[index];
}

app.innerHTML = `
  <nav class="topbar" aria-label="Navegación principal">
    <a class="wordmark" href="./index.html">F1 HISTÓRICA</a>
    <div><a href="#composicion">Audiencia</a><a href="./index.html">Historia y rendimiento ↗</a></div>
  </nav>

  <header class="audience-hero">
    <div>
      <p class="eyebrow">ENCUESTA GLOBAL · 2025</p>
      <h1>La audiencia<br>de Fórmula 1</h1>
      <p class="hero-copy">Una lectura interactiva de quiénes son los fans más involucrados, qué los conecta con el deporte y cómo esa relación se extiende del vivo a las plataformas y la cultura.</p>
    </div>
    <aside class="hero-note">
      <span>BASE DE LECTURA</span>
      <strong>${surveyMeta.respondents}</strong>
      <p>respuestas opt-in de ${surveyMeta.countries} países.</p>
      <button type="button" id="open-methodology">Metodología y páginas usadas</button>
    </aside>
  </header>

  <div class="headline-grid" aria-label="Indicadores principales">
    <article><span>Contenido diario</span><strong>61%</strong><p>Mantiene contacto con noticias y contenido fuera del fin de semana.</p>${sourceTag([32, 33])}</article>
    <article><span>Ritual en vivo</span><strong>86%</strong><p>Ve 16 carreras o más durante la temporada.</p>${sourceTag(34)}</article>
    <article><span>Inversión emocional</span><strong>90%</strong><p>Está muy o algo involucrado en el resultado de las carreras.</p>${sourceTag(22)}</article>
    <article><span>Experiencia presencial</span><strong>48%</strong><p>Declara haber asistido alguna vez a un Gran Premio.</p>${sourceTag(51)}</article>
  </div>

  <nav class="section-nav" aria-label="Secciones del dashboard">
    <a href="#composicion">01 Composición</a>
    <a href="#emocion">02 Vínculo</a>
    <a href="#contenido">03 Contenido</a>
    <a href="#eventos">04 En vivo</a>
    <a href="#cultura">05 Cultura</a>
  </nav>

  <section id="composicion" class="dashboard-section">
    <div class="section-heading"><div><p>01 · COMPOSICIÓN</p><h2>Una audiencia que incorpora generaciones</h2></div><p>Las cohortes nuevas concentran menores de 25; la base histórica conserva una distribución mucho más adulta.</p></div>
    <div class="metric-row">
      <article><span>Edad media global</span><strong>${tenureAge.averageAge.global}</strong><small>años</small></article>
      <article><span>Edad media · mujeres</span><strong>${tenureAge.averageAge.women}</strong><small>años</small></article>
      <article><span>Edad media · hombres</span><strong>${tenureAge.averageAge.men}</strong><small>años</small></article>
      <article><span>Participación Gen Z</span><strong>${tenureAge.genZShare}%</strong><small>del total encuestado</small></article>
    </div>
    <div class="two-column wide-left">
      <article class="chart-card">
        <div class="card-head"><div><h3>Edad dentro de cada cohorte de antigüedad</h3><p>Cada columna distribuye el 100% de su cohorte por edad.</p></div>${sourceTag(10)}</div>
        <div id="tenure-age-chart" class="chart large-chart" role="img" aria-label="Mapa de calor de edad por años siguiendo Fórmula 1"></div>
      </article>
      <aside class="contrast-card">
        <p class="contrast-label">DOS PUERTAS DE ENTRADA ${sourceTag(13)}</p>
        <article><span>EMERGENTES</span><h3>Más jóvenes y más diversos</h3><p>Mayor presencia de mujeres, menores de 35 y mercados como EE. UU., India y Sudeste Asiático.</p></article>
        <article><span>HISTÓRICOS</span><h3>Tradición y concentración europea</h3><p>Tienden a ser mayores, hombres y con más peso relativo de Europa.</p></article>
        <div class="accent-callout"><strong>${tenureAge.womenFiveYearsOrLess}%</strong><p>de las mujeres encuestadas sigue F1 hace cinco años o menos.</p></div>
      </aside>
    </div>
  </section>

  <section id="emocion" class="dashboard-section dark-section">
    <div class="section-heading"><div><p>02 · VÍNCULO EMOCIONAL</p><h2>La velocidad une; las personas diferencian</h2></div><p>La emoción de la carrera lidera en todos los grupos, pero pilotos, equipos, estrategia y legado ordenan vínculos distintos.</p></div>
    <div class="two-column even">
      <article class="chart-card dark-card">
        <div class="card-head"><div><h3>Inversión emocional por antigüedad</h3><p>Distribución de respuestas dentro de cada cohorte.</p></div>${sourceTag(22)}</div>
        <div id="emotion-chart" class="chart" role="img" aria-label="Inversión emocional según años como fan"></div>
        <p class="chart-caveat">* ${emotionalInvestment.caveat}</p>
      </article>
      <article class="lens-card dark-card">
        <div class="card-head"><div><h3>Lente por antigüedad</h3><p>Compará la intensidad emocional con el peso de estilo y lifestyle.</p></div>${sourceTag([22, 66])}</div>
        <label class="select-label">Cohorte<select id="tenure-select">${culture.groups.slice(0, 5).map((group, index) => `<option value="${index}">${group}</option>`).join("")}</select></label>
        <div id="tenure-lens" class="lens-grid" aria-live="polite"></div>
      </article>
    </div>
    <div class="anchor-grid">
      <article class="anchor-hero"><span>Inspiración fuera de pista</span><strong>48%</strong><p>del total encuentra inspiración en un piloto o equipo; sube a 66% entre Gen Z.</p>${sourceTag(26)}</article>
      <article class="chart-card dark-card"><div class="card-head"><div><h3>Quiénes encuentran inspiración fuera de pista</h3><p>Porcentajes publicados para cada segmento y mercado.</p></div>${sourceTag(26)}</div><div id="inspiration-chart" class="chart compact-chart"></div></article>
    </div>
    <div class="motivation-grid">
      ${motivators.rows.map((row) => `<article><div><strong>${row.cohort}</strong><span>${row.detail}</span></div><ol><li>${row.first}</li><li>${row.second}</li><li>${row.third}</li></ol></article>`).join("")}
    </div>
    <p class="section-source">Motivadores ordenados según la encuesta · ${pageRef(motivators.page)}. Entre Gen Z, 41% cita pilotos y 25% un equipo como motivos principales (${pageRef(24)}).</p>
  </section>

  <section id="contenido" class="dashboard-section">
    <div class="section-heading"><div><p>03 · CONSUMO DE CONTENIDO</p><h2>El fin de semana ya no contiene al fandom</h2></div><p>La carrera sigue siendo el ritual central, mientras redes, video, audio y comunidades sostienen una relación cotidiana.</p></div>
    <div class="two-column wide-left">
      <article class="chart-card">
        <div class="card-head"><div><h3>Tres formas de conexión digital por edad</h3><p>Frecuencia diaria, importancia de redes y participación en conversaciones.</p></div>${sourceTag([33, 35, 36, 37])}</div>
        <div id="digital-age-chart" class="chart large-chart"></div>
      </article>
      <article class="lens-card">
        <div class="card-head"><div><h3>Perfil digital por edad</h3><p>El selector actualiza tres distribuciones completas.</p></div>${sourceTag([33, 36, 37])}</div>
        <label class="select-label">Edad<select id="age-select">${socialImportance.groups.map((group, index) => `<option value="${index}">${group}</option>`).join("")}</select></label>
        <div id="age-lens" class="age-lens" aria-live="polite"></div>
      </article>
    </div>
    <div class="two-column even">
      <article class="chart-card"><div class="card-head"><div><h3>Las redes se volvieron centrales</h3><p>Porcentaje que las considera un canal importante.</p></div>${sourceTag(35)}</div><div id="social-trend-chart" class="chart compact-chart"></div></article>
      <article class="race-card">
        <div><span>EL VIVO RESISTE</span><strong>${liveRace.watch16Plus}%</strong><p>ve 16 carreras o más; ${liveRace.watch20Plus}% llega a 20 o más.</p></div>
        <div id="race-markets" class="market-bars"></div>
        ${sourceTag(34)}
      </article>
    </div>
    <article class="format-panel">
      <div class="card-head"><div><h3>Qué formato cumple qué función</h3><p>Seleccioná un formato para ver su audiencia y su propósito.</p></div>${sourceTag(39)}</div>
      <div class="format-tabs" role="tablist">${contentFormats.rows.map((row, index) => `<button type="button" role="tab" aria-selected="${index === 0}" class="${index === 0 ? "active" : ""}" data-format-index="${index}">${row.format}</button>`).join("")}</div>
      <div id="format-detail" class="format-detail" aria-live="polite"></div>
    </article>
    <p class="section-source">El capítulo de contenido comienza en la p. 30; la interpretación “always-on” y su segmentación por plataforma provienen de la p. 31.</p>
  </section>

  <section id="eventos" class="dashboard-section event-section">
    <div class="section-heading"><div><p>04 · EXPERIENCIAS EN VIVO</p><h2>Del contenido a la presencia física</h2></div><p>Asistir y querer asistir son medidas distintas. El dashboard las mantiene separadas para no confundir experiencia acumulada con intención.</p></div>
    <div class="event-toolbar" role="tablist" aria-label="Vista de experiencias">
      <button class="active" type="button" role="tab" aria-selected="true" data-event-view="attendance">Asistencia a carreras</button>
      <button type="button" role="tab" aria-selected="false" data-event-view="intent">Intención futura</button>
      <button type="button" role="tab" aria-selected="false" data-event-view="experiences">Eventos fuera de pista</button>
    </div>
    <article class="chart-card event-card"><div class="card-head"><div><h3 id="event-chart-title"></h3><p id="event-chart-copy"></p></div>${sourceTag([51, 54])}</div><div id="event-chart" class="chart large-chart"></div><p id="event-caveat" class="chart-caveat"></p></article>
  </section>

  <section id="cultura" class="dashboard-section culture-section">
    <div class="section-heading"><div><p>05 · CULTURA E IDENTIDAD</p><h2>La técnica ancla; el estilo expande</h2></div><p>Performance e innovación siguen definiendo a F1, mientras moda, lujo y personalidad ganan peso en las cohortes nuevas.</p></div>
    <div class="identity-pair">
      <article><span>IDENTIDAD BASE</span><strong>${culture.performanceIdentity}%</strong><p>asocia F1 con alto rendimiento y precisión.</p></article>
      <article><span>IDENTIDAD BASE</span><strong>${culture.innovationIdentity}%</strong><p>la vincula con innovación y tecnología.</p></article>
      <aside><p>No es reemplazo sino superposición: la maestría técnica permanece y las nuevas capas culturales amplían el vínculo.</p>${sourceTag([63, 64])}</aside>
    </div>
    <article class="chart-card culture-chart-card"><div class="card-head"><div><h3>Cuánto pesan lifestyle y moda según antigüedad</h3><p>Suma de “muy” y “algo importante” dentro de cada cohorte.</p></div>${sourceTag([65, 66])}</div><div id="culture-chart" class="chart large-chart"></div></article>
    <div class="culture-notes">
      <article><strong>+51 pp</strong><p>de diferencia en importancia de moda entre fans con menos de un año (72%) y 10+ años (21%).</p></article>
      <article><strong>58–59%</strong><p>entre mujeres, Gen Z y fans nuevos considera importante la moda y el estilo.</p></article>
      <article><strong>80%</strong><p>de los mayores de 45 dice que la moda tiene poco o ningún efecto en su interés.</p></article>
    </div>
  </section>

  <footer class="audience-footer">
    <div><strong>${surveyMeta.title}</strong><p>${surveyMeta.authors} · páginas seleccionadas por el usuario: ${surveyMeta.selectedPages.join(", ")}.</p></div>
    <a href="./index.html">Volver a historia y rendimiento ↗</a>
  </footer>

  <dialog id="methodology-dialog" class="methodology-dialog" aria-labelledby="methodology-title">
    <button type="button" id="close-methodology" aria-label="Cerrar">×</button>
    <p class="eyebrow">ALCANCE Y LÍMITES</p>
    <h2 id="methodology-title">Cómo leer estos datos</h2>
    <p>${surveyMeta.fieldNote}</p>
    <dl><div><dt>Fuente</dt><dd>${surveyMeta.title}, ${surveyMeta.authors}</dd></div><div><dt>Cobertura declarada</dt><dd>${surveyMeta.respondents} participantes de ${surveyMeta.countries} países</dd></div><div><dt>Páginas utilizadas</dt><dd>${surveyMeta.selectedPages.join(", ")}</dd></div><div><dt>Comparabilidad</dt><dd>Las barras comparan porcentajes dentro de cada grupo. Los valores de intención futura no se suman con asistencia histórica y algunas bases cambian por pregunta.</dd></div></dl>
  </dialog>
`;

function baseLayout(overrides = {}) {
  return {
    autosize: true,
    margin: { l: 48, r: 18, t: 18, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: plotFont,
    hoverlabel: { bgcolor: "#111", bordercolor: "#111", font: { color: "#fff" } },
    ...overrides
  };
}

function drawComposition() {
  Plotly.newPlot("tenure-age-chart", [{
    type: "heatmap",
    x: tenureAge.tenures,
    y: tenureAge.ages,
    z: tenureAge.values,
    zmin: 0,
    zmax: 55,
    colorscale: [[0, "#f1f1ed"], [.45, "#f5aaa6"], [1, "#e10600"]],
    showscale: false,
    text: tenureAge.values.map((row) => row.map(percent)),
    texttemplate: "%{text}",
    textfont: { size: 11 },
    hovertemplate: "%{y}<br>%{x}: <b>%{z}%</b><extra></extra>"
  }], baseLayout({ margin: { l: 90, r: 10, t: 10, b: 52 }, xaxis: { fixedrange: true }, yaxis: { fixedrange: true, autorange: "reversed" } }), chartConfig);
}

function drawEmotion() {
  Plotly.newPlot("emotion-chart", emotionalInvestment.series.map((series, index) => ({
    type: "bar",
    orientation: "h",
    name: series.label,
    y: emotionalInvestment.groups,
    x: series.values,
    marker: { color: stackColors[index] },
    hovertemplate: `${series.label}: <b>%{x}%</b><extra></extra>`
  })), baseLayout({
    barmode: "stack",
    margin: { l: 92, r: 15, t: 10, b: 46 },
    font: { ...plotFont, color: "#bdbdb5" },
    xaxis: { range: [0, 100], ticksuffix: "%", fixedrange: true, gridcolor: "#34342f" },
    yaxis: { fixedrange: true, autorange: "reversed" },
    legend: { orientation: "h", y: -0.22, font: { color: "#bdbdb5" } }
  }), chartConfig);

  Plotly.newPlot("inspiration-chart", [{
    type: "bar",
    orientation: "h",
    y: emotionalAnchors.offTrackInspiration.map((item) => item.group).reverse(),
    x: emotionalAnchors.offTrackInspiration.map((item) => item.value).reverse(),
    text: emotionalAnchors.offTrackInspiration.map((item) => `${item.value}%`).reverse(),
    textposition: "outside",
    cliponaxis: false,
    marker: { color: emotionalAnchors.offTrackInspiration.map((item) => item.group === "Global" ? "#f06b66" : "#e10600").reverse() },
    hovertemplate: "%{y}: <b>%{x}%</b><extra></extra>"
  }], baseLayout({
    margin: { l: 78, r: 38, t: 8, b: 34 },
    font: { ...plotFont, color: "#bdbdb5" },
    xaxis: { range: [0, 82], ticksuffix: "%", fixedrange: true, gridcolor: "#34342f" },
    yaxis: { fixedrange: true }
  }), chartConfig);
}

function updateTenureLens() {
  const index = Number(document.querySelector("#tenure-select").value);
  const emotional = emotionalInvestment.series[0].values[index];
  const lifestyle = combinedShare(culture.lifestyle, index);
  const fashion = combinedShare(culture.fashion, index);
  document.querySelector("#tenure-lens").innerHTML = [
    ["Muy involucrados", emotional, emotionalInvestment.series],
    ["Lifestyle importante", lifestyle, culture.lifestyle],
    ["Moda importante", fashion, culture.fashion]
  ].map(([label, value, series]) => `<article><span>${label}</span><strong>${value}%</strong>${stackBar(series, index)}</article>`).join("");
}

function drawDigital() {
  const ages = socialImportance.groups;
  const daily = newsEngagement.series[0].values.slice(0, 7);
  const social = ages.map((_, index) => combinedShare(socialImportance.series, index));
  const discussion = ages.map((_, index) => combinedShare(onlineDiscussion.series, index));
  const series = [
    { name: "Contenido diario", y: daily, color: "#111" },
    { name: "Redes importantes", y: social, color: "#e10600" },
    { name: "Conversación activa", y: discussion, color: "#777" }
  ];
  Plotly.newPlot("digital-age-chart", series.map((item) => ({
    type: "scatter",
    mode: "lines+markers",
    name: item.name,
    x: ages,
    y: item.y,
    line: { color: item.color, width: 3 },
    marker: { color: item.color, size: 8 },
    hovertemplate: `${item.name}<br>%{x}: <b>%{y}%</b><extra></extra>`
  })), baseLayout({
    margin: { l: 44, r: 16, t: 12, b: 54 },
    yaxis: { range: [0, 100], ticksuffix: "%", fixedrange: true, gridcolor: "#ddddda" },
    xaxis: { fixedrange: true },
    legend: { orientation: "h", y: -0.22 }
  }), chartConfig);

  Plotly.newPlot("social-trend-chart", [{
    type: "scatter",
    mode: "lines+markers+text",
    x: socialImportance.historic.map((item) => item.year),
    y: socialImportance.historic.map((item) => item.value),
    text: socialImportance.historic.map((item) => `${item.value}%`),
    textposition: "top center",
    line: { color: "#e10600", width: 4 },
    marker: { color: "#e10600", size: 10 },
    hovertemplate: "%{x}: <b>%{y}%</b><extra></extra>"
  }], baseLayout({
    margin: { l: 42, r: 16, t: 30, b: 40 },
    yaxis: { range: [0, 75], ticksuffix: "%", fixedrange: true, gridcolor: "#ddddda" },
    xaxis: { tickmode: "array", tickvals: socialImportance.historic.map((item) => item.year), fixedrange: true }
  }), chartConfig);
}

function updateAgeLens() {
  const index = Number(document.querySelector("#age-select").value);
  const rows = [
    { label: "Noticias y contenido", headline: `${newsEngagement.series[0].values[index]}% diario`, series: newsEngagement.series },
    { label: "Importancia de redes", headline: `${combinedShare(socialImportance.series, index)}% importante`, series: socialImportance.series },
    { label: "Discusión online", headline: `${combinedShare(onlineDiscussion.series, index)}% participa`, series: onlineDiscussion.series }
  ];
  document.querySelector("#age-lens").innerHTML = rows.map((row) => `<article><div><span>${row.label}</span><strong>${row.headline}</strong></div>${stackBar(row.series, index)}<div class="stack-legend">${row.series.map((item, seriesIndex) => `<span><i style="--stack:${stackColors[seriesIndex]}"></i>${item.label} ${item.values[index]}%</span>`).join("")}</div></article>`).join("");
}

function drawRaceMarkets() {
  document.querySelector("#race-markets").innerHTML = liveRace.market16Plus.map((item) => `<div><span>${item.market}</span><div><i style="width:${item.value}%"></i></div><strong>${item.value}%</strong></div>`).join("");
}

function updateFormat(index = 0) {
  const row = contentFormats.rows[index];
  document.querySelectorAll("[data-format-index]").forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelector("#format-detail").innerHTML = `<div><span>AUDIENCIA PRINCIPAL</span><strong>${row.audience}</strong></div><div><span>FUNCIÓN DENTRO DEL FANDOM</span><strong>${row.purpose}</strong></div>`;
}

function renderEventChart(view = "attendance") {
  const title = document.querySelector("#event-chart-title");
  const copy = document.querySelector("#event-chart-copy");
  const caveat = document.querySelector("#event-caveat");
  let rows;
  if (view === "attendance") {
    rows = liveEvents.raceAttendance;
    title.textContent = "Quiénes ya asistieron a un Gran Premio";
    copy.textContent = "Experiencia histórica declarada por mercado o segmento.";
    caveat.textContent = "Los grupos se superponen y no deben sumarse. ‘Gen Z EE. UU.’ es un subgrupo de EE. UU.";
  } else if (view === "intent") {
    rows = liveEvents.raceIntent;
    title.textContent = "Dónde aparece intención futura";
    copy.textContent = "La base exacta cambia según el indicador y se muestra al pasar el cursor.";
    caveat.textContent = "Intención no equivale a asistencia prevista: India y Japón se calculan entre quienes no asistieron; EE. UU. refiere a una carrera en ese país.";
  } else {
    rows = liveEvents.fanExperienceAttendance;
    title.textContent = "Eventos de F1 fuera de la carrera";
    copy.textContent = "Participación en fiestas, watch-alongs o encuentros relacionados con F1.";
    caveat.textContent = `Entre quienes aún no participaron, ${liveEvents.futureFanExperienceGlobal}% global planea hacerlo; India llega a ${liveEvents.futureFanExperienceIndia}% y EE. UU. a “${liveEvents.futureFanExperienceUS}”.`;
  }
  const ordered = [...rows].sort((a, b) => a.value - b.value);
  Plotly.react("event-chart", [{
    type: "bar",
    orientation: "h",
    y: ordered.map((item) => item.group),
    x: ordered.map((item) => item.value),
    customdata: ordered.map((item) => item.base ?? "porcentaje publicado"),
    text: ordered.map((item) => `${item.value}%`),
    textposition: "outside",
    cliponaxis: false,
    marker: { color: ordered.map((item) => item.group === "Global" ? "#111" : "#e10600") },
    hovertemplate: "%{y}: <b>%{x}%</b><br>%{customdata}<extra></extra>"
  }], baseLayout({
    margin: { l: 112, r: 42, t: 12, b: 40 },
    xaxis: { range: [0, 100], ticksuffix: "%", fixedrange: true, gridcolor: "#ddddda" },
    yaxis: { fixedrange: true }
  }), chartConfig);
}

function drawCulture() {
  const groups = culture.groups.slice(0, 5);
  const lifestyle = groups.map((_, index) => combinedShare(culture.lifestyle, index));
  const fashion = groups.map((_, index) => combinedShare(culture.fashion, index));
  Plotly.newPlot("culture-chart", [
    { name: "Lifestyle (glamour, lujo, celebridad)", values: lifestyle, color: "#111" },
    { name: "Moda y estilo", values: fashion, color: "#e10600" }
  ].map((item) => ({
    type: "scatter",
    mode: "lines+markers+text",
    name: item.name,
    x: groups,
    y: item.values,
    text: item.values.map(percent),
    textposition: "top center",
    line: { color: item.color, width: 4 },
    marker: { color: item.color, size: 10 },
    hovertemplate: `${item.name}<br>%{x}: <b>%{y}%</b><extra></extra>`
  })), baseLayout({
    margin: { l: 44, r: 20, t: 34, b: 58 },
    yaxis: { range: [0, 82], ticksuffix: "%", fixedrange: true, gridcolor: "#ddddda" },
    xaxis: { fixedrange: true },
    legend: { orientation: "h", y: -0.22 }
  }), chartConfig);
}

document.querySelector("#tenure-select").addEventListener("change", updateTenureLens);
document.querySelector("#age-select").addEventListener("change", updateAgeLens);
document.querySelectorAll("[data-format-index]").forEach((button) => button.addEventListener("click", () => updateFormat(Number(button.dataset.formatIndex))));
document.querySelectorAll("[data-event-view]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-event-view]").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });
  renderEventChart(button.dataset.eventView);
}));

const methodologyDialog = document.querySelector("#methodology-dialog");
document.querySelector("#open-methodology").addEventListener("click", () => methodologyDialog.showModal());
document.querySelector("#close-methodology").addEventListener("click", () => methodologyDialog.close());
methodologyDialog.addEventListener("click", (event) => { if (event.target === methodologyDialog) methodologyDialog.close(); });

drawComposition();
drawEmotion();
drawDigital();
drawRaceMarkets();
drawCulture();
updateTenureLens();
updateAgeLens();
updateFormat();
renderEventChart();
