# Guión de reunión · WiFit Gyms × Ciklum

**Formato**: 25 minutos efectivos, 1 pantalla compartida.  
**Tú llevas la voz.** La demo es el acompañamiento, no el protagonista.  
**Objetivo**: no vender tecnología — vender **un piloto pagado de 6-8 semanas** con una cola de 12-18 meses.

---

## Antes de empezar

Abre en pestañas, en este orden, y déjalas en la primera de la lista:

1. Demo pública en modo presentación: `https://giqciklum.github.io/wifit-poc/?mode=present`
2. Google Sheet (pestaña `socios`): `https://docs.google.com/spreadsheets/d/1ew8qaFc1d0G7EjeR1xJa-llsb1o9dC2BYCdDBKcR8ek/`
3. Apps Script editor (por si alguien pregunta, no mostrar): `https://script.google.com/u/1/home/projects/1AYBLolx4wPBHoX80zTXwO01s2cVvmJ4Ggi0gZhVa4z1WhUm9wg-n6M8r/edit`
4. Manual maestro PDF como salvavidas: `WiFit_Manual_Maestro_PoC.pdf`

Badge arriba debe decir **"Backend en vivo · v2"**. Si dice "Modo demo local", la demo funciona igual pero no podrás mostrar la sincronización con Google Sheets. Ver `PREFLIGHT_CHECKLIST.md` para resolver.

---

## Apertura · 2 min

> "Gracias por el tiempo. Antes de tocar nada os cuento en tres frases lo que vamos a ver, así no hay sorpresas.

> Lo que traemos **no compite ni con Harbiz ni con SIGEGym**. Somos la **capa conectada** que une experiencia del socio, operación del día a día y agenda financiera del CFO, todo integrable con lo que ya tengáis.

> En los próximos 20 minutos os enseñamos una demo en vivo montada específicamente para WiFit, con vuestras sedes y estructura de cuotas, y cerramos con qué necesitaríamos para arrancar un piloto real."

**Clave**: no mencionar "PoC" ni "prueba de concepto". Es una **demo**. El siguiente paso es **piloto**.

---

## Bloque 1 · La visión conectada · 3 min

Pestaña: Landing.

Muestra la portada. No hagas clic en nada todavía.

> "Lo que veis es una **única capa** con tres audiencias:
> 
> 1. **El socio** — lo que ve Manuel cuando abre la app WiFit IA: plan de entrenamiento, coach virtual, reservas, nutrición.
> 2. **El equipo de WiFit** — gestión de socios, leads, operación por sede, finanzas.
> 3. **La dirección** — KPIs, expansión, agenda financiera viva.
> 
> Y el truco es que los tres están **alimentados por el mismo dato**. No hay que duplicar información entre el CRM, la herramienta del personal trainer y el Excel del CFO."

Apunta al **badge "Backend en vivo · v2"**.

> "Este indicador os lo voy a señalar solo una vez: significa que lo que vais a ver **no son pantallas de PowerPoint**. Es datos reales contra una hoja conectada que podemos compartiros al final de la reunión."

---

## Bloque 2 · Experiencia del socio · 4 min

Clic en **"Experiencia del socio"**.

Recorrido breve:

1. **Phone mock** (Manuel, socio premium).  
   > "Manuel paga 41,90 €. Esta es la app que usa. Plan semanal generado por IA, coach con historial de lesiones, reservas de clase, progresión visible."

2. **Journey proof**.  
   > "Cada pantalla que veis tiene una trazabilidad: de dónde sale el dato, qué automatización lo actualiza y cuándo. No es una maqueta."

**Lo que NO dices**: que es Harbiz pero mejor, que aquí hay IA generativa, que esto funciona con cualquier LLM. No vayas por ahí.

**Qué decir si preguntan "pero esto es como Harbiz?"**:
> "Harbiz es un coach virtual — excelente producto, enfocado al coaching. Nosotros **no competimos con eso**: si mañana queréis Harbiz lo integramos aquí dentro. Lo que traemos es la capa que conecta a Harbiz con el CRM de socios, con operación y con el cash forecast. Harbiz no tiene eso."

---

## Bloque 3 · Centro de gestión · 6 min

Vuelve a inicio, clic en **"Centro de gestión"**.

**Orden de pestañas a enseñar** (dentro del centro de gestión):

