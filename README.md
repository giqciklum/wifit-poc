# WiFit Gyms × Ciklum — Manual Maestro

Documento único para preparar, presentar y cerrar la reunión comercial.
Úsalo como checklist pre-reunión, como guión durante la demo y como referencia para las preguntas que vengan.

*Última revisión manual: 16 de abril de 2026.*

---

## Índice

1. [Resumen en 30 segundos](#1-resumen-en-30-segundos)
2. [Enlaces y accesos](#2-enlaces-y-accesos)
3. [Preflight — 15-20 minutos antes](#3-preflight--15-20-minutos-antes)
4. [Guión de la reunión — 25 minutos](#4-guión-de-la-reunión--25-minutos)
5. [Objeciones, mensajes según audiencia y preguntas duras](#5-objeciones-mensajes-según-audiencia-y-preguntas-duras)
6. [Si algo falla en directo](#6-si-algo-falla-en-directo)
7. [Después de la reunión](#7-después-de-la-reunión)
8. [Si piden arrancar piloto en la propia reunión](#8-si-piden-arrancar-piloto-en-la-propia-reunión)
9. [Las cinco capas del producto](#9-las-cinco-capas-del-producto)
10. [Los cuatro casos de demo](#10-los-cuatro-casos-de-demo)
11. [Finanzas: fórmulas, tabla, evidencias](#11-finanzas-fórmulas-tabla-evidencias)
12. [Google Sheets: qué enseñar y qué no](#12-google-sheets-qué-enseñar-y-qué-no)
13. [Datos reales vs sintéticos, qué cambia en vivo](#13-datos-reales-vs-sintéticos-qué-cambia-en-vivo)
14. [FAQ extendido](#14-faq-extendido)
15. [Arquitectura y endpoints](#15-arquitectura-y-endpoints)
16. [Comandos útiles y archivos clave](#16-comandos-útiles-y-archivos-clave)
17. [Fuentes públicas utilizadas](#17-fuentes-públicas-utilizadas)
18. [Versión ultracorta si vas muy justo](#18-versión-ultracorta-si-vas-muy-justo)

---

## 1. Resumen en 30 segundos

WiFit Gyms es una cadena low-cost (7 sedes → 10 en roadmap, 12.000 socios, 41,90 € de cuota) recién adquirida por Private Equity. Esta demo les enseña una **capa única** que conecta tres audiencias con un mismo dato:

- **El socio** — app WiFit IA: coach, reservas, nutrición, progresión.
- **El equipo operativo** — socios, leads, operaciones por sede.
- **La dirección** — KPIs, agenda financiera viva, Revenue at Risk.

La demo es una visión comercial, no un producto terminado. El siguiente paso que se propone es un **piloto pagado de 6-8 semanas en 1 o 2 sedes**, con rango de inversión entre 25.000 € y 45.000 €.

La frase base que vende el producto:

> *"No solo cambia la pantalla; la acción deja rastro real en la capa operativa, y modifica la previsión de caja."*

Si solo tienes una frase de refuerzo:

> *"La misma acción puede impactar experiencia, operación, automatización y forecast financiero."*

---

## 2. Enlaces y accesos

**Demo pública — modo presentación** (la que usas en reunión):
```
https://giqciklum.github.io/wifit-poc/?mode=present
```

**Demo pública — modo normal** (con botón de Reiniciar visible):
```
https://giqciklum.github.io/wifit-poc/
```

**Google Sheet — capa operativa de demo**:
```
https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/
```

**Repositorio**:
```
https://github.com/giqciklum/wifit-poc
```

**Backend (Apps Script Web App)**:
```
https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec
```

**Apps Script editor** (no mostrar en reunión, solo por si algo hay que retocar):
```
https://script.google.com/u/1/home/projects/1AYBLolx4wPBHoX80zTXwO01s2cVvmJ4Ggi0gZhVa4z1WhUm9wg-n6M8r/edit
```

---

## 3. Preflight — 15-20 minutos antes

Ejecútalo desde el mismo Mac y la misma wifi que vas a usar en la reunión. Tiempo total: 5-7 minutos si todo va bien, 15 si hay que arreglar algo.

### 3.1. Backend vivo y versión correcta

```bash
BASE="https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec"
curl -sL "$BASE?action=state" | python3 -m json.tool | head -20
```

Tiene que devolver:
- `"status": "ok"`
- `"version": "v2"` — imprescindible
- Un bloque `resumen` con `socios_total`, `socios_activos`, etc.

Si tarda mucho o da timeout, el Apps Script está frío. Llama primero al warmup y espera 20 segundos:
```bash
curl -sL "$BASE?action=warmup"
```

Si devuelve HTML en vez de JSON, los permisos del Apps Script se han cambiado — hay que ir al editor, "Implementar → Gestionar implementaciones → lápiz → Quién tiene acceso = Cualquier usuario".

### 3.2. Reset de la hoja

Para empezar limpios:
```bash
curl -sL "$BASE?action=reset"
```

Debe devolver `"status":"ok", "action":"reset", "version":"v2"`. Deja: 15 socios, 13 activos, 2 impagos (S003 y S011), 10 leads, 6 automatizaciones, agenda financiera limpia.

Después, abre la Google Sheet y verifica visualmente:
- 7 pestañas: `socios`, `pagos`, `leads`, `reservas`, `automatizaciones`, `tareas`, `agenda_financiera`.
- Fila 1 congelada y con color verde/teal.
- Fechas en formato `2026-04-12`, no `Fri May 01 2026...`.

### 3.3. Frontend

Abre Chrome en modo incógnito para no arrastrar caché:
```
https://giqciklum.github.io/wifit-poc/?mode=present
```

Verifica:
- **Badge superior derecho** dice "Backend en vivo · v2" en verde. Si tras 15 segundos sigue en "Modo demo local", la wifi está bloqueando `script.google.com` — cambia a 4G del móvil.
- **Marca de agua** abajo a la derecha: "Modo presentación · WiFit × Ciklum".
- **Botón "Reiniciar"** arriba está oculto (protege contra clics accidentales).
- **Gráficos** (Cash In, Revenue at Risk, funnel de leads) cargan con números, no con cuadrículas vacías.
- Fuentes **DM Sans** (cuerpo) y **Bebas Neue** (números grandes) se ven correctamente.

### 3.4. Simulación de prueba

Pulsa **"Abrir simulador"** y ejecuta el escenario **Activación premium**. Debe tardar 2-4 segundos. Verifica:
- El socio nuevo aparece en la lista interna.
- La Google Sheet muestra la nueva fila en `socios`, `pagos`, `automatizaciones` y `agenda_financiera`.
- El mensaje de éxito sale en menos de 5 segundos.

Al terminar: vuelve a hacer **reset** (3.2) para empezar la reunión limpios.

### 3.5. Entorno físico

- Cierra todas las pestañas del navegador **excepto las 3 que necesitas** (demo, Sheet, repo).
- Desactiva notificaciones de Slack, correo, calendario.
- Modo **"No molestar"** del Mac activado.
- Batería > 60% o cargador conectado.
- Prueba compartir pantalla con un contacto antes: audio OK, resolución OK.
- **Ten a mano** el `WiFit_Manual_Maestro_PoC.pdf` como salvavidas.

---

## 4. Guión de la reunión — 25 minutos

**Formato**: 25 minutos efectivos, 1 pantalla compartida. Tú llevas la voz. La demo acompaña, no protagoniza.

**Objetivo**: no vender tecnología — vender **un piloto pagado de 6-8 semanas** con una cola de 12-18 meses.

**Clave de lenguaje**: no menciones "PoC" ni "prueba de concepto". Es una **demo**. El siguiente paso es **piloto**.

### 4.1. Apertura — 2 min

> *"Gracias por el tiempo. Antes de tocar nada os cuento en tres frases lo que vamos a ver.*
>
> *Lo que traemos no compite ni con Harbiz ni con SIGEGym. Somos la capa conectada que une experiencia del socio, operación del día a día y agenda financiera del CFO, integrable con lo que ya tengáis.*
>
> *En los próximos 20 minutos os enseñamos una demo en vivo montada específicamente para WiFit, con vuestras sedes y estructura de cuotas, y cerramos con qué necesitaríamos para arrancar un piloto real."*

### 4.2. Bloque 1 — La visión conectada · 3 min

Pestaña: landing. No hagas clic todavía.

> *"Lo que veis es una única capa con tres audiencias:*
>
> 1. *El socio — lo que ve Manuel cuando abre la app WiFit IA: plan de entrenamiento, coach virtual, reservas, nutrición.*
> 2. *El equipo de WiFit — gestión de socios, leads, operación por sede, finanzas.*
> 3. *La dirección — KPIs, expansión, agenda financiera viva.*
>
> *Y el truco es que los tres están alimentados por el mismo dato. No hay que duplicar información entre el CRM, la herramienta del personal trainer y el Excel del CFO."*

Apunta al badge **"Backend en vivo · v2"**:

> *"Este indicador os lo señalo solo una vez: significa que lo que vais a ver no son pantallas de PowerPoint. Es datos reales contra una hoja conectada que podemos compartiros al final."*

### 4.3. Bloque 2 — Experiencia del socio · 4 min

Clic en **"Experiencia del socio"**. Recorrido breve:

1. **Phone mock** (Manuel, socio premium).
   > *"Manuel paga 41,90 €. Esta es la app que usa. Plan semanal generado por IA, coach con historial de lesiones, reservas de clase, progresión visible."*

2. **Journey proof**.
   > *"Cada pantalla tiene trazabilidad: de dónde sale el dato, qué automatización lo actualiza y cuándo. No es una maqueta."*

**Lo que NO dices**: que es Harbiz pero mejor, que aquí hay IA generativa, que esto funciona con cualquier LLM.

### 4.4. Bloque 3 — Centro de gestión · 6 min

Vuelve a inicio, clic en **"Centro de gestión"**. Orden de pestañas:

1. **Socios** — 15 socios, 7 sedes, mix de estados.
   > *"Esto es lo que ve el equipo de sede. El estado (Activo / Impago / Pendiente) se sincroniza con pagos."*

2. **Leads** — 10 leads con scoring.
   > *"Instagram, Google Ads, Facebook, referidos. Score automático, próxima acción sugerida. Esto sustituye el Excel que usáis hoy, y añade scoring."*

3. **Operaciones** — tareas abiertas por sede.
   > *"Cada alerta lleva sede, responsable y prioridad. Os interconectáis con la realidad del centro, no solo con lo digital."*

4. **Finanzas** — **la pestaña clave.**
   > *"Esto normalmente no existe en un gimnasio low-cost. Agenda financiera viva: Cash In 30 días, Cash Out, Net Forecast, y la pieza fuerte — Revenue at Risk. Impagos detectados, cobros en riesgo, y cuándo se recuperan si se ejecuta la automatización."*

5. **Mercado** — comparativa con VivaGym / Basic Fit / competidores.
   > *"Contexto competitivo. Dónde está WiFit y dónde quiere llegar."*

6. **Ruta** — roadmap público de 7 → 10 sedes.
   > *"Expansión visualizada con indicadores por sede. Útil para la conversación con el fondo."*

### 4.5. Bloque 4 — El momento mágico · 4 min

Vuelve a la runtime bar. Clic en **"Abrir simulador"**. Escenario: **Activación premium**.

Mientras se ejecuta (5-8 segundos):
> *"Acabamos de simular que Manuel ha pagado su cuota mensual. Sin tocar nada más, os enseño qué pasa en la hoja real de Google en otra pestaña."*

Cambia a la Google Sheet y enseña, en este orden:

1. `socios` — nuevo socio añadido al final.
2. `pagos` — nuevo cobro confirmado.
3. `automatizaciones` — evento "Pago confirmado" con resultado.
4. `agenda_financiera` — nueva fila de ingreso esperado a +30 días.

> *"En 5 segundos: 4 sistemas actualizados simultáneamente. Esto es lo que os va a doler cuando paséis de 7 a 10 sedes: duplicar datos en 4 herramientas se vuelve inviable."*

**Segundo escenario opcional si hay tiempo**: **Detección de impago**.

> *"Caso inverso. Carlos lleva 30 días sin pagar. El sistema lo detecta, envía aviso, crea tarea para el gestor de sede, y mueve el ingreso a riesgo en la agenda financiera. Cuando se regulariza, pasa a confirmado y se añade el siguiente ciclo como esperado. El CFO ve en tiempo real el impacto de cada acción operativa."*

### 4.6. Bloque 5 — Qué NO es esto · 2 min

Párate. Baja el ritmo.

> *"Antes de entrar en números quiero dejar claro qué no estoy vendiendo:*
>
> - *No os vendo una sustitución de SIGEGym. Si ya lo estáis mirando, seguid. SIGEGym hace gestión de facilities muy bien. Nosotros nos conectamos.*
> - *No os vendo un coach de IA. Si queréis Harbiz, adelante. Es buen producto. Se integra aquí dentro.*
> - *No os vendo un CRM. Tenéis o tendréis uno. Nos conectamos.*
>
> *Lo que os vendo es la capa conectiva que hace que todas esas piezas hablen entre ellas, y el cuadro de mando de dirección, operación y finanzas que ahora mismo está en tres hojas de cálculo distintas."*

### 4.7. Bloque 6 — Cierre y siguiente paso · 4 min

> *"Para pasar de esto que os hemos enseñado a algo real para WiFit, os proponemos un piloto de 6-8 semanas en 1 o 2 sedes:*
>
> - *Semana 1-2: conectamos vuestros datos reales (sede piloto).*
> - *Semana 3-5: activamos los 3 flujos clave — activación, recuperación de impago, scoring de leads — y medimos.*
> - *Semana 6-8: cuadro de mando para dirección, con KPIs reales.*
>
> *Rango de inversión: orden de magnitud de 25.000 € a 45.000 € según alcance, porque el piloto real lleva ingeniería de integración contra vuestros sistemas actuales. Propuesta formal la semana siguiente si hay interés.*
>
> *Lo que necesitamos para arrancar:*
> 1. *Punto de contacto técnico por vuestra parte (pagos, CRM actual).*
> 2. *Elegir sede piloto con criterio conjunto: sponsor interno claro, dato limpio y dolor operativo recuperable. Retiro es una buena candidata, pero no la única por defecto.*
> 3. *KPI de éxito del piloto firmado antes de empezar."*

Si preguntan "¿y vosotros quiénes sois?":
> *"Ciklum: 25 años, 4.000 ingenieros. Proyectos similares de data & AI en retail y fitness en UK e Iberia. FoshTech es el caso de referencia más cercano — os lo pasamos con la propuesta."*

### 4.8. Tiempos orientativos

| Bloque | Minutos | Acumulado |
|--------|---------|-----------|
| Apertura | 2 | 2 |
| Visión conectada | 3 | 5 |
| Experiencia socio | 4 | 9 |
| Centro gestión | 6 | 15 |
| Momento mágico | 4 | 19 |
| Qué no es esto | 2 | 21 |
| Cierre y siguiente paso | 4 | 25 |

Si te pasas: corta primero **Mercado** y **Ruta** del Bloque 3. Si te sobran 5 minutos: añade el escenario de **Detección de impago** en el Bloque 4.

---

## 5. Objeciones, mensajes según audiencia y preguntas duras

### 5.1. Objeciones más frecuentes

**"¿Esto no lo podemos hacer con Zapier o Make?"**
> *"Los flujos simples, sí. La agenda financiera viva, el scoring consistente y la capa de dirección, no. Zapier es fontanería; esto es arquitectura."*

**"Ya tenemos un CRM y automatizaciones por 200 €/mes"**
> *"Perfecto. Y esa es la razón por la que no os vendemos un CRM. Lo que no tenéis por 200 € es la capa que une CRM, cobros, tareas operativas y agenda financiera en una lectura ejecutiva consolidada. Si seguís con vuestro CRM actual, nos lo traemos al piloto y lo conectamos en la semana 1."*

**"¿Por qué no usamos directamente SIGEGym?"**
> *"Podéis. SIGEGym es excelente para facilities. Esto es complementario — podemos integrarnos con SIGEGym si lo adoptáis. Lo que nosotros hacemos es el lado experiencia + IA + dirección financiera, que SIGEGym no resuelve."*

**"¿Esto es como Harbiz?"**
> *"Harbiz es un coach virtual excelente, enfocado al coaching. Nosotros no competimos con eso. Si queréis Harbiz lo integramos aquí dentro. Lo que traemos es la capa que conecta a Harbiz con el CRM de socios, operación y cash forecast. Harbiz no tiene eso."*

**"Seguridad, GDPR, dónde están los datos"**
> *"La demo que veis va contra Google Sheets porque es una demo. El piloto real usa vuestra infraestructura o cloud europeo regulado. GDPR compliance se audita en semana 1 del piloto."*

**"¿Plazos?"**
> *"Piloto 6-8 semanas desde firma. Despliegue al mapa actual de 7 sedes y expansión hacia 10, 4-6 meses más. Lo relevante es que el piloto empieza a dar valor desde la semana 3, no al final."*

**"¿Y si el PE no lo aprueba?"**
> *"Preparamos un one-pager orientado al fondo, centrado en Revenue at Risk y eficiencia operativa por sede. Son las dos métricas que mueven el comité."*

**"¿Por qué construirlo con vosotros y no internamente?"**
> *"Una herramienta estándar cubre una necesidad puntual. Una capa propia conectada a socio, captación, cobros y operación puede convertirse en un activo estratégico del grupo. Construirlo internamente os llevaría 9-12 meses y un equipo que hoy no tenéis. Nosotros traemos el blueprint ya probado."*

**"¿Podemos ver el Apps Script?"**
> *"Eso es infraestructura de demo. En el piloto real lo sustituimos por vuestro entorno. Os pasamos acceso de solo lectura a la Google Sheet después de la reunión si os interesa."*

### 5.2. Mensajes según la persona que te preguntas

**Si habla negocio general**:
> *"Estamos enseñando una experiencia mejor para el socio y una operación más visible para el negocio, conectadas entre sí."*

**Si habla operaciones**:
> *"La gracia está en que cobros, incidencias, tareas y seguimiento dejan rastro y reducen trabajo manual."*

**Si habla producto**:
> *"Aquí hay una base clara para construir una experiencia propia y diferencial de WiFit, no una simple personalización de una herramienta estándar."*

**Si habla CFO o dirección**:
> *"La operación ya no se queda en backend invisible: aparece traducida en caja prevista, ingresos en riesgo y visibilidad de semanas tensas."*

**Si preguntan por futuro**:
> *"Hoy usamos una capa operativa muy entendible para demostrar valor rápido. Si esto avanza, la misma lógica se conecta a Stripe, CRM, ERP o stack cloud corporativo."*

### 5.3. Si sale ciberseguridad en la reunión

> *"Es una conversación muy relevante, pero yo la trataría como siguiente capa del proyecto: gobierno del dato, permisos, auditoría y resiliencia operativa."*

No abras tú el tema en la demo principal. Si sale, respóndelo así y sigue.

---

## 6. Si algo falla en directo

Frases listas para cada problema:

**Backend cae a "Modo demo local"**
> *"Hemos tenido un parpadeo en la red del backend de demo — es un incidental, la demo sigue funcionando contra datos locales, os muestro lo mismo y luego lo vemos con backend cuando la red vuelva."*

**Demo tarda mucho**
> *"Primera petición del día — la infraestructura de demo está en serverless, se calienta y de ahí en adelante va fluido."* *(es cierto: el cold start del Apps Script es real.)*

**Chart.js no carga / gráficos vacíos**
Recarga. Chart.js está vendorizado, si no carga es porque la wifi del cliente bloquea mucho más que eso.

**El simulador se queda "procesando"**
Espera 10 segundos máximo, luego: *"el backend estaba frío, ya se ha calentado, ahora va fluido"* y vuelve a pulsar.

**"¿Está todo en Google Sheets?"**
> *"La capa operativa de la demo, sí — es una decisión deliberada para poder enseñaros datos reales que podéis tocar. La arquitectura del piloto se define con vuestro CTO en la semana 1."*

**Todo falla a la vez**
Cambia a `WiFit_Manual_Maestro_PoC.pdf` en pantalla compartida. Tienes material para sostener la conversación sin demo.

### Orden de fallback si vas justo de tiempo

1. Portada
2. Experiencia del Socio
3. Centro de Gestión (solo Socios y Finanzas)
4. Abrir simulador → Activación premium
5. Google Sheet en `automatizaciones`

---

## 7. Después de la reunión

### 7.1. Qué hacer en las 2 horas siguientes

Email de follow-up, mientras están calientes:
- Enlace a la demo.
- PDF del manual adjunto.
- Resumen del siguiente paso + fecha objetivo para propuesta formal.
- One-pager del fondo si se pidió.

Limpieza:
- **No envíes la Google Sheet como está** — tiene datos con nombres ficticios que pueden confundir sin contexto. Si quieren verla, haz copia en solo-lectura etiquetada como "Demo sample".
- **Reset definitivo** de la hoja (`?action=reset`) para no dejar filas de prueba colgando.

### 7.2. Qué NO hacer

- No prometas features adicionales sobre la marcha.
- No publiques la demo en LinkedIn antes de tener el piloto firmado.
- No compartas acceso al Apps Script editor.
- No pulses "Reiniciar" durante la reunión. En modo presentación está oculto, pero por si acaso.
- No entres al editor de Apps Script delante del cliente.
- No digas "está hecho en Google Sheets" — di "capa operativa de demo".
- No te pelees con Harbiz ni SIGEGym — son complementarios, no sustitutos.
- No abras Finanzas si el perfil del cliente no es financiero.

---

## 8. Si piden arrancar piloto en la propia reunión

- **No firmes nada verbal.** Di: *"Perfecto — mañana os mandamos propuesta formal con alcance, hitos, rango y condiciones, y la cerramos esta semana."*
- **Pide**: punto de contacto técnico (email), criterio de sede piloto (sponsor + dato limpio + dolor operativo), fecha objetivo de kickoff.
- **Cierra**: *"¿Os va que enviemos propuesta formal el [día X] y cerramos llamada de 30 min el [día Y] para resolver dudas?"*

---

## 9. Las cinco capas del producto

### 9.1. Capa socio

Qué transmitir: experiencia más premium que una app básica de gimnasio, personalización, seguimiento, recomendación, percepción de producto propio.

Mensaje útil:
> *"WiFit IA convierte una cuota accesible en una experiencia con más valor percibido y más continuidad."*

### 9.2. Capa gestor

Qué transmitir: visión operativa end-to-end, control de socios, captación, tareas, pagos, lectura ejecutiva.

Mensaje útil:
> *"La operación no va por un lado y el socio por otro. Todo forma parte del mismo sistema."*

### 9.3. Capa automatización

Qué transmitir: menos trabajo manual, acciones que dejan evidencia, secuencias visibles, respuesta rápida ante cobro, lead o incidencia.

Mensaje útil:
> *"No solo mostramos el evento; mostramos la consecuencia operativa del evento."*

### 9.4. Capa IA

Qué transmitir: valor real para el socio, posible monetización premium, diferenciación frente a soluciones genéricas.

Mensaje útil:
> *"La IA aquí funciona como una capa de producto propia, no como un añadido cosmético."*

### 9.5. Capa financiera

Qué transmitir: visibilidad de caja futura, ingresos en riesgo, efecto de cobros e impagos sobre el forecast, lectura útil para dirección y CFO.

Mensaje útil:
> *"No estamos enseñando solo facturación. Estamos enseñando cómo la operación modifica la previsión de caja."*

---

## 10. Los cuatro casos de demo

### 10.1. Activación premium

1. Abre simulador.
2. Lanza "Activación premium".
3. Enseña cronología y evidencias.
4. Abre Google Sheet: `automatizaciones`, `socios`, `pagos`, `agenda_financiera`.

Demuestra: cobro confirmado, activación de servicio premium, trazabilidad operativa, impacto en experiencia y negocio, ingreso futuro anotado en caja.

Frase útil:
> *"Un cobro confirmado no solo activa una vista premium; también deja alta, pago, automatización real y forecast ajustado."*

### 10.2. Lead de prueba

1. Lanza "Lead de prueba".
2. Enseña priorización y seguimiento.
3. Abre `automatizaciones` y `leads`.

Demuestra: captación conectada, siguiente mejor acción, lectura comercial más útil que una fila.

Frase útil:
> *"El lead deja de ser una fila muerta y pasa a una secuencia con contexto y próxima acción."*

### 10.3. Impago detectado y regularización

1. Lanza "Detección de impago".
2. Enseña eventos, retención y evidencias.
3. Abre `automatizaciones` y `tareas`.
4. Muestra `agenda_financiera`: fila movida a `riesgo`.
5. Lanza regularización (`?action=regularize&socio_id=S003`).
6. Muestra: fila vuelve a `confirmado` y se añade el siguiente ciclo como `esperado`.

Demuestra: detección de incidencia, secuencia de seguimiento, impacto operativo inmediato y efecto sobre forecast, con regularización disponible cuando quieras cerrar el caso.

Frase útil:
> *"El impago deja de descubrirse tarde y pasa a una secuencia visible de detección y seguimiento, con efecto inmediato en la caja prevista."*

### 10.4. Perfil CFO / dirección financiera

1. Abre la pestaña Finanzas.
2. Enseña los 4 KPIs.
3. Recorre Balance semanal proyectado.
4. Recorre Agenda financiera próxima.
5. Si vienes de un trigger, señala la evidencia financiera generada.

Demuestra: lectura de tesorería, ingresos en riesgo, semanas tensas, impacto real de cobros e impagos.

Frase útil:
> *"La misma capa que activa al socio y recupera impagos también anticipa caja y hace visible el forecast."*

---

## 11. Finanzas: fórmulas, tabla, evidencias

La pestaña Finanzas está conectada al backend real y lee `snapshot.finanzas`.

### 11.1. Fórmulas de los KPIs

| KPI | Fórmula |
|-----|---------|
| Cash In 30d | suma de `importe` donde `tipo = ingreso` y `estado != riesgo` |
| Cash Out 30d | suma de `importe` donde `tipo = gasto` |
| Revenue at Risk | suma de `importe` donde `tipo = ingreso` y `estado = riesgo` |
| Net Cash Forecast | `Cash In − Cash Out` |

### 11.2. Columnas de la tabla de agenda

`fecha`, `tipo`, `categoria`, `sede`, `importe`, `estado`.

Estados posibles:
- `esperado` — cobro previsto, aún no cobrado.
- `confirmado` — cobro recibido.
- `riesgo` — cobro no recibido tras fecha esperada.

### 11.3. Evidencias financieras que ya se generan en la demo

Cuando lanzas automatizaciones, el stream puede mostrar:
- `Previsión de caja actualizada`
- `Ingreso movido a riesgo en agenda financiera`
- `Forecast de caja ajustado`

Estas evidencias son importantes porque conectan: pago o impago → operación → forecast financiero.

### 11.4. Qué decir al abrirla

> *"Esto ya no es un bloque financiero decorativo. Está conectado al backend y se recalcula según los eventos que estamos moviendo."*

---

## 12. Google Sheets: qué enseñar y qué no

No muestres toda la hoja. Orden recomendado:

1. `automatizaciones` (siempre la primera).
2. La pestaña específica del caso.

Pestañas más útiles:
- `automatizaciones` — el cartón universal.
- `socios` — activación.
- `pagos` — activación, impago.
- `leads` — caso comercial.
- `tareas` — impago.
- `agenda_financiera` — CFO.

Regla:
> *"La hoja no vende. La hoja demuestra."*

Qué NO enseñar:
- Apps Script editor.
- Endpoints o URLs crudas.
- JSON.
- Edición manual de filas en directo.

---

## 13. Datos reales vs sintéticos, qué cambia en vivo

La demo mezcla:
- **Referencias públicas reales**: marca, pricing público, sedes visibles, referencias de mercado.
- **Datos sintéticos**: socios, leads, scoring, forecast, automatizaciones, tareas, pagos, agenda financiera.

Cómo explicarlo:
> *"Usamos referencias reales para que el caso sea creíble y datos sintéticos para demostrar flujos de negocio sin usar datos del cliente."*

### Qué cambia en vivo al ejecutar un trigger

- Estado del backend (badge superior).
- KPIs conectados.
- Snapshot de `socios`, `leads`, `logs`, `finanzas`.
- Filas de la Google Sheet (`socios`, `pagos`, `automatizaciones`, `tareas`, `agenda_financiera`).

### Qué NO es objetivo enseñar

- Apps Script por dentro.
- Endpoints.
- JSON crudo.
- Edición manual de filas en reunión.

Frase correcta:
> *"La demo ya tiene lectura y escritura real sobre una capa operativa viva. No hace falta entrar en la implementación para entender el valor."*

---

## 14. FAQ extendido

**¿Qué tecnología hay detrás?**

Versión corta:
> *"Frontend estático, automatización ligera y hoja operativa viva como backend de demo."*

Versión completa:
> *"Frontend publicado en GitHub Pages. Llama a un Apps Script que escribe en Google Sheets. El frontend lee estado refrescando contra ese backend."*

**¿Es Google Sheets el backend final?**
No.
> *"Es una capa operativa de demo para demostrar trazabilidad y automatización real de forma muy entendible."*

**¿La IA es solo un chat?**
No. La IA afecta experiencia del socio, personalización, continuidad y monetización premium.

**¿La parte financiera es real o decorativa?**
Hoy ya está conectada al backend real de demo.
> *"La lectura financiera no está separada del resto. Sale de eventos operativos y por eso sirve para dirección."*

**¿Qué pasa con multi-sede?**
La demo ya modela las 7 sedes reales de WiFit como dimensión transversal. Socios, leads, tareas y agenda financiera se pueden filtrar por sede. En el piloto, cada sede tiene su slice y dirección ve el consolidado.

**¿Cuánto tardáis en replicar esto contra nuestros datos?**
2 semanas para conectar sede piloto, 5 semanas para tener los 3 flujos clave medidos, 8 semanas para cuadro de mando de dirección.

---

## 15. Arquitectura y endpoints

```
Frontend estático (GitHub Pages)
        ↓
Apps Script Web App (Google)
        ↓
Google Sheet (capa operativa de demo)
```

Endpoints principales:

| Endpoint | Qué hace |
|----------|----------|
| `?action=state` | estado resumido |
| `?action=state&detail=full` | snapshot completo (`socios`, `leads`, `logs`, `finanzas`) |
| `?action=warmup` | fire-and-forget para calentar el cold start |
| `?action=reset` | restaura dataset inicial |
| `?action=activation` | simula activación premium |
| `?action=lead` | crea lead de prueba |
| `?action=retention` | detecta impago, crea seguimiento y mueve el ingreso a riesgo |
| `?action=regularize&socio_id=...` | regulariza un impago |

Polling del frontend: cada 12 segundos.

Fallback: si el backend falla, el frontend sigue funcionando contra dataset local precargado; el badge cambia a "Modo demo local".

---

## 16. Comandos útiles y archivos clave

### 16.1. Curl útiles

```bash
BASE="https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec"

# Calentar el Apps Script (2-3 min antes de empezar)
curl -sL "$BASE?action=warmup"

# Estado rápido
curl -sL "$BASE?action=state" | python3 -m json.tool | head -15

# Estado con snapshot completo
curl -sL "$BASE?action=state&detail=full" > /tmp/state.json \
  && python3 -c "import json; d=json.load(open('/tmp/state.json')); print('v:',d.get('version'),'socios:',len(d.get('snapshot',{}).get('socios',[])),'finanzas:',len(d.get('snapshot',{}).get('finanzas',[])))"

# Reset para empezar limpios
curl -sL "$BASE?action=reset"

# Regularizar un impago concreto
curl -sL "$BASE?action=regularize&socio_id=S003"
```

### 16.2. Archivos clave del repo

- `README.md` — este manual.
- `index.html` — UI completa (landing, experiencia socio, centro de gestión).
- `assets/demo-runtime.js` — runtime, polling, simulador, badge.
- `assets/chart.umd.min.js` — Chart.js vendorizado (resiliente a CDN bloqueado).
- `apps-script/Code.gs` — backend Apps Script completo.
- `sw.js` — service worker (network-first app shell, cache-first assets, nunca cachea backend).
- `manifest.webmanifest` — PWA.
- `WiFit_Manual_Maestro_PoC.pdf` — versión PDF de este manual, para adjuntar en follow-up.

---

## 17. Fuentes públicas utilizadas

- [WiFit Gyms — web corporativa](https://wifitgyms.com/)
- [WiFit Retiro — ficha de sede](https://wifitgyms.com/gimnasios/madrid/wifit-retiro/)
- [Proceso de alta — cuotas WiFit](https://wifitgyms.provis.es/Public/ProcesoAlta/PasoSeleccionCuota.aspx)
- [Harbiz — coach virtual](https://www.harbiz.io/)
- [Harbiz — app de entrenamiento personal](https://www.harbiz.io/app-entrenamiento-personal)

---

## 18. Versión ultracorta si vas muy justo

> *"La demo enseña una experiencia premium para el socio y una capa operativa real para negocio. Cuando lanzamos una acción, no solo cambia la interfaz: también deja trazabilidad operativa y puede impactar incluso el forecast financiero. Hoy usamos Google Sheets como backend de demo porque permite demostrar ese valor de forma rápida, entendible y creíble. El siguiente paso natural es un piloto pagado de 6-8 semanas en 1 o 2 sedes para pasar de demo a algo real sobre vuestros sistemas."*
