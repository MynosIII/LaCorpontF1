const DATA_URL = "https://raw.githubusercontent.com/MynosIII/TelemetryOne/main/public/data/datasets/v7_6.json";
const app = document.querySelector("#app");
app.innerHTML = `<div class="loading"><strong>F1 HISTÓRICA</strong><p>Cargando pilotos de todas las épocas…</p></div>`;

function historyChart(data) {
  const allDrivers = Object.values(data.drivers).filter((driver) => driver.points?.length);
  const width = 1120, height = 430, margin = { top: 24, right: 24, bottom: 44, left: 54 };
  const x = (year) => margin.left + ((year - 1950) / 75) * (width - margin.left - margin.right);
  const y = (rating) => height - margin.bottom - ((rating - 1300) / 750) * (height - margin.top - margin.bottom);
  const years = [1950,1960,1970,1980,1990,2000,2010,2020,2025], ratings = [1300,1500,1700,1900,2050];
  return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolución histórica del rendimiento de los pilotos mejor clasificados">
    ${ratings.map((value) => `<line x1="${margin.left}" y1="${y(value)}" x2="${width-margin.right}" y2="${y(value)}" class="grid"/><text x="${margin.left-10}" y="${y(value)+4}" text-anchor="end">${value}</text>`).join("")}
    ${years.map((year) => `<text x="${x(year)}" y="${height-14}" text-anchor="middle">${year}</text>`).join("")}
    ${allDrivers.map((driver,index) => `<polyline class="driver-line" data-name="${driver.name}" data-period="${driver.debut}–${driver.lastSeason}" data-peak="${Number(driver.peakRating || driver.peak || 0).toFixed(1)}" points="${driver.points.map((p) => `${x(p[2])},${y(p[1])}`).join(" ")}" fill="none" stroke="hsl(${(index * 137.508) % 360} 68% 43%)" vector-effect="non-scaling-stroke"/>`).join("")}
  </svg><div id="chart-tooltip" class="chart-tooltip" role="status"></div></div><p class="chart-help">Pasá el cursor sobre una línea para identificar al piloto.</p>`;
}

const driverRows = (drivers) => drivers.map((driver) => `<tr><td>${driver.rank ?? "—"}</td><td><strong>${driver.name}</strong></td><td>${driver.debut}</td><td>${driver.lastSeason}</td><td>${driver.events ?? 0}</td><td>${Number(driver.peak || 0).toFixed(1)}</td></tr>`).join("");
const carRows = (cars) => cars.map((car,index) => `<tr><td>${index+1}</td><td><strong>${car.name}</strong></td><td>${car.debut}</td><td>${car.events}</td><td>${Number(car.dominanceScore || 0).toFixed(1)}</td></tr>`).join("");

function render(data) {
  const drivers = [...data.rankings.drivers].sort((a,b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  const cars = [...data.rankings.cars].sort((a,b) => b.dominanceScore - a.dominanceScore);
  app.innerHTML = `<header><div><p class="eyebrow">FÓRMULA 1 · 1950–2025</p><h1>Historia y rendimiento</h1><p class="intro">Evolución histórica, clasificación completa de pilotos, autos y preferencias de los aficionados.</p></div><p class="count"><strong>${drivers.length}</strong> pilotos<br><strong>${cars.length}</strong> autos</p></header>
  <section aria-labelledby="history-title"><div class="section-title"><div><p class="number">01</p><h2 id="history-title">Evolución de todos los pilotos</h2></div><p>${drivers.length} trayectorias ELO a través del tiempo</p></div>${historyChart(data)}</section>
  <section aria-labelledby="drivers-title"><div class="section-title"><div><p class="number">02</p><h2 id="drivers-title">Todos los pilotos</h2></div><p>Todas las épocas · clasificación completa</p></div><label class="search">Buscar piloto<input id="driver-search" type="search" placeholder="Nombre del piloto" autocomplete="off"></label><div class="table-wrap"><table><thead><tr><th>#</th><th>Piloto</th><th>Debut</th><th>Última temporada</th><th>Carreras</th><th>Pico ELO</th></tr></thead><tbody id="driver-body">${driverRows(drivers)}</tbody></table></div></section>
  <section aria-labelledby="cars-title"><div class="section-title"><div><p class="number">03</p><h2 id="cars-title">Clasificación de autos</h2></div><p>Todos los modelos · dominio histórico</p></div><div class="table-wrap cars"><table><thead><tr><th>#</th><th>Auto</th><th>Año</th><th>Carreras</th><th>Índice</th></tr></thead><tbody>${carRows(cars)}</tbody></table></div></section>
  <section aria-labelledby="fan-title"><div class="section-title"><div><p class="number">04</p><h2 id="fan-title">Fan Index</h2></div><p>Preferencias históricas ponderadas</p></div><div class="fan-list">${[["Ayrton Senna",28.04],["Michael Schumacher",20.55],["Juan Manuel Fangio",15.39],["Jim Clark",9.15],["Lewis Hamilton",8.88],["Fernando Alonso",4.44],["Gilles Villeneuve",2.86],["Max Verstappen",2.09]].map((item,index) => `<div class="fan-row"><span>${index+1}</span><strong>${item[0]}</strong><div class="bar"><i style="width:${item[1]/28.04*100}%"></i></div><b>${item[1]}%</b></div>`).join("")}</div></section>
  <footer><span>F1 HISTÓRICA</span><p>Clasificación comparativa de pilotos y autos</p></footer>`;
  document.querySelector("#driver-search").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLocaleLowerCase("es");
    document.querySelector("#driver-body").innerHTML = driverRows(drivers.filter((driver) => driver.name.toLocaleLowerCase("es").includes(query)));
  });
  const tooltip = document.querySelector("#chart-tooltip");
  document.querySelectorAll(".driver-line").forEach((line) => {
    line.addEventListener("pointerenter", () => {
      tooltip.innerHTML = `<strong>${line.dataset.name}</strong><span>${line.dataset.period} · Pico ELO ${line.dataset.peak}</span>`;
      tooltip.classList.add("visible");
    });
    line.addEventListener("pointermove", (event) => {
      const bounds = event.currentTarget.closest(".chart-wrap").getBoundingClientRect();
      tooltip.style.left = `${event.clientX - bounds.left + 14}px`;
      tooltip.style.top = `${event.clientY - bounds.top + 14}px`;
    });
    line.addEventListener("pointerleave", () => tooltip.classList.remove("visible"));
  });
}

fetch(DATA_URL).then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then(render).catch(() => {
  app.innerHTML = `<div class="loading error"><strong>No se pudieron cargar los datos.</strong><p>Revisá la conexión e intentá nuevamente.</p></div>`;
});
