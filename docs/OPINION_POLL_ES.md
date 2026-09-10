# Fan Index de TelemetryOne

## Qué mide

El Fan Index responde una pregunta específica: **¿a qué piloto elige explícitamente cada autor como el mejor piloto de Fórmula 1 de todos los tiempos dentro de las conversaciones públicas seleccionadas?** Es una muestra por conveniencia de comentarios públicos, no una encuesta representativa de los fans de Fórmula 1.

El modelo de rendimiento y el ranking de opinión se mantienen deliberadamente en páginas separadas. El primero estima el rendimiento histórico a partir de datos de carreras; el segundo describe la opinión pública visible.

## Elección de herramientas

| Plataforma | Conector principal | Costo | Requisito | Decisión |
| --- | --- | --- | --- | --- |
| YouTube | `youtube-comment-downloader` | Gratis | Ninguno para comentarios públicos | Utilizado para la prueba piloto reproducible |
| YouTube | Data API v3 | Cuota gratuita | Clave de API de Google Cloud | Mejor reemplazo a largo plazo |
| Reddit | Fuentes públicas Atom/RSS | Gratis | Límite de solicitudes | Utilizado cuando responde la fuente pública |
| Foros | HTML de XenForo/phpBB | Gratis | Hilo público | Utilizado; se elimina el texto citado |
| X | `twscrape` | Gratis / MIT | Cookies de una sesión autorizada de X | Implementado, desactivado de manera predeterminada |
| Instagram | `Instaloader` | Gratis / MIT | Publicación pública; con frecuencia requiere inicio de sesión | Implementado, desactivado de manera predeterminada |

El paquete de YouTube que no requiere clave todavía incluye un agente de usuario obsoleto de Chrome 79. TelemetryOne lo reemplaza por el de un navegador actual; sin ese cambio, la página de YouTube de 2026 no expone la configuración que espera el paquete. La API oficial de YouTube es más estable: las solicitudes públicas a `commentThreads.list` cuestan una unidad de cuota, pero requieren un proyecto y una clave de API.

En la práctica, X e Instagram no son fuentes anónimas que funcionen sin configuración. `twscrape` exige explícitamente una cuenta autorizada de X y guarda sus sesiones en SQLite. Instaloader puede leer comentarios de una publicación pública, pero Instagram puede exigir una sesión iniciada y modificar sus límites de acceso. El proyecto no automatiza la creación de cuentas, la resolución de CAPTCHA, la rotación de proxies ni la evasión de controles de acceso.

## Estado actual de la muestra

Los manifiestos de recolección se encuentran en `configs/opinion_sources*.json`. La muestra del 29 de agosto de 2026 contiene 16.364 comentarios públicos únicos de 61 conversaciones seleccionadas en YouTube, Reddit, GTPlanet, Z4 Forum y FORUMula1. Después de la clasificación, la deduplicación de comentarios y autores, y la eliminación de elecciones contradictorias, quedan 1.632 votos explícitos. Treinta y tres conversaciones contienen al menos cinco votos válidos y, por lo tanto, influyen en el índice balanceado.

El objetivo de trabajo era alcanzar 2.000 elecciones válidas. La muestra se detiene por debajo de ese objetivo para no debilitar la definición de voto. Se analizaron con mayor profundidad las conversaciones más grandes de YouTube y se amplió la búsqueda en inglés, español, portugués, francés, alemán e italiano. Los falsos positivos de búsqueda —por ejemplo, rankings de carreras, carisma o temporadas actuales— se excluyen explícitamente de la versión publicada.

## Del comentario al voto

1. Descargar el comentario público y los metadatos de la fuente.
2. Reemplazar inmediatamente el identificador del autor o canal por una clave estable derivada mediante SHA-256. No conservar nombres de autores, avatares ni direcciones de perfiles.
3. Buscar coincidencias en una lista seleccionada de alias multilingües de pilotos.
4. Contar únicamente un apoyo directo, la primera posición de un ranking explícito o una respuesta que contenga solamente un nombre ante la pregunta. Una afirmación relativa del tipo «X es mejor que Y» no basta para determinar una elección histórica absoluta.
5. Rechazar comentarios sin piloto, menciones simples, preguntas y respuestas ambiguas con varios pilotos.
6. Conservar un voto por autor anonimizado y plataforma. Las elecciones idénticas repetidas se reducen a una; los autores que realizan elecciones contradictorias se eliminan en lugar de resolver el conflicto mediante “me gusta” o interacción.
7. Dentro de cada fuente que contenga al menos cinco votos válidos, calcular la proporción de cada piloto. Promediar esas proporciones por fuente dentro de cada plataforma y luego asignar el mismo peso a YouTube, Reddit y los foros.

También se exportan el conteo bruto de votos y el intervalo de Wilson del 95 %. El intervalo describe la incertidumbre muestral dentro de esta muestra por conveniencia; no elimina el sesgo de selección.

## Reproducción

Desde el directorio `TelemetryOne`:

```powershell
python -m pip install -e ".[scrape]"
python -m historical_xw.opinion_cli collect `
  --config configs/opinion_sources.json `
  --output data/opinion/comments-shard-0.jsonl `
  --shard-index 0 --shard-count 3
$opinionInputs = (Get-ChildItem -Path data/opinion -Filter 'comments-*.jsonl').FullName
python -m historical_xw.opinion_cli build `
  --input $opinionInputs `
  --exclude-source-file configs/opinion_excluded_sources.json `
  --output public/data/opinion-ranking.json
python -m http.server 8765 --directory public
```

Abrir `http://127.0.0.1:8765/opinion/`.

## Habilitar X

Crear una base de datos de cuentas autorizadas de `twscrape` siguiendo las instrucciones de ese proyecto y luego cambiar la fuente `x-f1-goat` a `"enabled": true`. Nunca incluir en el repositorio `accounts.db`, cookies, contraseñas ni sesiones exportadas del navegador.

## Habilitar Instagram

Elegir una publicación pública cuyo texto pregunte por el mejor piloto de todos los tiempos, reemplazar la URL y el código corto de ejemplo, crear localmente una sesión de Instaloader si Instagram lo exige y habilitar la fuente. Nunca incluir el archivo de sesión en el repositorio. No se debe usar una pregunta de fuente centrada en un piloto específico porque preseleccionaría la comunidad de fans de ese piloto.

## Limitaciones principales

- Los fans eligen por sí mismos participar en los hilos de comentarios.
- El enfoque del video, la audiencia del canal, el idioma, la época y los algoritmos de recomendación afectan la exposición.
- Los comentarios eliminados, ocultos, privados y no indexados no están presentes.
- Un clasificador basado en reglas sacrifica cobertura a cambio de auditabilidad y mayor precisión.
- X e Instagram quedan excluidos de esta muestra hasta que se proporcionen sesiones autorizadas; sus recolectores siguen disponibles sin debilitar los controles de acceso.
- Los resultados deberían actualizarse según un calendario declarado y mantenerse versionados; las actualizaciones silenciosas en vivo harían que los resultados utilizados en clase no fueran reproducibles.
