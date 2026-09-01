import Plotly from "plotly.js-dist-min";

const DATA_URL = "./data/v7_6.json";
const LIVE_SURVEY_URL = "https://docs.google.com/spreadsheets/d/1w6jGPveRXEOXN-UFxvS9dqaWgV2aKTvGqJUD8vVYe6I/gviz/tq?tqx=out:csv&gid=1937071380";
const app = document.querySelector("#app");

app.innerHTML = `<div class="loading"><strong>F1 HISTÓRICA</strong><p>Cargando 76 temporadas de datos…</p></div>`;

const number = new Intl.NumberFormat("es-AR");
const percentage = new Intl.NumberFormat("es-AR", { style: "percent", maximumFractionDigits: 1 });
const imageCache = new Map();

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[character]);

const searchKey = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .toLocaleLowerCase("es");

function colorFor(id) {
  let hash = 0;
  for (const character of id) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return `hsl(${Math.abs(hash * 137.508) % 360} 72% 45%)`;
}

function canonicalBrand(constructor) {
  const value = String(constructor).replaceAll("&amp;", "&").trim();
  const familyRules = [
    [/^Brabham(?:-|$)/i, "Brabham"],
    [/^Cooper(?:-|$)/i, "Cooper"],
    [/^(?:Team )?Lotus(?: F1)?(?:-|$)/i, "Lotus"],
    [/^McLaren(?:-|$)/i, "McLaren"],
    [/^March(?:-|$)/i, "March"],
    [/^Shadow(?:-|$)/i, "Shadow"],
    [/^LDS(?:-|$)/i, "LDS"],
    [/^Eagle(?:-|$)/i, "Eagle"],
    [/^Alpine F1 Team$/i, "Alpine"],
    [/^Haas F1 Team$/i, "Haas"]
  ];
  return familyRules.find(([pattern]) => pattern.test(value))?.[1] ?? value;
}

function buildBrands(cars) {
  const groups = new Map();
  for (const car of Object.values(cars)) {
    const name = canonicalBrand(car.constructor);
    const brand = groups.get(name) ?? {
      id: searchKey(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      score: 0,
      models: new Set(),
      events: new Map(),
      debut: car.debut,
      lastSeason: car.lastSeason
    };
    brand.score += Number(car.dominanceScore || 0);
    brand.debut = Math.min(brand.debut, car.debut);
    brand.lastSeason = Math.max(brand.lastSeason, car.lastSeason);
    if (car.model && car.model !== "Model unresolved") brand.models.add(car.model);

    for (const point of car.points ?? []) {
      const entries = Math.max(1, Number(point[7] || 1));
      const event = brand.events.get(point[0]) ?? {
        index: point[0], weightedStrength: 0, entries: 0, season: point[2], round: point[3],
        event: point[4], constructors: new Set(), models: new Set(), bestFinish: null
      };
      event.weightedStrength += Number(point[1] || 0) * entries;
      event.entries += entries;
      event.constructors.add(String(point[5] || car.constructor).replaceAll("&amp;", "&"));
      if (car.model && car.model !== "Model unresolved") event.models.add(car.model);
      if (Number.isFinite(Number(point[8]))) {
        event.bestFinish = event.bestFinish === null ? Number(point[8]) : Math.min(event.bestFinish, Number(point[8]));
      }
      brand.events.set(point[0], event);
    }
    groups.set(name, brand);
  }

  return [...groups.values()].map((brand) => ({
    ...brand,
    modelCount: brand.models.size,
    points: [...brand.events.values()].sort((a, b) => a.index - b.index).map((event) => ({
      ...event,
      strength: event.weightedStrength / event.entries,
      constructors: [...event.constructors],
      models: [...event.models]
    }))
  })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "es"));
}

function sectionHeading(numberLabel, id, title, copy) {
  return `<div class="section-title"><div><p class="number">${numberLabel}</p><h2 id="${id}">${title}</h2></div><p>${copy}</p></div>`;
}

