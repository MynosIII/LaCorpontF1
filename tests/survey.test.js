import test from "node:test";
import assert from "node:assert/strict";
import { extractDriverVotes, surveyRecords, weightedRanking } from "../src/survey.js";

const drivers = [
  "Juan Manuel Fangio", "Michael Schumacher", "Ralf Schumacher", "Lewis Hamilton",
  "Ayrton Senna", "Max Verstappen", "Lando Norris", "Niki Lauda"
];

test("limpia emojis, errores frecuentes y respuestas con varios pilotos", () => {
  assert.deepEqual(extractDriverVotes("LANDO NORRIS 🫦🐱", drivers), ["Lando Norris"]);
  assert.deepEqual(extractDriverVotes("Max Verstapen / Michael Schumacher", drivers), ["Max Verstappen", "Michael Schumacher"]);
  assert.deepEqual(extractDriverVotes("Juan Manuel Fangio, Michael Schumacher y Lewis Hamilton", drivers), ["Juan Manuel Fangio", "Michael Schumacher", "Lewis Hamilton"]);
});

test("prioriza un nombre completo sobre el apellido GOAT predeterminado", () => {
  assert.deepEqual(extractDriverVotes("Ralf Schumacher", drivers), ["Ralf Schumacher"]);
});

test("une las ramas española e inglesa y conserva una sola fila por persona", () => {
  const rows = [[
    "Marca temporal", "Idioma - Language", "País", "Género", "Edad", "¿Seguís la Formula 1?",
    "¿Cómo empezaste a seguir la F1?:", "¿Hace cuánto ves o seguís la Fórmula 1?",
    "¿En qué medios o plataformas consumís contenido sobre F1?", "¿Ves o seguís otras categorías del automovilismo además de la F1?",
    "¿Quién es para vos el mejor piloto de la historia de la F1 (G.O.A.T.)?",
    "Cuando elegís a tu piloto favorito o al que considerás el mejor, ¿en qué te basás principalmente?",
    "Para vos, ¿qué pesa más en el resultado final para ganar una carrera?",
    "En una discusión sobre quién es el mejor piloto de la historia, ¿sentís que contar solo las victorias/títulos es injusto porque algunos corrieron con mejores autos que otros?",
    "A la hora de comparar pilotos de distintas épocas o equipos, ¿qué peso le das a las estadísticas procesadas?",
    "Country of residence", "Gender", "Age", "Do you follow Formula 1?", "How did you start following Formula 1?",
    "How long have you been following F1?", "Which sources/media do you use to consume F1 content?",
    "Do you follow other motorsport categories besides F1?", "In your opinion, who is the greatest driver of all time (G.O.A.T.)?",
    "When choosing the best driver, what attribute do you value the most?", "What has the biggest impact on winning a race?",
    "When deciding the G.O.A.T, do you consider it unfair to compare eras based only on titles, knowing the difference in car performance?",
    "When debating driver comparisons, how much weight do you give to advanced statistics (telemetry/ELO)?"
  ], [
    "date", "Español", "Argentina", "Femenino", "18 a 24", "Sí", "Tradición familiar / Amigos", "5 años o más",
    "Televisión / Transmisiones oficiales", "F2", "LANDO NORRIS 🫦🐱", "En su talento al manejar, más allá del auto que tenga",
    "Un 50% y 50% equivalente entre auto y piloto", "Sí, totalmente. El auto distorsiona las estadísticas reales.", "Fundamental",
    "Argentina", "Female", "18 to 24", "Yes", "Family tradition / Friends", "More than 5 years", "TV broadcasts / F1 TV",
    "F2", "Lando Norris", "Pure talent (winning or standing out besides using inferior cars)", "50% / 50%",
    "Yes, the car distorts real driver statistics.", "Fundamental"
  ], [
    "date", "English", "", "", "", "", "", "", "", "", "", "", "", "", "",
    "Argentina", "Male", "25 to 34", "Yes", "Social media / Memes / TikTok", "Between 1 and 5 years", "TV broadcasts / F1 TV",
    "None", "I'd say between Hamilton and Verstappen", "Pure talent (winning or standing out besides using inferior cars)", "50% / 50%",
    "Yes, the car distorts real driver statistics.", "Very little (You prioritize Passion / Intuition)"
  ]];

  const records = surveyRecords(rows, drivers);
  assert.equal(records.length, 2);
  assert.deepEqual(records[0].votes, ["Lando Norris"]);
  assert.deepEqual(records[1].votes, ["Lewis Hamilton", "Max Verstappen"]);
  assert.equal(records[0].values.gender, "Femenino");
  assert.equal(records[1].values.gender, "Masculino");
  assert.equal(records[1].values.years, "2 a 4 años");
  assert.equal(records[1].values.statistics, "Casi nada");
});

test("divide un voto en partes iguales sin inflar el total", () => {
  const records = [
    { votes: ["Juan Manuel Fangio"], values: {} },
    { votes: ["Michael Schumacher", "Lewis Hamilton", "Juan Manuel Fangio"], values: {} }
  ];
  const ranking = new Map(weightedRanking(records));
  assert.equal(ranking.get("Juan Manuel Fangio"), 1 + 1 / 3);
  assert.equal(ranking.get("Michael Schumacher"), 1 / 3);
  assert.ok(Math.abs([...ranking.values()].reduce((sum, value) => sum + value, 0) - 2) < 1e-12);
});