1. **Socios** → 15 socios, 7 sedes, mix de estados.  
   > "Esto es lo que ve el equipo de sede. El estado (Activo / Impago / Pendiente) se sincroniza automáticamente con pagos."

2. **Leads** → 10 leads con scoring.  
   > "Instagram, Google Ads, Facebook, referidos. Score automático, próxima acción sugerida. Esto sustituye el Excel que usáis hoy — y añade scoring."

3. **Operaciones** → tareas abiertas (mantenimiento, cobros, comercial).  
   > "Cada alerta lleva sede, responsable y prioridad. Os interconectáis con la realidad del centro — no solo con lo digital."

4. **Finanzas** → **ESTA ES LA PESTAÑA CLAVE.**  
   > "Esto normalmente no existe en un gimnasio low-cost. Es la agenda financiera viva: Cash In próximos 30 días, Cash Out, Net Forecast, y aquí la pieza fuerte — **Revenue at Risk**. Impagos detectados, cobros en riesgo, y cuándo se recuperan si ejecutamos la automatización de cobro."

5. **Mercado** → comparativa con VivaGym / Basic Fit / competidores.  
   > "Contexto competitivo. Dónde está WiFit y dónde quiere llegar."

6. **Ruta** → roadmap público de 7 → 10 sedes.  
   > "Expansión visualizada con indicadores por sede. Útil para la conversación con el fondo."

---

## Bloque 4 · El momento mágico · 4 min

Vuelve a la runtime bar (arriba). Clic en **"Abrir simulador"**.

Elige el escenario **"Activación premium"** (Manuel paga).

Mientras se ejecuta (5-8 segundos):

> "Mirad. Acabamos de simular que Manuel ha pagado su cuota mensual. Sin tocar nada más, os voy a enseñar qué pasa **en la hoja real de Google en otra pestaña**."

Cambia a la pestaña 2 (Google Sheet, `socios`, `pagos`, `automatizaciones`, `agenda_financiera`).

Muéstralos en este orden:

1. Pestaña `socios` → nuevo socio añadido al final.
2. Pestaña `pagos` → nuevo cobro confirmado.
3. Pestaña `automatizaciones` → evento "Pago confirmado" con resultado.
4. Pestaña `agenda_financiera` → nueva fila de ingreso esperado a +30 días.

> "En 5 segundos: **4 sistemas actualizados simultáneamente**. Esto es lo que os va a doler cuando paséis de 7 a 10 sedes: duplicar datos manualmente en 4 herramientas se convierte en inviable."

**Segundo simulador** (opcional, si hay tiempo): Escenario **"Recuperación de impago"**.

> "Ahora el caso inverso. Carlos lleva 30 días sin pagar. El sistema lo detecta automáticamente, envía aviso, crea tarea para el gestor de sede, y mueve el ingreso a **riesgo** en la agenda financiera. Cuando se regulariza, pasa a **confirmado** y se añade el siguiente ciclo como **esperado**. El CFO ve en tiempo real el impacto de cada acción operativa."

---

## Bloque 5 · Qué NO es esto · 2 min

Párate. Baja el ritmo.

> "Antes de entrar en números quiero dejar claro **qué no estoy vendiendo**:
> 
> - **No os estoy vendiendo una sustitución de SIGEGym.** Si ya lo estáis mirando, seguid — SIGEGym hace gestión de facilities muy bien. Nosotros nos conectamos a lo que tengáis.
> - **No os vendo un coach de IA.** Si queréis Harbiz, adelante. Es buen producto. Se integra aquí dentro.
> - **No os vendo un CRM.** Tenéis o tendréis uno. Nos conectamos.
> 
> Lo que os vendo es **la capa conectiva** que hace que todas esas piezas hablen entre ellas, y que os da el cuadro de mando de dirección, operación y finanzas que ahora mismo **está en tres hojas de cálculo distintas**."

---

## Bloque 6 · Cierre y siguiente paso · 4 min