function render(data) {
  const drivers = Object.values(data.drivers).filter((driver) => driver.points?.length)
    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999) || a.name.localeCompare(b.name, "es"));
  const driverMap = new Map(drivers.map((driver) => [driver.id, driver]));
  const leaderIds = (data.leaders ?? []).filter((id) => driverMap.has(id)).slice(0, 8);
  const brands = buildBrands(data.cars);

  app.innerHTML = `<header>
    <div><p class="eyebrow">FÓRMULA 1 · ${data.meta.firstSeason}–${data.meta.lastSeason}</p><h1>Historia y rendimiento</h1><p class="intro">Dos lecturas del mismo deporte: la evolución de los pilotos y la continuidad técnica de cada marca, carrera por carrera.</p></div>
    <p class="count"><strong>${number.format(drivers.length)}</strong> pilotos<br><strong>${number.format(brands.length)}</strong> marcas</p>
  </header>

  <section aria-labelledby="drivers-chart-title">
    ${sectionHeading("01 · PILOTOS", "drivers-chart-title", "Evolución de los pilotos", "ELO retrospectivo · acercá, desplazá y compará")}
    <div class="explorer" id="driver-explorer">
      <div class="explorer-toolbar">
        <div class="mode-group" role="group" aria-label="Vista del gráfico de pilotos">
          <button class="mode-button active" type="button" data-driver-mode="top">Top 8</button>
          <button class="mode-button" type="button" data-driver-mode="all">Todos</button>
          <button class="mode-button" type="button" data-driver-mode="compare">Comparar</button>
        </div>
        <div class="axis-group" role="group" aria-label="Etiquetas del eje horizontal">
          <span>Eje</span><button class="axis-button active" type="button" data-axis="number">Carrera #</button><button class="axis-button" type="button" data-axis="name">Grandes Premios</button>
        </div>
      </div>
      <div class="selection-summary"><strong id="driver-selection-label"></strong><div class="chips" id="driver-chips"></div></div>
      <div class="explorer-grid">
        <aside class="entity-panel">
          <label class="entity-search">Buscar piloto<input id="driver-search" type="search" placeholder="Nombre del piloto" autocomplete="off"></label>
          <div class="entity-list" id="driver-list" role="listbox" aria-label="Pilotos de Fórmula 1" aria-multiselectable="true"></div>
          <article class="spotlight" id="driver-spotlight" aria-live="polite"></article>
        </aside>
        <div class="plot-column"><div id="driver-chart" class="plot" role="img" aria-label="Gráfico interactivo del ELO histórico de pilotos"></div><p class="chart-help">Pasá por una línea para identificar al piloto y ver la carrera, el auto y el cambio de ELO. Usá la rueda para acercar y arrastrá para moverte.</p></div>
      </div>
    </div>
  </section>

  <section aria-labelledby="brands-chart-title">
    ${sectionHeading("02 · AUTOS", "brands-chart-title", "Historia técnica por marca", "Los modelos cambian; la línea de la marca continúa")}
    <div class="explorer" id="brand-explorer">
      <div class="explorer-toolbar">
        <div class="mode-group" role="group" aria-label="Vista del gráfico de marcas">
          <button class="mode-button active" type="button" data-brand-mode="top">Top 10</button>
          <button class="mode-button" type="button" data-brand-mode="all">Todas</button>
          <button class="mode-button" type="button" data-brand-mode="compare">Comparar</button>
        </div>
        <p class="toolbar-note">Si un mismo chasis corrió para distintas marcas, aparece duplicado en cada linaje y después continúa por separado.</p>
      </div>
      <div class="selection-summary"><strong id="brand-selection-label"></strong><div class="chips" id="brand-chips"></div></div>
      <div class="explorer-grid">
        <aside class="entity-panel compact-panel">
          <label class="entity-search">Buscar marca<input id="brand-search" type="search" placeholder="Ferrari, Lotus, McLaren…" autocomplete="off"></label>
          <div class="entity-list" id="brand-list" role="listbox" aria-label="Marcas de Fórmula 1" aria-multiselectable="true"></div>
          <article class="spotlight brand-spotlight" id="brand-spotlight" aria-live="polite"></article>
        </aside>
        <div class="plot-column"><div id="brand-chart" class="plot" role="img" aria-label="Gráfico interactivo del rendimiento histórico de las marcas"></div><p class="chart-help">Cada punto resume los modelos de esa marca en el Gran Premio. El promedio está ponderado por inscripciones; el detalle de modelos aparece al pasar el cursor.</p></div>
      </div>
    </div>
  </section>

  <section aria-labelledby="live-title">
    ${sectionHeading("03 · EN VIVO", "live-title", "¿Quién es el mejor piloto de la historia?", "Respuestas y cruces de la encuesta")}
    <div id="live-chart" class="live-chart"><p>Cargando respuestas…</p></div>
    <p class="live-note"><span></span> Datos en vivo desde Google Sheets · actualización automática cada minuto</p>
  </section>

  <section aria-labelledby="fan-title">
    ${sectionHeading("04", "fan-title", "Fan Index", "Preferencias históricas ponderadas")}
    <div class="fan-list">${[["Ayrton Senna",28.04],["Michael Schumacher",20.55],["Juan Manuel Fangio",15.39],["Jim Clark",9.15],["Lewis Hamilton",8.88],["Fernando Alonso",4.44],["Gilles Villeneuve",2.86],["Max Verstappen",2.09]].map((item,index) => `<div class="fan-row"><span>${index+1}</span><strong>${item[0]}</strong><div class="bar"><i style="width:${item[1]/28.04*100}%"></i></div><b>${item[1]}%</b></div>`).join("")}</div>
  </section>
  <footer><span>F1 HISTÓRICA</span><p>Comparación interactiva de pilotos, marcas y opinión</p></footer>`;

  initDriverExplorer(data, drivers, driverMap, leaderIds);
  initBrandExplorer(data, brands);
  updateLiveChart();
  window.setInterval(updateLiveChart, 60000);
}

