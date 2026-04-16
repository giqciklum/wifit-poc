# Preflight checklist · WiFit × Ciklum

**Cuándo ejecutar**: 15-20 minutos antes de la reunión, desde el mismo Mac y la misma wifi que vas a usar en la reunión.  
**Tiempo total**: 5-7 minutos si todo va bien, 15 min si hay que resolver algo.

---

## 1. Backend · 2 min

Abre un terminal. Ejecuta:

```bash
curl -sL "https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec?action=state" | python3 -m json.tool | head -20
```

**Tiene que decir**:
- `"status": "ok"`
- `"version": "v2"` ← imprescindible
- Un bloque `resumen` con `socios_total`, `socios_activos`, etc.

**Si no**:
- Si devuelve HTML en vez de JSON → permisos del Apps Script cambiados → volver a Apps Script → "Implementar > Gestionar implementaciones > lápiz > Quién tiene acceso = Cualquier usuario".
- Si falta `version` → no está desplegada la v2 → seguir instrucciones de deploy en `DEPLOY_INSTRUCCIONES.md`.
- Si tarda mucho o timeouts → Apps Script frío. Haz `curl ...?action=warmup` y vuelve a intentar en 20s.

---

## 2. Reset de hoja · 1 min

Para empezar limpios, resetea la Google Sheet:

```bash
curl -sL "https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec?action=reset"
```

Debe devolver `"status":"ok", "action":"reset", "version":"v2"`. Quedan: 15 socios, 13 activos, 2 impagos (S003 y S011), 10 leads, 6 automatizaciones, agenda financiera limpia.

Tras esto, abre la Google Sheet y verifica visualmente:
- 7 pestañas (socios, pagos, leads, reservas, automatizaciones, tareas, agenda_financiera).
- Fila 1 congelada y con color verde/teal.
- Fechas en formato `2026-04-12`, no `Fri May 01 2026...`.

---

## 3. Frontend · 2 min

Abre en Chrome en modo incógnito (para no arrastrar cache viejo):

```
https://giqciklum.github.io/wifit-poc/?mode=present
```

Verifica:

- **Badge superior derecho** dice "Backend en vivo · v2" en verde. Si dice "Conectando backend" esperar 5s. Si tras 10s sigue en "Modo demo local" → la wifi está bloqueando script.google.com. Cambia a 4G del móvil.
- **Marca de agua** abajo a la derecha: "Modo presentación · WiFit × Ciklum".
- **Botón "Reiniciar"** arriba está **oculto** (protege contra clics accidentales).
- Los **gráficos** (Cash In, Revenue at Risk, funnel de leads) cargan con números, no con cuadrículas vacías. Si vacíos, recarga; si persisten, Chart.js no cargó y hay que investigar (muy raro: está vendorizado).
- Fuentes **DM Sans** (cuerpo) y **Bebas Neue** (números grandes) se ven correctamente. Si aparece Times New Roman o Arial genérico → Google Fonts bloqueado por red, no es grave pero avisa.

---

## 4. Simulación de prueba · 1 min

Pulsa **"Abrir simulador"** y ejecuta el escenario de **activación premium**.

Debería tardar **2-4 segundos** (si tardar más, el backend está frío — haz `?action=warmup` como en paso 1).

Verifica:

- El socio nuevo aparece en la lista interna.
- La Google Sheet (en otra pestaña) muestra la nueva fila en `socios`, `pagos`, `automatizaciones` y `agenda_financiera`.
- El mensaje de éxito sale en < 5s.

Al terminar: **vuelve a hacer reset** (paso 2) para empezar la reunión limpios.

---

## 5. Entorno físico · 1 min

- Cierra todas las pestañas del navegador **excepto las 4 que necesitas** (ver guión).
- Desactiva notificaciones de Slack, correo, calendario.
- Modo **"No molestar"** del Mac activado.
- Batería del Mac > 60% o cargador conectado.
- Compartir pantalla prueba con un contacto: audio OK, resolución OK.
- **Ten a mano** el `WiFit_Manual_Maestro_PoC.pdf` como salvavidas.

---

## 6. Respuestas de emergencia

Si durante la reunión algo se tuerce, tienes estas frases de recuperación:

- **Backend cae a "Modo demo local"**: "Hemos tenido un parpadeo en la red del backend de demo — es un incidental, la demo sigue funcionando contra datos locales, os muestro lo mismo y luego lo vemos con backend cuando la red vuelva."
- **Demo tarda mucho**: "Primera petición del día — la infraestructura de demo está en serverless, se calienta y de ahí en adelante va fluido." *(es cierto, el cold start del Apps Script es real.)*
- **Si te piden acceso al Apps Script**: "Eso es parte de la infraestructura de demo. En el piloto real sustituimos esto por vuestro entorno. Os paso acceso de solo lectura a la Google Sheet después de la reunión si os interesa."
- **"Está todo en Google Sheets?"**: "La capa operativa de la demo, sí — es una decisión deliberada para poder enseñaros datos reales que podéis tocar. La arquitectura del piloto se define con vuestro CTO en la semana 1."

---

## 7. Después de la reunión

- **Email de follow-up** en las siguientes 2 horas, mientras están calientes:
  - Enlace a la demo.
  - PDF del manual maestro adjunto.
  - Resumen de siguiente paso + fecha objetivo para enviar propuesta formal.
  - One-pager del fondo si se pidió.
- **No** envíes la Google Sheet como está, tiene datos de demo con nombres ficticios que pueden confundir si los miran sin contexto. Si quieren verla, haz copia en solo-lectura y compártela etiquetada como "Demo sample".
- **Reset definitivo** de la hoja (paso 2) por si quedan rastros de las simulaciones de la reunión, para no dejar "A011, A012, P016..." colgando.

---

## 8. Si todo va tan bien que te piden ir al piloto en esta reunión

- **No firmes nada verbal**. Di: "Perfecto — mañana os mandamos propuesta formal con alcance, hitos, rango y condiciones, y la cerramos esta semana."
- **Pide**: punto de contacto técnico (email), sede piloto (sugerida Retiro), fecha objetivo de kickoff.
- **Cierra**: "¿Os va que enviemos propuesta formal el [día X] y cerramos llamada de 30 min el [día Y] para resolver dudas?"

---

## Anexo · Comandos útiles

Todos contra la misma URL:

```bash
BASE="https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec"

# Pre-calentar el Apps Script (hazlo 2-3 minutos antes de empezar)
curl -sL "$BASE?action=warmup"

# Estado rápido
curl -sL "$BASE?action=state" | python3 -m json.tool | head -15

# Estado con snapshot completo (para debug)
curl -sL "$BASE?action=state&detail=full" > /tmp/state.json && python3 -c "import json; d=json.load(open('/tmp/state.json')); print('v:',d.get('version'),'socios:',len(d.get('snapshot',{}).get('socios',[])),'finanzas:',len(d.get('snapshot',{}).get('finanzas',[])))"

# Reset para empezar limpios
curl -sL "$BASE?action=reset"

# Simulación de regularización (recuperar S003 si quedó en impago)
curl -sL "$BASE?action=regularize&socio_id=S003"
```
