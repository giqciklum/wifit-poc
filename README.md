# WiFit Gyms x Ciklum - Guía operativa del PoC

Versión pública:
https://giqciklum.github.io/wifit-poc/

Repositorio:
https://github.com/giqciklum/wifit-poc

Google Sheet de demo:
https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/

Web App de Apps Script:
https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec

## 1. Lo más importante en una frase

La demo funciona así:

`pantalla del PoC -> Apps Script -> Google Sheet`

Esto significa algo muy importante para ti en reunión:

- `Sí` puedes demostrar una conexión real con Google Sheets.
- `Sí` los indicadores conectados de la página pueden refrescarse si cambia la hoja.
- `No` tienes que escribir filas a mano para que la demo funcione.
- `No` todavía no toda la página reacciona fila a fila con cualquier cambio manual; hoy la sincronización viva está centrada en KPIs y estado conectado.

La dirección actual es esta:

1. tú activas un caso en la demo
2. la demo llama al backend de Apps Script
3. Apps Script escribe en Google Sheets
4. tú enseñas la hoja como evidencia de que ha ocurrido algo real
5. además, la página consulta el backend cada pocos segundos para refrescar el estado conectado

## 2. Qué abrir antes de la reunión

Abre estas 2 pestañas y déjalas listas:

1. `Demo pública`
   https://giqciklum.github.io/wifit-poc/

2. `Google Sheet`
   https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/

Opcional:

3. `Repo`
   https://github.com/giqciklum/wifit-poc

Recomendación práctica:

- Pestaña 1: demo
- Pestaña 2: Google Sheet
- Haz la mayor parte de la reunión en la demo
- Abre la hoja solo al final de cada trigger, como prueba de conexión real

## 3. Qué es cada pieza

### Demo pública

Es la parte visual y presentable para cliente.

Aquí enseñas:

- experiencia del socio
- centro de gestión
- triggers de activación, lead e impago
- outputs visuales: evidencias, eventos, tareas, artefactos

### Google Sheet

Es el backend ligero de la demo.

No está para lucirse como frontend. Está para enseñar:

- que existe una capa de datos real
- que un evento no solo cambia la pantalla
- que además queda registrado en una hoja operativa de verdad
- y que el PoC ya puede refrescar indicadores conectados leyendo ese estado vivo

### Apps Script

Es la capa intermedia.

Su papel es:

- recibir la acción desde la demo
- escribir datos en la hoja
- devolver un resumen JSON a la página

Si el cliente pregunta qué tecnología hay detrás, puedes decir esto:

`Para el PoC hemos usado una arquitectura ligera y muy cercana a su realidad actual: una interfaz de producto conectada a una capa de automatización y a una hoja operativa viva.`

## 4. Qué NO tienes que hacer en la reunión

No necesitas:

- editar la hoja manualmente para que "parezca que funciona"
- abrir Apps Script delante del cliente
- explicar endpoints, JSON ni detalles técnicos
- enseñar el repo salvo que te lo pidan

La forma correcta de enseñarlo es:

1. disparas el caso en la demo
2. enseñas el cambio visual
3. cambias a Google Sheet
4. enseñas la evidencia creada

## 5. Cómo contar la conexión sin complicarte

Frase simple recomendada:

`La gracia no es solo que cambie la pantalla; la gracia es que la acción deja rastro real en la capa operativa. Para esta demo hemos conectado la experiencia a una hoja viva para enseñar exactamente eso.`

Otra frase útil:

`Hoy el backend de demo es Google Sheets porque se parece más a la realidad operativa actual del cliente que montar algo enterprise solo para una demo.`

Si te preguntan por la dirección del flujo:

`Ahora mismo la demo dispara la automatización y la hoja refleja el resultado. Si el proyecto siguiera adelante, esa misma lógica podría conectarse a Stripe, CRM, ERP o la base de datos real del grupo.`

Si te preguntan si la web escucha la hoja en vivo, puedes decir esto:

`Sí, el PoC ya refresca el estado conectado leyendo el backend de la hoja. En esta versión la sincronización viva se ve sobre todo en KPIs y estado operativo; la siguiente iteración sería reflejar también el detalle fila a fila en todas las vistas.`

## 6. Guion recomendado de 5 minutos

### Paso 1. Empieza por la demo

Abre:
https://giqciklum.github.io/wifit-poc/

Di esto:

`Aquí estamos separando dos experiencias: una para el socio y otra para gestión. La idea es que ambas compartan la misma lógica de datos y automatización.`

### Paso 2. Enseña primero la parte bonita

Muévete por:

- `Experiencia del Socio`
- `Centro de Gestión`

No abras Google Sheet todavía.

### Paso 3. Abre el simulador

Arriba verás el botón:

`Abrir simulador`

Haz clic ahí.

### Paso 4. Activa un caso

Recomendación de orden:

1. `Activación premium`
2. `Lead de prueba`
3. `Recuperación de impago`

### Paso 5. Enseña el efecto en la demo

Después de activar un caso, enseña:

- cambios en el estado
- cronología de eventos
- artefactos generados
- impacto en socio y gestión

### Paso 6. Solo entonces abre Google Sheet

Di esto:

`Y ahora os enseño que esto no es solo una pantalla bonita: la acción ha quedado registrada en una hoja operativa real.`

## 7. Cómo enseñar Google Sheets, paso a paso

Abre esta hoja:

https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/

Las pestañas importantes son:

- `socios`
- `pagos`
- `leads`
- `reservas`
- `automatizaciones`
- `tareas`

### Regla de oro

Si te pierdes, ve siempre a:

`automatizaciones`

Es la pestaña más segura para demostrar que el trigger dejó rastro.

### Caso 1. Activación premium

En la demo:

1. pulsa `Abrir simulador`
2. pulsa `Activación premium`

Después cambia a la hoja y enseña:

1. `automatizaciones`
   Aquí deberías ver el registro de la acción ejecutada.

2. `socios`
   Aquí puedes enseñar que el socio queda activado o añadido según la lógica del demo backend.

3. `pagos`
   Aquí puedes enseñar el cobro o la referencia asociada.

Frase útil:

`Un cobro confirmado no solo activa una vista premium; también deja alta, pago y trazabilidad operativa en la capa de gestión.`

### Caso 2. Lead de prueba

En la demo:

1. pulsa `Lead de prueba`

Después cambia a la hoja y enseña:

1. `automatizaciones`
2. `leads`

Qué decir:

`Aquí se ve que el lead no se queda en una lista muerta. El sistema lo registra, le da prioridad y prepara la siguiente mejor acción.`

### Caso 3. Recuperación de impago

En la demo:

1. pulsa `Recuperación de impago`

Después cambia a la hoja y enseña:

1. `automatizaciones`
2. `tareas`

Qué decir:

`En lugar de descubrir el impago tarde y gestionarlo a mano, se genera un caso visible y accionable para el equipo.`

## 8. Dónde introducir datos

Respuesta corta:

`Normalmente en ningún sitio.`

Para la demo estándar, no tienes que escribir datos manualmente.

Lo correcto es:

1. disparar el trigger desde la web
2. enseñar cómo cambia la web
3. enseñar la fila o el log que aparece en la hoja

### Si aun así quieres tocar algo manualmente

Puedes abrir la hoja y editarla manualmente, pero recuerda:

`editar la hoja a mano no hace que la web reaccione sola`

Eso todavía no está implementado en esta versión.

Así que, si el cliente te pide "mete algo en la hoja", puedes hacerlo como apoyo visual, pero no vendas que esa edición manual dispara el frontend porque no sería verdad.

## 9. Qué verás en la parte superior de la demo

En la barra superior de la demo puedes ver:

- `Backend en vivo`
- o `Modo demo local`

### Si sale `Backend en vivo`

Perfecto. Significa que la página está hablando con Apps Script y que deberías poder enseñar registros reales en Google Sheets.
También significa que los indicadores conectados pueden actualizarse solos si cambia el estado de la hoja.

### Si sale `Modo demo local`

La demo visual sigue funcionando, pero la escritura en Google Sheets puede no estar activa en ese momento.

Qué hacer:

1. refresca la página
2. espera unos segundos
3. comprueba si cambia a `Backend en vivo`

Si no cambia, puedes seguir la reunión igualmente porque el PoC visual no se rompe.

## 10. Orden ideal para mostrarlo al cliente

Mi recomendación es esta:

1. `Empieza por valor`
   Experiencia del socio y visión general.

2. `Pasa a negocio`
   Centro de gestión y operaciones.

3. `Abre el simulador`
   Un solo caso cada vez.

4. `Prueba visual`
   Enseña el cambio dentro de la demo.

5. `Prueba operativa`
   Enseña Google Sheet.

No empieces por la hoja.

La hoja no vende.
La hoja demuestra.

## 11. Resumen técnico en lenguaje simple

Si te piden una explicación técnica breve, usa esta:

`La demo está publicada en GitHub Pages. Cuando activamos una acción, la web llama a un Apps Script que actualiza una Google Sheet de demo. Luego la propia web consulta ese backend para refrescar indicadores conectados en vivo.`

Versión todavía más corta:

`Frontend estático, automatización ligera y hoja operativa viva como backend de demo.`

## 12. Plan B si algo falla en directo

Si Google Sheets o Apps Script no respondieran:

1. sigue la demo visual
2. no entres en detalle técnico
3. di esto:

`La capa visual y la lógica del journey siguen funcionando. La conexión a la hoja la hemos usado para demostrar trazabilidad operativa, pero la propuesta final no depende de Google Sheets; eso es solo el backend de demo.`

Eso te protege y sigue dejando el mensaje correcto.

## 13. Frases literales que puedes usar

### Apertura

`No queríamos enseñar un dashboard genérico. Queríamos enseñar dos experiencias conectadas: una para el socio y otra para gestión.`

### Al enseñar automatización

`Lo importante aquí no es la tecnología en sí, sino que un evento útil desencadena acciones útiles sin trabajo manual.`

### Al enseñar la hoja

`Aquí se ve la evidencia operativa. No solo cambia la pantalla: queda registro real.`

### Al hablar de visión futura

`Hoy usamos una hoja porque se parece a la realidad actual y nos permite demostrar valor rápido. Mañana la misma lógica puede vivir sobre la arquitectura definitiva del grupo.`

## 14. Datos reales vs datos sintéticos

Esta demo mezcla:

- `Referencias públicas reales`
  marca, sedes visibles, servicios y pricing público de WiFit

- `Datos sintéticos`
  socios, scoring, forecasting, tareas, automatizaciones, cobros y outputs generados

Eso es correcto y está hecho a propósito para poder enseñar algo creíble sin usar datos internos.

## 15. Fuentes públicas usadas como base

- https://wifitgyms.com/
- https://wifitgyms.com/gimnasios/madrid/wifit-retiro/
- https://wifitgyms.provis.es/Public/ProcesoAlta/PasoSeleccionCuota.aspx
- https://www.harbiz.io/
- https://www.harbiz.io/app-entrenamiento-personal