function baseLayout(data, yTitle, percentageAxis = false) {
  return {
    paper_bgcolor: "#fff",
    plot_bgcolor: "#fff",
    font: { family: "Arial, Helvetica, sans-serif", color: "#666", size: 11 },
    margin: { l: 64, r: 22, t: 24, b: 68 },
    hovermode: "closest",
    hoverlabel: { bgcolor: "#111", bordercolor: "#111", font: { color: "#fff", size: 12 }, align: "left" },
    showlegend: false,
    dragmode: "pan",
    xaxis: { color: "#777", gridcolor: "#e8e8e4", zeroline: false, fixedrange: false, title: { text: "Número de carrera", standoff: 14 }, range: [1, data.meta.events] },
    yaxis: { color: "#777", gridcolor: "#e0e0dc", zeroline: false, fixedrange: false, title: { text: yTitle, standoff: 12 }, rangemode: "nonnegative", tickformat: percentageAxis ? ".0%" : undefined, range: percentageAxis ? [0, 1] : undefined }
  };
}

function plotConfig() {
  return { responsive: true, displaylogo: false, scrollZoom: true, modeBarButtonsToRemove: ["lasso2d", "select2d"] };
}

function xAxisSettings(data, mode) {
  if (mode === "name") {
    const step = Math.max(1, Math.ceil(data.events.length / 18));
    const ticks = data.events.filter((_, index) => index % step === 0);
    return { title: { text: "Grandes Premios", standoff: 16 }, tickmode: "array", tickvals: ticks.map((event) => event.index), ticktext: ticks.map((event) => event.short), tickangle: -34, automargin: true };
  }
  return { title: { text: "Número de carrera", standoff: 14 }, tickmode: "auto", nticks: 14, tickangle: 0, automargin: true };
}

function driverTrace(driver, overview) {
  const x = [], y = [], customdata = [];
  let previousSeason = null, previousRace = null;
  for (const point of driver.points) {
    if (previousSeason !== null && point[2] - previousSeason > 1) {
      x.push((previousRace + point[0]) / 2); y.push(null); customdata.push(null);
    }
    x.push(point[0]); y.push(point[1]);
    customdata.push([driver.id, driver.name, point[2], point[3], point[4], point[5], point[6], point[7], point[8], point[9], point[10], point[11], point[12], point[13], point[14]]);
    previousSeason = point[2]; previousRace = point[0];
  }
  return {
    type: "scattergl", mode: "lines", name: driver.name, x, y, customdata, connectgaps: false,
    line: { color: colorFor(driver.id), width: overview ? 0.8 : 2.5 }, opacity: overview ? 0.34 : 1,
    hovertemplate: "<b>%{customdata[1]}</b><br>%{customdata[2]} R%{customdata[3]} · %{customdata[4]}<br><b>ELO</b> %{y:.1f} · cambio %{customdata[8]:+.2f}<br>Índice #%{customdata[5]} de %{customdata[6]}<br>%{customdata[7]} · largada P%{customdata[12]} · llegada P%{customdata[13]}<br>Estado: %{customdata[14]}<extra></extra>"
  };
}

