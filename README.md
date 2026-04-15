# WiFit Gyms x Ciklum - Guía maestra del PoC

Esta guía está pensada para una persona que tiene que enseñar la demo en reunión sin perder tiempo pensando qué abrir, qué decir o qué hacer si algo falla.

## Enlaces clave

Demo pública  
https://giqciklum.github.io/wifit-poc/

Repositorio  
https://github.com/giqciklum/wifit-poc

Google Sheet de demo  
https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/

Web App de Apps Script  
https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec

Código fuente del Apps Script guardado en el repo  
[apps-script/Code.gs](/Users/computerxperts/Documents/POC/apps-script/Code.gs)

## 1. Resumen en 20 segundos

La demo enseña dos cosas a la vez:

- una `experiencia de socio` tipo producto
- una `capa de gestión y automatización` conectada a una hoja operativa real

El flujo real hoy es este:

`PoC web -> Apps Script -> Google Sheet -> refresco live del frontend`

Qué significa eso:

- `Sí` la demo puede escribir en Google Sheets
- `Sí` la demo puede leer en vivo el backend y refrescar `socios`, `leads`, `logs` y KPIs
- `No` hace falta tocar código ni Apps Script en reunión
- `No` hace falta editar filas a mano para que “parezca” que funciona

## 2. Qué hace exactamente el PoC hoy

### Lo que sí hace

- muestra un frontend presentable para cliente
- conecta con un backend real de demo
- ejecuta triggers de negocio
- deja trazabilidad en Google Sheets
- refresca estado conectado en vivo
- soporta fallback local si el backend falla

### Lo que NO hace

- no es todavía un producto en producción
- no usa datos reales del cliente
- no sustituye a un CRM/ERP real
- no depende de Google Sheets como arquitectura final

Google Sheets aquí cumple un papel muy concreto:

`demostrar conexión real y automatización real con un backend sencillo y entendible`

## 3. Qué abrir antes de la reunión

Abre estas 3 pestañas y déjalas listas:

1. `Demo`
   https://giqciklum.github.io/wifit-poc/

2. `Google Sheet`
   https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/

3. `Repo`
   https://github.com/giqciklum/wifit-poc

Orden recomendado de uso:

- durante casi toda la reunión: `demo`
- como prueba de conexión: `Google Sheet`
- solo si alguien pide detalle técnico: `repo`

## 4. Chuleta rápida de 30 segundos

Si te bloqueas, haz exactamente esto:

1. abre la demo
2. enseña primero la experiencia, no la hoja
3. pulsa `Abrir simulador`
4. lanza `Activación premium`
5. enseña el cambio en pantalla
6. cambia a Google Sheet
7. abre `automatizaciones`
8. luego enseña `socios` y `pagos`
9. si aparece un perfil financiero, vuelve a la demo y abre `Finanzas`
10. enseña `Agenda de caja a 30 días`

Frase clave:

`No solo cambia la pantalla; la acción deja rastro real en la capa operativa.`

Segunda frase clave:

`Hoy usamos Google Sheets como backend de demo porque se parece mucho más a la realidad operativa actual del cliente que montar una arquitectura enterprise solo para enseñar el concepto.`

## 5. Guion recomendado de 5 minutos

## Paso 1. Arranca por valor

Abre:
https://giqciklum.github.io/wifit-poc/

Di esto:

`No estamos enseñando un dashboard genérico. Estamos enseñando dos experiencias conectadas: una para el socio y otra para gestión.`

## Paso 2. Enseña primero la parte bonita

Recorre:

- `Experiencia del Socio`
- `Centro de Gestión`

No abras la hoja todavía.

## Paso 3. Abre el simulador

Pulsa:

`Abrir simulador`

## Paso 4. Lanza un caso

Orden recomendado:

1. `Activación premium`
2. `Lead de prueba`
3. `Recuperación de impago`

## Paso 5. Enseña el impacto en pantalla

Muestra:

- cambio de estado
- cronología de eventos
- artefactos generados
- sincronía entre socio y gestión

## Paso 6. Solo después abre la hoja

Di esto:

`Y ahora os enseño que esto no es solo una pantalla bonita: la acción ha quedado registrada en una capa operativa real.`

## Paso 7. Si entra conversación financiera, no improvises

Vuelve a la pestaña `Finanzas` del front y enseña solo esto:

- `Cobros esperados 30 días`
- `Salidas previstas 30 días`
- `Net cash proyectado`
- `Revenue en riesgo`
- `Agenda financiera próxima`

Si vienes justo de lanzar `Activación premium` o `Recuperación de impago`, señala además:

- `Previsión de caja actualizada`
- `Ingreso movido a riesgo` cuando aplique
- `Forecast de caja ajustado` dentro de la cronología

Frase útil:

`No estamos enseñando solo facturación; estamos enseñando visibilidad de caja futura, tensión de tesorería y efecto directo de cobros e impagos sobre el forecast operativo.`

## 6. Qué enseñar en Google Sheets

La hoja tiene varias pestañas, pero no necesitas enseñarlas todas.

Las importantes son:

- `socios`
- `pagos`
- `leads`
- `automatizaciones`
- `tareas`

Regla de oro:

Si te pierdes, abre siempre `automatizaciones`.

Es la pestaña más segura para demostrar que el trigger dejó rastro real.

## 7. Qué pestaña enseñar según el caso

### Caso 1. Activación premium

En la demo:

1. `Abrir simulador`
2. `Activación premium`

En la hoja:

1. `automatizaciones`
2. `socios`
3. `pagos`

Mensaje útil:

`Un cobro confirmado no solo activa una vista premium; también deja alta, pago y trazabilidad operativa.`

### Caso 2. Lead de prueba

En la demo:

1. `Lead de prueba`

En la hoja:

1. `automatizaciones`
2. `leads`

Mensaje útil:

`El lead deja de ser una fila muerta. Se registra, se prioriza y se prepara una siguiente mejor acción.`

### Caso 3. Recuperación de impago

En la demo:

1. `Recuperación de impago`

En la hoja:

1. `automatizaciones`
2. `tareas`

Mensaje útil:

`El impago deja de descubrirse tarde y pasa a una secuencia visible de recuperación.`

### Caso 4. Perfil CFO / caja

En la demo:

1. abre `Finanzas`
2. enseña `Agenda de caja a 30 días`
3. recorre `Balance semanal proyectado`
4. termina en `Agenda financiera próxima`

Mensaje útil:

`La misma capa que activa al socio y gestiona impagos también permite anticipar caja, ver semanas tensas y priorizar recuperación antes de que el problema llegue al cierre.`

## 8. Qué cambia en vivo y qué no

Esto es importante decirlo bien.

### Sí cambia en vivo

- badge de backend
- KPIs conectados
- snapshot de `socios`
- snapshot de `leads`
- snapshot de `logs` / `automatizaciones`

### No es el objetivo principal de esta demo

- enseñar todas las pestañas de la hoja como si fueran producto
- vender Google Sheets como arquitectura final
- entrar en detalles técnicos de Apps Script

La forma correcta de explicarlo:

`El PoC ya tiene lectura y escritura real sobre una capa operativa viva. Google Sheets es el backend de demostración, no la arquitectura final.`

## 9. Cómo saber si el backend está vivo

En la parte superior de la demo verás uno de estos estados:

- `Backend en vivo`
- `Modo demo local`
- `Conectando backend`

### Si sale `Backend en vivo`

Perfecto.

Puedes decir:

`La página está conectada al backend y está refrescando estado operativo real.`

### Si sale `Modo demo local`

La demo no se rompe.

Haz esto:

1. refresca la página
2. espera unos segundos
3. comprueba si cambia

Si no cambia, sigue igualmente con la demo y di:

`La capa visual y la lógica del journey siguen funcionando. La conexión a la hoja la usamos para demostrar trazabilidad operativa, pero no condiciona la historia principal.`