> "Para pasar de esto que os hemos enseñado a algo real para WiFit, os proponemos un **piloto de 6-8 semanas en 1 o 2 sedes**. Enfoque concreto:
> 
> - **Semana 1-2**: conectamos vuestros datos reales (sede piloto).
> - **Semana 3-5**: activamos los 3 flujos clave — activación, recuperación de impago, scoring de leads — y medimos.
> - **Semana 6-8**: cuadro de mando para dirección, con KPIs reales.
> 
> **Rango de inversión**: orden de magnitud de entre 25.000 € y 45.000 € según alcance exacto, porque el piloto real lleva ingeniería de integración contra vuestros sistemas actuales — no es un PDF. Os pasamos propuesta formal la semana siguiente si hay interés.
> 
> **Lo que necesitamos para arrancar**:
> 1. Punto de contacto técnico por vuestra parte (pagos, CRM actual).
> 2. Elegir sede piloto — sugerimos WiFit Retiro por tamaño.
> 3. KPI de éxito del piloto firmado antes de empezar."

**Credenciales Ciklum**: si te preguntan "y vosotros quiénes sois":
> "Ciklum tiene 25 años, 4.000 ingenieros, hemos hecho proyectos similares de data & AI en retail y fitness en UK e Iberia. **FoshTech** es el caso de referencia más cercano — os lo pasamos formalmente con la propuesta."

---

## Preguntas que van a hacer (y qué contestar)

**"¿Esto no lo podemos hacer con Zapier / Make?"**  
→ "Sí, los flujos simples sí. La agenda financiera viva, el scoring consistente y la capa de dirección, no. Zapier es fontanería; esto es arquitectura."

**"¿Por qué no usamos directamente SIGEGym?"**  
→ "Podéis. SIGEGym es excelente para facilities. Esto es complementario — podríamos integrarnos con SIGEGym si lo adoptáis. Lo que nosotros hacemos es el lado experiencia + IA + dirección financiera, que SIGEGym no resuelve."

**"Seguridad, GDPR, dónde están los datos"**  
→ "La demo que véis va contra Google Sheets porque es una demo. El piloto real usa vuestra infraestructura o cloud europeo regulado. GDPR compliance se audita en semana 1 del piloto — tenemos plantillas."

**"¿Plazos?"**  
→ "Piloto 6-8 semanas desde firma. Rollout completo a 7 sedes + 10 futuras, 4-6 meses más. Lo relevante es que el piloto empieza a dar valor desde la semana 3, no al final."

**"¿Y si el PE no lo aprueba?"**  
→ "Entiendo. Preparamos un one-pager orientado al fondo, centrado en **Revenue at Risk y eficiencia operativa por sede**. Esas son las dos métricas que mueven el comité."

---

## Cosas que NO hacer en la reunión

- **No pulsar "Reiniciar"** en la runtime bar durante la demo. En modo presentación está oculto, pero por si acaso.
- **No entrar al Apps Script editor** durante la reunión. Es para ingenieros, no para comercial.
- **No mencionar "está hecho en Google Sheets"**. Decir "capa operativa de demo" o "backend de demo". La arquitectura real se conversa en el piloto.
- **No prometer features nuevas sobre la marcha**. Si te piden algo que no está: "lo miramos en la propuesta formal".
- **No pelearte con Harbiz ni SIGEGym**. Son competidores potenciales pero también integrables. Posicionamiento: complementarios, no sustitutos.

---

## Si algo falla durante la demo

- **Backend dice "Modo demo local"**: la demo funciona igual con datos seed. Dices: "hemos tenido un parpadeo de red, pero la demo sigue funcionando contra los datos locales — os muestro lo mismo y luego lo vemos con backend conectado".
- **Chart.js no carga / gráficos vacíos**: recarga. Chart.js está vendorizado, si no está la wifi del cliente bloquea mucho más que eso.
- **El simulador se queda "procesando"**: espera 10s máximo, luego dices "el backend estaba frío, ya se ha calentado, ahora va fluido" y lo vuelves a pulsar. Con el warmup que metimos esto no debería pasar, pero ten la frase lista.
- **Todo falla a la vez**: cambias a `WiFit_Manual_Maestro_PoC.pdf` en pantalla compartida. Tienes 20 páginas de material para sostener la conversación sin demo.

---

## Tiempos orientativos

| Bloque | Minutos | Acumulado |
|--------|---------|-----------|
| Apertura | 2 | 2 |
| Visión conectada | 3 | 5 |
| Experiencia socio | 4 | 9 |
| Centro gestión | 6 | 15 |
| Momento mágico | 4 | 19 |
| Qué no es esto | 2 | 21 |
| Cierre y siguiente paso | 4 | 25 |

Si te pasas: corta primero Mercado y Ruta del Bloque 3. Si te sobran 5 min: añade el escenario de recuperación de impago en el Bloque 4.