function initDriverExplorer(data, drivers, driverMap, leaderIds) {
  const chart = document.querySelector("#driver-chart");
  const list = document.querySelector("#driver-list");
  const search = document.querySelector("#driver-search");
  const chips = document.querySelector("#driver-chips");
  const label = document.querySelector("#driver-selection-label");
  const selected = new Set(leaderIds.slice(0, 3));
  let mode = "top", axisMode = "number";

  function chosenDrivers() {
    if (mode === "all") return drivers;
    if (mode === "top") return leaderIds.map((id) => driverMap.get(id)).filter(Boolean);
    return [...selected].map((id) => driverMap.get(id)).filter(Boolean);
  }

  function renderList() {
    const query = searchKey(search.value.trim());
    const matches = query ? drivers.filter((driver) => searchKey(driver.name).includes(query)) : drivers;
    list.innerHTML = matches.map((driver) => `<button class="entity-row${selected.has(driver.id) ? " selected" : ""}" type="button" role="option" aria-selected="${selected.has(driver.id)}" data-driver-id="${escapeHtml(driver.id)}" style="--entity-color:${colorFor(driver.id)}"><i></i><span><strong>${escapeHtml(driver.name)}</strong><small>${driver.debut}–${driver.lastSeason} · ${number.format(driver.races)} largadas</small></span><b>${selected.has(driver.id) ? "✓" : ""}</b></button>`).join("") || `<p class="empty-list">No hay coincidencias.</p>`;
  }

  function renderSelection() {
    const chosen = chosenDrivers();
    label.textContent = mode === "all" ? `Mostrando ${number.format(chosen.length)} pilotos` : mode === "top" ? "Top 8 del modelo" : chosen.length ? `Comparando ${chosen.length} piloto${chosen.length === 1 ? "" : "s"}` : "Elegí pilotos para comparar";
    chips.innerHTML = mode === "compare" ? chosen.map((driver) => `<button type="button" data-remove-driver="${escapeHtml(driver.id)}" style="--chip-color:${colorFor(driver.id)}">${escapeHtml(driver.name)} <span>×</span></button>`).join("") : "";
  }

  function renderChart() {
    const chosen = chosenDrivers();
    renderSelection();
    if (!chosen.length) {
      Plotly.purge(chart);
      chart.innerHTML = `<div class="plot-empty"><strong>Sin pilotos seleccionados</strong><p>Usá el buscador para preparar una comparación.</p></div>`;
      return;
    }
    const layout = baseLayout(data, "ELO retrospectivo");
    layout.xaxis = { ...layout.xaxis, ...xAxisSettings(data, axisMode) };
    if (mode !== "all") {
      const indexes = chosen.flatMap((driver) => driver.points.map((point) => point[0]));
      const start = Math.min(...indexes), end = Math.max(...indexes), padding = Math.max(8, Math.round((end - start) * 0.035));
      layout.xaxis.range = [Math.max(1, start - padding), Math.min(data.meta.events, end + padding)];
    }
    Plotly.react(chart, chosen.map((driver) => driverTrace(driver, mode === "all")), layout, plotConfig());
  }

  function setMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll("[data-driver-mode]").forEach((button) => button.classList.toggle("active", button.dataset.driverMode === mode));
    renderChart();
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-driver-id]");
    if (!button) return;
    const id = button.dataset.driverId;
    selected.has(id) ? selected.delete(id) : selected.add(id);
    renderList();
    setMode("compare");
    if (selected.has(id)) updateDriverSpotlight(driverMap.get(id));
  });
  chips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-driver]");
    if (!button) return;
    selected.delete(button.dataset.removeDriver); renderList(); renderChart();
  });
  search.addEventListener("input", renderList);
  document.querySelectorAll("[data-driver-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.driverMode)));
  document.querySelectorAll("[data-axis]").forEach((button) => button.addEventListener("click", () => {
    axisMode = button.dataset.axis;
    document.querySelectorAll("[data-axis]").forEach((item) => item.classList.toggle("active", item === button));
    renderChart();
  }));
  chart.on("plotly_hover", (event) => {
    const id = event.points?.[0]?.customdata?.[0];
    if (id && driverMap.has(id)) updateDriverSpotlight(driverMap.get(id));
  });
  chart.on("plotly_click", (event) => {
    const id = event.points?.[0]?.customdata?.[0];
    if (id && driverMap.has(id)) updateDriverSpotlight(driverMap.get(id));
  });
  renderList(); renderChart(); updateDriverSpotlight(driverMap.get(leaderIds[0]) ?? drivers[0]);
}