## 10. Qué NO hacer en reunión

No hagas esto:

- no empieces por la hoja
- no abras Apps Script
- no expliques JSON ni endpoints
- no edites filas a mano “para demostrar”
- no vendas Google Sheets como solución final

Idea importante:

`La hoja no vende. La hoja demuestra.`

## 11. Qué decir si preguntan por la tecnología

Versión corta:

`Frontend estático, automatización ligera y hoja operativa viva como backend de demo.`

Versión un poco más completa:

`La demo está publicada en GitHub Pages. Cuando activamos una acción, la web llama a un Apps Script que escribe en una Google Sheet de demo y luego refresca el estado conectado leyendo ese backend.`

## 12. Qué decir si preguntan por Harbiz o por build vs buy

Mensaje recomendado:

`Una herramienta estándar puede cubrir una necesidad puntual. Una capa propia conectada a captación, cobros, operación y experiencia puede convertirse en un activo estratégico del grupo.`

Otra frase útil:

`Aquí no estamos enseñando solo un entrenador virtual; estamos enseñando una capa de experiencia y operación que WiFit puede controlar y evolucionar.`

## 13. Qué decir si preguntan por la visión futura

Puedes usar esto:

`Hoy hemos usado una hoja operativa realista para demostrar valor rápido. Si el proyecto avanzara, la misma lógica podría conectarse a Stripe, CRM, ERP, base de datos corporativa o stack cloud del grupo.`

## 14. Si necesitas una versión ultracorta

Si solo tienes 60 segundos, usa esto:

`La demo enseña dos journeys conectados: socio y gestión. Cuando lanzamos una acción, no solo cambia la interfaz; también deja rastro real en una capa operativa viva. Hoy esa capa es Google Sheets porque se parece a la realidad actual y nos permite demostrar automatización real sin sobrediseñar el PoC.`

## 15. Checklist previo a cliente

Antes de la reunión comprueba:

- que la demo abre
- que el badge muestra `Backend en vivo`
- que `Abrir simulador` funciona
- que `Activación premium` deja un evento `Backend confirmado`
- que la hoja está accesible
- que no hay filas raras de pruebas técnicas que quieras ocultar

## 16. Limpieza de demo si has hecho pruebas

Si has lanzado muchos triggers de prueba, recuerda que la hoja acumula filas nuevas.

Opciones:

- enseñar la demo tal cual, si no molesta
- limpiar manualmente las filas de prueba
- o reejecutar `setupSheet()` desde Apps Script para dejar la base fresca

## 17. Arquitectura real del PoC

La arquitectura actual es:

`Frontend publicado -> Apps Script Web App -> Google Sheet`

Hoy el backend soporta:

- `?action=state`
- `?action=state&detail=full`
- `?action=activation`
- `?action=lead`
- `?action=retention`

El código fuente de referencia del backend está ya guardado en:

[apps-script/Code.gs](/Users/computerxperts/Documents/POC/apps-script/Code.gs)

## 18. Qué contiene el snapshot full

El `detail=full` devuelve:

- `snapshot.socios`
- `snapshot.leads`
- `snapshot.logs`

Eso permite al frontend refrescar en vivo:

- tabla de socios
- pipeline de leads
- log de automatizaciones

## 19. Datos reales vs sintéticos

La demo mezcla:

- `referencias públicas reales`
  marca, sedes visibles, servicios y pricing público de WiFit

- `datos sintéticos`
  socios, leads, scoring, forecasting, tareas, automatizaciones, cobros y outputs

Esto es intencional y correcto para un PoC comercial.

## 20. Fuentes públicas usadas como base

- https://wifitgyms.com/
- https://wifitgyms.com/gimnasios/madrid/wifit-retiro/
- https://wifitgyms.provis.es/Public/ProcesoAlta/PasoSeleccionCuota.aspx
- https://www.harbiz.io/
- https://www.harbiz.io/app-entrenamiento-personal
