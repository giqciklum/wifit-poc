# WiFit Gyms x Ciklum - Manual Maestro del PoC

Esta guía está pensada para abrirla justo antes de una reunión y no tener que reconstruir nada.

Objetivo:

- enseñar el PoC con claridad
- contar bien la historia de producto
- saber qué abrir, en qué orden y qué decir
- mostrar socio, gestión, automatización, IA y finanzas sin abrumar

Última verificación manual de esta guía: `15 de abril de 2026`.

## 1. Qué es este PoC

Esto no es una landing bonita y no es otro dashboard genérico.

Esto es una visión de producto conectada para WiFit:

- una capa premium para el socio
- una capa operativa para negocio
- una capa de automatización visible
- una lectura financiera entendible

La idea que hay que transmitir es esta:

`No solo cambia la pantalla; la acción deja rastro real en la capa operativa.`

## 2. Enlaces clave

Demo pública  
[https://giqciklum.github.io/wifit-poc/](https://giqciklum.github.io/wifit-poc/)

Repositorio  
[https://github.com/giqciklum/wifit-poc](https://github.com/giqciklum/wifit-poc)

Google Sheet de demo  
[https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/](https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/)

Web App de Apps Script  
[https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec](https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec)

Archivos clave del repo  
[index.html](/Users/computerxperts/Documents/POC/index.html)  
[assets/demo-runtime.js](/Users/computerxperts/Documents/POC/assets/demo-runtime.js)  
[apps-script/Code.gs](/Users/computerxperts/Documents/POC/apps-script/Code.gs)

## 3. Resumen en 20 segundos

La demo enseña dos journeys conectados:

- `Experiencia del Socio`
- `Centro de Gestión`

Encima de eso, el PoC añade dos cosas que le dan peso real:

- automatización visible con trazabilidad operativa
- lectura financiera conectada a eventos de negocio

Arquitectura actual:

`Frontend estático -> Apps Script -> Google Sheet`

Qué significa eso hoy:

- el frontend dispara acciones reales de demo
- el backend escribe en Google Sheets
- el frontend lee estado vivo por polling
- si el backend falla, la demo sigue funcionando con fallback local

## 4. Estado actual del PoC

Hoy el PoC ya soporta:

- portada premium y más cercana a producto real
- dos recorridos diferenciados: socio y gestión
- runtime compacto con `Abrir simulador`
- triggers de negocio conectados
- badge de backend: `Backend en vivo` o `Modo demo local`
- lectura en vivo de `socios`, `leads`, `logs` y `finanzas`
- pestaña `Finanzas` conectada al backend real

La parte financiera ya enseña:

- `Cash In 30d`
- `Cash Out 30d`
- `Net Cash Forecast`
- `Revenue at Risk`
- `Balance semanal proyectado`
- `Agenda financiera próxima`

## 5. Qué sí es y qué no es

### Sí es

- un PoC comercial potente
- una visión de producto conectada
- una demo con backend real de demostración
- una forma muy entendible de enseñar automatización y operación

### No es

- un producto de producción
- la arquitectura final recomendada
- un CRM o ERP terminado
- una defensa de Google Sheets como backend final

La forma correcta de explicarlo:

`Google Sheets aquí es una capa operativa de demo para demostrar trazabilidad y automatización real de una forma muy entendible para el cliente.`

## 6. Qué preparar antes de una reunión

Abre estas 3 pestañas:

1. Demo  
   [https://giqciklum.github.io/wifit-poc/](https://giqciklum.github.io/wifit-poc/)
2. Google Sheet  
   [https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/](https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/)
3. Repo  
   [https://github.com/giqciklum/wifit-poc](https://github.com/giqciklum/wifit-poc)

Orden recomendado:

- casi toda la reunión: demo
- prueba operativa: Google Sheet
- solo si preguntan por detalle técnico: repo

Checklist rápido:

- la demo abre
- el botón `Abrir simulador` funciona
- el badge intenta conectar backend
- puedes abrir la Google Sheet
- no hay basura visual evidente de pruebas internas

## 7. Mensaje correcto de la demo

Si tienes que resumir la propuesta en una frase, usa esta:

`Estamos enseñando cómo una experiencia premium para el socio se conecta con una capa operativa real para negocio.`

Si necesitas una segunda frase:

`La misma acción puede impactar experiencia, operación, automatización y forecast financiero.`

## 8. Guion recomendado de 5 minutos

### Paso 1. Arranca por visión, no por tecnología

Abre la demo y di:

`No estamos enseñando un dashboard genérico. Estamos enseñando dos experiencias conectadas: una para el socio y otra para gestión.`

### Paso 2. Enseña la portada

Recorre rápido:

- propuesta de valor
- diferencia entre `Experiencia del Socio` y `Centro de Gestión`
- presencia de `WiFit IA`

Objetivo:

- que se entienda que esto es producto
- que no parezca una demo técnica improvisada

### Paso 3. Entra en la parte socio

Abre `Experiencia del Socio` y enseña:

- rutina
- nutrición
- clases
- progreso
- recomendación personalizada

Qué decir:

`La IA aquí no es un gadget. Es una capa premium que acompaña al socio y puede aumentar valor percibido, engagement y monetización.`

### Paso 4. Vuelve y enseña gestión

Abre `Centro de Gestión` y señala:

- socios
- leads
- operaciones
- finanzas
- visibilidad multi-área

Qué decir:

`La gracia no es solo mejorar la experiencia del socio, sino conectar esa experiencia con una operación más visible y más automatizada.`

### Paso 5. Abre el simulador

Pulsa `Abrir simulador`.

Di:

`Aquí entramos en la capa viva del PoC: acciones concretas que generan impacto visible y trazabilidad real.`

### Paso 6. Lanza un caso principal

Orden recomendado:

1. `Activación premium`
2. `Lead de prueba`
3. `Recuperación de impago`

No hace falta enseñar los tres siempre. Con uno o dos suele bastar.

### Paso 7. Enseña el impacto en pantalla

Muestra:

- cambio de estado
- cronología de eventos
- artefactos generados
- efecto en socio y gestión
- evidencia de automatización

### Paso 8. Solo después abre la Google Sheet

Di esto:

`Y ahora os enseño que esto no se queda en frontend: la acción ha dejado rastro real en una capa operativa viva.`

Enseña primero:

- `automatizaciones`

Luego, según el caso:

- `socios`
- `pagos`
- `leads`
- `tareas`

### Paso 9. Solo si entra conversación financiera, abre Finanzas

No la enseñes por defecto si no hace falta.

Ábrela solo si aparece claramente un perfil financiero o de dirección.

## 9. Qué enseña cada capa

### Capa socio

Qué se quiere transmitir:

- experiencia más premium que una app básica de gimnasio
- personalización
- seguimiento
- recomendación
- percepción de producto propio

Mensaje útil:

`WiFit IA convierte una cuota accesible en una experiencia con más valor percibido y más continuidad.`

### Capa gestor

Qué se quiere transmitir:

- visión operativa
- control de socios
- captación
- tareas
- pagos
- lectura ejecutiva

Mensaje útil:

`La operación no va por un lado y el socio por otro. Todo forma parte del mismo sistema.`

### Capa automatización

Qué se quiere transmitir:

- menos trabajo manual
- acciones que dejan evidencia
- secuencias visibles
- respuesta rápida ante cobro, lead o incidencia

Mensaje útil:

`No solo mostramos el evento; mostramos la consecuencia operativa del evento.`

### Capa IA

Qué se quiere transmitir:

- valor real para el socio
- posible monetización premium
- diferenciación frente a soluciones más genéricas

Mensaje útil:

`La IA aquí funciona como una capa de producto propia, no como un añadido cosmético.`

### Capa financiera

Qué se quiere transmitir:

- visibilidad de caja futura
- ingresos en riesgo
- efecto de cobros e impagos sobre el forecast
- lectura útil para dirección y CFO

Mensaje útil:

`No estamos enseñando solo facturación. Estamos enseñando cómo la operación modifica la previsión de caja.`

## 10. Casos de demo recomendados

### Caso 1. Activación premium

Qué hacer en demo:

1. abrir simulador
2. lanzar `Activación premium`
3. enseñar cronología y evidencias
4. abrir Google Sheet
5. enseñar `automatizaciones`, `socios` y `pagos`

Qué demuestra:

- cobro confirmado
- activación de servicio premium
- trazabilidad operativa
- impacto en experiencia y negocio

Frase útil:

`Un cobro confirmado no solo activa una vista premium; también deja alta, pago y automatización real.`

### Caso 2. Lead de prueba

Qué hacer en demo:

1. lanzar `Lead de prueba`
2. enseñar priorización y seguimiento
3. abrir `automatizaciones`
4. abrir `leads`

Qué demuestra:

- captación conectada
- siguiente mejor acción
- lectura comercial más útil que una simple fila

Frase útil:

`El lead deja de ser una fila muerta y pasa a una secuencia con contexto y próxima acción.`

### Caso 3. Recuperación de impago

Qué hacer en demo:

1. lanzar `Recuperación de impago`
2. enseñar eventos, retención y evidencias
3. abrir `automatizaciones`
4. abrir `tareas`

Qué demuestra:

- detección de incidencia
- secuencia de recuperación
- impacto operativo inmediato

Frase útil:

`El impago deja de descubrirse tarde y pasa a una secuencia visible de recuperación.`

### Caso 4. Perfil CFO o dirección financiera

Qué hacer en demo:

1. abrir `Finanzas`
2. enseñar los 4 KPIs
3. recorrer `Balance semanal proyectado`
4. recorrer `Agenda financiera próxima`
5. si vienes de un trigger, señalar la evidencia financiera generada

Qué demuestra:

- lectura de tesorería
- ingresos en riesgo
- semanas tensas
- impacto real de cobros e impagos

Frase útil:

`La misma capa que activa al socio y recupera impagos también anticipa caja y hace visible el forecast.`

## 11. Cómo enseñar Finanzas

La pestaña `Finanzas` ya está conectada al backend real y lee `snapshot.finanzas`.

Hoy muestra:

- 4 KPI cards
- balance semanal por ingresos vs gastos
- agenda financiera de próximos eventos

### Fórmulas de los KPIs

`Cash In 30d`

- suma de `importe` donde `tipo = ingreso` y `estado != riesgo`

`Cash Out 30d`

- suma de `importe` donde `tipo = gasto`

`Revenue at Risk`

- suma de `importe` donde `tipo = ingreso` y `estado = riesgo`

`Net Cash Forecast`

- `Cash In - Cash Out`

### Qué mirar en la tabla

Columnas:

- `fecha`
- `tipo`
- `categoria`
- `sede`
- `importe`
- `estado`

### Qué decir al enseñarla

`Esto ya no es un bloque financiero decorativo. Está conectado al backend y se recalcula según los eventos que estamos moviendo en la demo.`

## 12. Evidencias financieras que ya existen en el front

Cuando enseñas la capa financiera o el stream de automatización, ya puedes señalar:

- `Previsión de caja actualizada`
- `Ingreso movido a riesgo en agenda financiera`
- `Forecast de caja ajustado`

Estas evidencias son importantes porque conectan:

- pago o impago
- operación
- forecast financiero

## 13. Qué enseñar en Google Sheets

No hace falta enseñar toda la hoja.

Las pestañas más útiles son:

- `automatizaciones`
- `socios`
- `pagos`
- `leads`
- `tareas`
- `agenda_financiera`

Orden recomendado:

1. `automatizaciones`
2. la pestaña específica del caso

Regla simple:

`La hoja no vende. La hoja demuestra.`

## 14. Qué cambia en vivo y qué no

### Sí cambia en vivo

- estado de backend
- KPIs conectados
- snapshot de `socios`
- snapshot de `leads`
- snapshot de `logs`
- snapshot de `finanzas`

### No es el objetivo principal enseñar

- Apps Script por dentro
- endpoints
- JSON
- edición manual de filas en reunión

La forma correcta de explicarlo:

`El PoC ya tiene lectura y escritura real sobre una capa operativa viva. No hace falta entrar en la implementación para entender el valor.`

## 15. Qué decir según quién tengas delante

### Si habla negocio general

`Estamos enseñando una experiencia mejor para el socio y una operación más visible para el negocio, conectadas entre sí.`

### Si habla operaciones

`La gracia está en que cobros, incidencias, tareas y seguimiento dejan rastro y reducen trabajo manual.`

### Si habla producto

`Aquí hay una base clara para construir una experiencia propia y diferencial de WiFit, no una simple personalización de una herramienta estándar.`

### Si habla CFO o dirección

`La operación ya no se queda en backend invisible: aparece traducida en caja prevista, ingresos en riesgo y visibilidad de semanas tensas.`

### Si preguntan por build vs buy

`Una herramienta estándar puede cubrir una necesidad puntual. Una capa propia conectada a socio, captación, cobros y operación puede convertirse en un activo estratégico del grupo.`

### Si preguntan por futuro

`Hoy usamos una capa operativa muy entendible para demostrar valor rápido. Si esto avanzara, la misma lógica podría conectarse a Stripe, CRM, ERP o stack cloud corporativo.`

## 16. Qué no hacer en reunión

No hagas esto:

- no empieces por la hoja
- no abras Apps Script
- no expliques endpoints salvo que te lo pidan
- no vendas Google Sheets como arquitectura final
- no mezcles demasiadas historias a la vez
- no abras `Finanzas` si no hay interés financiero claro

## 17. Qué decir sobre ciberseguridad si sale el tema

Ángulo recomendado:

`Es una conversación muy relevante, pero yo la trataría como siguiente capa del proyecto: gobierno del dato, permisos, auditoría y resiliencia operativa.`

No conviene abrir este relato en la demo principal salvo que el cliente lo lleve ahí.

## 18. Cómo saber si el backend está vivo

En la parte superior de la demo verás uno de estos estados:

- `Backend en vivo`
- `Modo demo local`
- `Conectando backend`

### Si sale `Backend en vivo`

Puedes decir:

`La página está conectada al backend y está refrescando estado operativo real.`

### Si sale `Modo demo local`

La demo sigue funcionando.

Haz esto:

1. refresca la página
2. espera unos segundos
3. comprueba si cambia el badge

Si no cambia, sigue con la demo y di:

`La capa visual y la lógica del journey siguen funcionando. La conexión live refuerza la trazabilidad, pero no es necesaria para entender el concepto.`

## 19. Si algo falla en directo

### Si falla la demo

- refrescar la página
- volver a portada
- probar un único caso, no varios seguidos

### Si falla el backend

- seguir con la demo en modo local
- evitar explicaciones técnicas largas

### Si falla Google Sheets

- no insistir
- volver a la demo
- centrar el relato en producto + automatización visible

### Si vas justo de tiempo

Haz solo esto:

1. portada
2. `Experiencia del Socio`
3. `Centro de Gestión`
4. `Abrir simulador`
5. `Activación premium`
6. Google Sheet en `automatizaciones`

## 20. FAQ rápido

### ¿Qué tecnología hay detrás?

Versión corta:

`Frontend estático, automatización ligera y hoja operativa viva como backend de demo.`

Versión completa:

`La demo está publicada en GitHub Pages. El frontend llama a un Apps Script que escribe en Google Sheets y luego refresca el estado conectado leyendo ese backend.`

### ¿Es Google Sheets el backend final?

No.

`Es una capa operativa de demo para demostrar trazabilidad y automatización real de forma muy entendible.`

### ¿La IA es solo chat?

No.

En el relato correcto, la IA afecta:

- experiencia del socio
- personalización
- continuidad
- monetización premium

### ¿La parte financiera es real o decorativa?

Hoy ya está conectada al backend real de demo.

La conversación correcta es:

`La lectura financiera no está separada del resto. Sale de eventos operativos y por eso sirve para dirección.`

## 21. Datos reales vs sintéticos

La demo mezcla dos tipos de base:

- `referencias públicas reales`
- `datos sintéticos de operación`

Qué entra en cada grupo:

- reales: marca, narrativa, pricing público, sedes visibles y referencias de mercado
- sintéticos: socios, leads, scoring, forecast, automatizaciones, tareas, pagos y agenda financiera

Esto es correcto y deseable en un PoC comercial.

La forma simple de explicarlo:

`Usamos referencias reales para que el caso sea creíble y datos sintéticos para poder demostrar flujos de negocio sin usar datos del cliente.`

## 22. Limpieza de demo si habéis hecho muchas pruebas

Si se han lanzado muchos triggers de prueba, la hoja puede acumular filas nuevas.

Opciones razonables antes de una reunión:

- dejar la hoja tal cual si el volumen no confunde
- limpiar manualmente las filas más evidentes de prueba
- resetear la base de demo si hace falta una puesta en escena más limpia

Regla práctica:

`No hace falta dejar la hoja perfecta; hace falta que el relato se entienda bien.`

## 23. Arquitectura actual

Arquitectura actual del PoC:

`Frontend estático publicado -> Apps Script Web App -> Google Sheet`

Endpoints principales del backend:

- `?action=state`
- `?action=state&detail=full`
- `?action=activation`
- `?action=lead`
- `?action=retention`

El `detail=full` devuelve hoy:

- `snapshot.socios`
- `snapshot.leads`
- `snapshot.logs`
- `snapshot.finanzas`

El frontend hace polling cada `12` segundos.

## 24. Tabs principales de la Google Sheet

La demo usa datos sintéticos y pestañas operativas como:

- `socios`
- `pagos`
- `leads`
- `reservas`
- `automatizaciones`
- `tareas`
- `agenda_financiera`

## 25. Archivos más importantes del proyecto

Si alguien necesita contexto técnico rápido, estos son los archivos clave:

1. [README.md](/Users/computerxperts/Documents/POC/README.md)
2. [index.html](/Users/computerxperts/Documents/POC/index.html)
3. [assets/demo-runtime.js](/Users/computerxperts/Documents/POC/assets/demo-runtime.js)
4. [apps-script/Code.gs](/Users/computerxperts/Documents/POC/apps-script/Code.gs)

## 26. Fuentes públicas usadas como base

Referencias públicas utilizadas para inspirar el PoC:

- [https://wifitgyms.com/](https://wifitgyms.com/)
- [https://wifitgyms.com/gimnasios/madrid/wifit-retiro/](https://wifitgyms.com/gimnasios/madrid/wifit-retiro/)
- [https://wifitgyms.provis.es/Public/ProcesoAlta/PasoSeleccionCuota.aspx](https://wifitgyms.provis.es/Public/ProcesoAlta/PasoSeleccionCuota.aspx)
- [https://www.harbiz.io/](https://www.harbiz.io/)
- [https://www.harbiz.io/app-entrenamiento-personal](https://www.harbiz.io/app-entrenamiento-personal)

## 27. Versión ultracorta por si vas muy justo

`La demo enseña una experiencia premium para el socio y una capa operativa real para negocio. Cuando lanzamos una acción, no solo cambia la interfaz: también deja trazabilidad operativa y puede impactar incluso el forecast financiero. Hoy usamos Google Sheets como backend de demo porque permite demostrar ese valor de forma rápida, entendible y creíble.`