async function fetchDriverImage(driver) {
  if (imageCache.has(driver.id)) return imageCache.get(driver.id);
  const query = `${driver.name} piloto de Fórmula 1`;
  const parameters = new URLSearchParams({ action: "query", generator: "search", gsrsearch: query, gsrnamespace: "0", gsrlimit: "1", prop: "pageimages", piprop: "thumbnail", pithumbsize: "420", redirects: "1", format: "json", formatversion: "2", origin: "*" });
  try {
    const response = await fetch(`https://es.wikipedia.org/w/api.php?${parameters}`);
    if (!response.ok) throw new Error();
    const image = (await response.json())?.query?.pages?.[0]?.thumbnail?.source ?? null;
    imageCache.set(driver.id, image);
    return image;
  } catch {
    imageCache.set(driver.id, null);
    return null;
  }
}

async function updateDriverSpotlight(driver) {
  if (!driver) return;
  const spotlight = document.querySelector("#driver-spotlight");
  spotlight.dataset.driverId = driver.id;
  const initials = driver.name.split(/\s+/).map((part) => part[0]).slice(-2).join("");
  spotlight.innerHTML = `<div class="portrait"><span>${escapeHtml(initials)}</span><img alt="" hidden></div><div><p class="spotlight-kicker">PILOTO EN FOCO</p><h3>${escapeHtml(driver.name)}</h3><p>${driver.debut}–${driver.lastSeason} · ${number.format(driver.races)} largadas</p></div><dl><div><dt>Ranking</dt><dd>${driver.rank ? `#${driver.rank}` : "—"}</dd></div><div><dt>Pico ELO</dt><dd>${Number(driver.peakRating || 0).toFixed(1)}</dd></div><div><dt>ELO carrera</dt><dd>${Number(driver.careerRating || 0).toFixed(1)}</dd></div></dl>`;
  const image = await fetchDriverImage(driver);
  if (!image || spotlight.dataset.driverId !== driver.id) return;
  const element = spotlight.querySelector("img");
  element.src = image; element.alt = `${driver.name}, imagen de Wikipedia`; element.hidden = false;
}

function brandTrace(brand, overview) {
  return {
    type: "scattergl", mode: "lines+markers", name: brand.name,
    x: brand.points.map((point) => point.index), y: brand.points.map((point) => point.strength),
    customdata: brand.points.map((point) => [brand.id, brand.name, point.season, point.round, point.event, point.models.join(", ") || "Modelo no identificado", point.constructors.join(", "), point.entries, point.bestFinish ?? "—"]),
    connectgaps: true,
    line: { color: colorFor(brand.id), width: overview ? 0.85 : 2.5 }, marker: { color: colorFor(brand.id), size: overview ? 2 : 5 }, opacity: overview ? 0.3 : 1,
    hovertemplate: "<b>%{customdata[1]}</b><br>%{customdata[2]} R%{customdata[3]} · %{customdata[4]}<br><b>Victoria esperada</b> %{y:.1%}<br>Modelo(s): %{customdata[5]}<br>Inscripción original: %{customdata[6]}<br>%{customdata[7]} autos · mejor llegada P%{customdata[8]}<extra></extra>"
  };
}

function initBrandExplorer(data, brands) {
  const chart = document.querySelector("#brand-chart");
  const list = document.querySelector("#brand-list");
  const search = document.querySelector("#brand-search");
  const chips = document.querySelector("#brand-chips");
  const label = document.querySelector("#brand-selection-label");
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));
  const selected = new Set(brands.slice(0, 3).map((brand) => brand.id));
  let mode = "top";

  function chosenBrands() {
    if (mode === "all") return brands;
    if (mode === "top") return brands.slice(0, 10);
    return [...selected].map((id) => brandMap.get(id)).filter(Boolean);
  }
  function renderList() {
    const query = searchKey(search.value.trim());
    const matches = query ? brands.filter((brand) => searchKey(brand.name).includes(query)) : brands;
    list.innerHTML = matches.map((brand) => `<button class="entity-row${selected.has(brand.id) ? " selected" : ""}" type="button" role="option" aria-selected="${selected.has(brand.id)}" data-brand-id="${escapeHtml(brand.id)}" style="--entity-color:${colorFor(brand.id)}"><i></i><span><strong>${escapeHtml(brand.name)}</strong><small>${brand.debut}–${brand.lastSeason} · ${number.format(brand.modelCount)} modelos</small></span><b>${selected.has(brand.id) ? "✓" : ""}</b></button>`).join("") || `<p class="empty-list">No hay coincidencias.</p>`;
  }
  function renderSelection() {
    const chosen = chosenBrands();
    label.textContent = mode === "all" ? `Mostrando ${chosen.length} marcas` : mode === "top" ? "Top 10 por presencia y rendimiento" : chosen.length ? `Comparando ${chosen.length} marca${chosen.length === 1 ? "" : "s"}` : "Elegí marcas para comparar";
    chips.innerHTML = mode === "compare" ? chosen.map((brand) => `<button type="button" data-remove-brand="${escapeHtml(brand.id)}" style="--chip-color:${colorFor(brand.id)}">${escapeHtml(brand.name)} <span>×</span></button>`).join("") : "";
  }
  function renderChart() {
    const chosen = chosenBrands(); renderSelection();
    if (!chosen.length) {
      Plotly.purge(chart); chart.innerHTML = `<div class="plot-empty"><strong>Sin marcas seleccionadas</strong><p>Usá el buscador para preparar una comparación.</p></div>`; return;
    }
    const layout = baseLayout(data, "Probabilidad esperada de victoria", true);
    if (mode !== "all") {
      const indexes = chosen.flatMap((brand) => brand.points.map((point) => point.index));
      const start = Math.min(...indexes), end = Math.max(...indexes), padding = Math.max(8, Math.round((end - start) * 0.035));
      layout.xaxis.range = [Math.max(1, start - padding), Math.min(data.meta.events, end + padding)];
    }
    Plotly.react(chart, chosen.map((brand) => brandTrace(brand, mode === "all")), layout, plotConfig());
  }
  function setMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll("[data-brand-mode]").forEach((button) => button.classList.toggle("active", button.dataset.brandMode === mode));
    renderChart();
  }
  function updateSpotlight(brand) {
    if (!brand) return;
    document.querySelector("#brand-spotlight").innerHTML = `<div class="brand-mark" style="--brand-color:${colorFor(brand.id)}">${escapeHtml(brand.name.slice(0, 2).toUpperCase())}</div><div><p class="spotlight-kicker">MARCA EN FOCO</p><h3>${escapeHtml(brand.name)}</h3><p>${brand.debut}–${brand.lastSeason} · ${number.format(brand.modelCount)} modelos identificados</p></div><dl><div><dt>Grandes Premios</dt><dd>${number.format(brand.points.length)}</dd></div><div><dt>Pico esperado</dt><dd>${percentage.format(Math.max(...brand.points.map((point) => point.strength)))}</dd></div></dl>`;
  }
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-brand-id]"); if (!button) return;
    const id = button.dataset.brandId; selected.has(id) ? selected.delete(id) : selected.add(id);
    renderList(); setMode("compare"); if (selected.has(id)) updateSpotlight(brandMap.get(id));
  });
  chips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-brand]"); if (!button) return;
    selected.delete(button.dataset.removeBrand); renderList(); renderChart();
  });
  search.addEventListener("input", renderList);
  document.querySelectorAll("[data-brand-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.brandMode)));
  chart.on("plotly_hover", (event) => { const id = event.points?.[0]?.customdata?.[0]; if (brandMap.has(id)) updateSpotlight(brandMap.get(id)); });
  chart.on("plotly_click", (event) => { const id = event.points?.[0]?.customdata?.[0]; if (brandMap.has(id)) updateSpotlight(brandMap.get(id)); });
  renderList(); renderChart(); updateSpotlight(brands[0]);
}

function parseCsv(text) {
  const rows = []; let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field.trim()); field = ""; }
    else if (character === "\n") { row.push(field.trim()); rows.push(row); row = []; field = ""; }
    else if (character !== "\r") field += character;
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows.filter((values) => values.some(Boolean));
}

function canonicalDriverAnswer(answer) {
  const normalized = searchKey(answer);
  const aliases = [
    ["Juan Manuel Fangio", ["fangio"]], ["Max Verstappen", ["verstappen", "vesrtappen"]],
    ["Ayrton Senna", ["senna"]], ["Michael Schumacher", ["schumacher"]],
    ["Lewis Hamilton", ["hamilton"]], ["Fernando Alonso", ["alonso"]],
    ["Jim Clark", ["jim clark", "clark"]], ["Alain Prost", ["prost"]],
    ["Niki Lauda", ["lauda"]], ["Sebastian Vettel", ["vettel"]],
    ["Gilles Villeneuve", ["gilles", "villeneuve"]]
  ];
  let match = null;
  for (const [name, values] of aliases) {
    for (const value of values) {
      const position = normalized.indexOf(value);
      if (position >= 0 && (!match || position < match.position)) match = { name, position };
    }
  }
  if (match) return match.name;
  const cleaned = String(answer).trim().replace(/\s+/g, " ");
  return cleaned.length > 38 ? `${cleaned.slice(0, 35)}…` : cleaned || "Sin respuesta";
}

const surveyVariables = [
  { key: "gender", label: "Género", header: "género" },
  { key: "age", label: "Edad", header: "edad" },
  { key: "follows", label: "Sigue la F1", header: "seguís la formula 1" },
  { key: "years", label: "Antigüedad como fan", header: "hace cuánto" },
  { key: "carWeight", label: "Peso del auto vs. piloto", header: "qué pesa más" },
  { key: "fairness", label: "¿Títulos/victorias son injustos?", header: "contar solo las victorias" },
  { key: "statistics", label: "Valor dado a estadísticas", header: "estadísticas procesadas" },
  { key: "wouldUse", label: "Usaría la página", header: "la usarías" }
];

function surveyRecords(rows) {
  const headers = rows[0].map(searchKey);
  const driverIndex = headers.findIndex((header) => header.includes("mejor piloto de la historia"));
  const indexes = Object.fromEntries(surveyVariables.map((variable) => [variable.key, headers.findIndex((header) => header.includes(searchKey(variable.header)))]));
  return rows.slice(1).filter((row) => row[driverIndex]?.trim()).map((row) => ({
    driver: canonicalDriverAnswer(row[driverIndex]),
    values: Object.fromEntries(surveyVariables.map((variable) => [variable.key, indexes[variable.key] >= 0 ? row[indexes[variable.key]]?.trim() || "Sin respuesta" : "Sin datos"]))
  }));
}

function cramersV(records, variableKey, choices) {
  const groups = [...new Set(records.map((record) => record.values[variableKey]))];
  if (groups.length < 2 || choices.length < 2) return 0;
  const table = groups.map((group) => choices.map((choice) => records.filter((record) => record.values[variableKey] === group && record.driver === choice).length));
  const rowTotals = table.map((row) => row.reduce((sum, value) => sum + value, 0));
  const columnTotals = choices.map((_, index) => table.reduce((sum, row) => sum + row[index], 0));
  const total = records.length;
  let chiSquare = 0;
  table.forEach((row, rowIndex) => row.forEach((observed, columnIndex) => {
    const expected = rowTotals[rowIndex] * columnTotals[columnIndex] / total;
    if (expected > 0) chiSquare += ((observed - expected) ** 2) / expected;
  }));
  const denominator = total * Math.min(groups.length - 1, choices.length - 1);
  return denominator > 0 ? Math.sqrt(chiSquare / denominator) : 0;
}

function associationLabel(value) {
  if (value < 0.1) return "muy débil";
  if (value < 0.3) return "débil";
  if (value < 0.5) return "moderada";
  return "fuerte";
}

function renderSurveyCorrelation(records, variableKey, topChoices) {
  const target = document.querySelector("#correlation-view");
  const variable = surveyVariables.find((item) => item.key === variableKey) ?? surveyVariables[0];
  const choices = [...new Set(records.map((record) => topChoices.includes(record.driver) ? record.driver : "Otros"))];
  const normalizedRecords = records.map((record) => ({ ...record, driver: topChoices.includes(record.driver) ? record.driver : "Otros" }));
  const groups = [...new Set(normalizedRecords.map((record) => record.values[variableKey]))];
  const value = cramersV(normalizedRecords, variableKey, choices);
  target.innerHTML = `<div class="correlation-head"><div><span>ASOCIACIÓN EXPLORATORIA</span><strong>V de Cramér ${value.toFixed(2)} · ${associationLabel(value)}</strong></div><p>La muestra es pequeña: el valor describe estas respuestas, no a toda la afición.</p></div><div class="correlation-legend">${choices.map((choice) => `<span><i style="background:${colorFor(choice)}"></i>${escapeHtml(choice)}</span>`).join("")}</div><div class="correlation-groups">${groups.map((group) => {
    const groupRecords = normalizedRecords.filter((record) => record.values[variableKey] === group);
    return `<div class="correlation-row"><div><strong>${escapeHtml(group)}</strong><span>${groupRecords.length} respuesta${groupRecords.length === 1 ? "" : "s"}</span></div><div class="stacked-bar" aria-label="${escapeHtml(variable.label)}: ${escapeHtml(group)}">${choices.map((choice) => {
      const count = groupRecords.filter((record) => record.driver === choice).length;
      return count ? `<i style="width:${count / groupRecords.length * 100}%;background:${colorFor(choice)}" title="${escapeHtml(choice)}: ${count}"></i>` : "";
    }).join("")}</div></div>`;
  }).join("")}</div>`;
}

async function updateLiveChart() {
  const target = document.querySelector("#live-chart");
  if (!target) return;
  try {
    const response = await fetch(`${LIVE_SURVEY_URL}&_=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error();
    const records = surveyRecords(parseCsv(await response.text()));
    const counts = new Map();
    records.forEach((record) => counts.set(record.driver, (counts.get(record.driver) ?? 0) + 1));
    const ranking = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
    const topChoices = ranking.slice(0, 5).map(([driver]) => driver);
    const leaderCount = ranking[0]?.[1] ?? 1;
    target.innerHTML = `<div class="poll-summary"><div class="live-total"><strong>${records.length}</strong><span>respuestas</span></div><div class="poll-ranking">${ranking.map(([driver, count], index) => `<div class="poll-row"><span>${index + 1}</span><strong>${escapeHtml(driver)}</strong><div class="live-track"><i style="width:${count / leaderCount * 100}%;background:${colorFor(driver)}"></i></div><b>${count}</b><em>${percentage.format(count / records.length)}</em></div>`).join("")}</div></div><div class="correlation-control"><label for="correlation-variable">Cruzar la elección del mejor piloto por</label><select id="correlation-variable">${surveyVariables.map((variable) => `<option value="${variable.key}">${escapeHtml(variable.label)}</option>`).join("")}</select></div><div id="correlation-view" class="correlation-view"></div>`;
    const select = document.querySelector("#correlation-variable");
    select.value = "age";
    select.addEventListener("change", () => renderSurveyCorrelation(records, select.value, topChoices));
    renderSurveyCorrelation(records, select.value, topChoices);
  } catch {
    target.innerHTML = `<p>No se pudieron cargar las respuestas en vivo.</p>`;
  }
}

Promise.all([
  fetch(DATA_URL).then((response) => { if (!response.ok) throw new Error(); return response.json(); }),
  Promise.resolve(Plotly)
]).then(([data]) => render(data)).catch((error) => {
  console.error("[F1 Histórica] No se pudo iniciar la visualización.", error);
  app.innerHTML = `<div class="loading error"><strong>No se pudieron cargar los datos.</strong><p>Revisá la conexión e intentá nuevamente.</p></div>`;
});
