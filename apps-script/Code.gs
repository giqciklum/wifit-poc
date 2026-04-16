/* ============================================================
   WiFit Live Demo - Apps Script (bound to Google Sheet)
   v2 · 2026-04-16
   ============================================================
   CAMBIOS respecto a v1:
   - setupSheet() ahora crea 7 pestanas (anade agenda_financiera).
   - Todas las fechas salen ISO (yyyy-MM-dd) en el JSON, no Date toString.
   - Endpoints nuevos: ?action=reset, ?action=warmup, ?action=regularize.
   - Los triggers (activation, retention, regularize) tambien actualizan
     la agenda financiera, cerrando el circulo operativo-financiero.
   - Sedes estrictamente las 7 oficiales de WiFit (Madrid + Humanes).
   - `retention` => DETECCION de impago (marca riesgo).
   - `regularize` => RECUPERACION real (cierra impago).
   ============================================================ */

var SEDES = [
  "WiFit Retiro",
  "WiFit Chamberi",
  "WiFit Humanes",
  "WiFit Moratalaz",
  "WiFit Guindalera",
  "WiFit Puerta de Hierro",
  "WiFit Lopez de Hoyos"
];

var SEDES_SET = SEDES.reduce(function(a, s){ a[s.toLowerCase()] = s; return a; }, {});

function normalizeSede(sede) {
  if (!sede) return SEDES[0];
  var key = String(sede).toLowerCase();
  if (SEDES_SET[key]) return SEDES_SET[key];
  // tolera "Retiro" -> "WiFit Retiro"
  for (var i = 0; i < SEDES.length; i++) {
    if (SEDES[i].toLowerCase().indexOf(key) !== -1) return SEDES[i];
  }
  return SEDES[0];
}

/* ---------- HELPERS de fecha y formato ---------- */
function isoDate(d) {
  if (d === null || d === undefined || d === "") return "";
  var date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return Utilities.formatDate(date, "Europe/Madrid", "yyyy-MM-dd");
}

function isoDateTime(d) {
  if (d === null || d === undefined || d === "") return "";
  var date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return Utilities.formatDate(date, "Europe/Madrid", "yyyy-MM-dd HH:mm");
}

function todayIso() {
  return Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd");
}

function nowFormatted() {
  return Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd HH:mm");
}

function isoOffsetDate(days) {
  var d = new Date(Date.now() + (days * 86400000));
  return Utilities.formatDate(d, "Europe/Madrid", "yyyy-MM-dd");
}

// True si la columna contiene tipicamente fechas (por nombre de cabecera)
function isDateField(name) {
  if (!name) return false;
  var n = String(name).toLowerCase();
  return n.indexOf("fecha") !== -1
      || n.indexOf("alta") !== -1
      || n === "proximo_cobro"
      || n === "ultimo_pago"
      || n === "hora_inicio"
      || n === "hora_fin";
}

// Formatea un valor de celda para JSON: las fechas siempre ISO.
function formatCellForJson(value, header) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    var withTime = String(header || "").toLowerCase().indexOf("hora") !== -1;
    return withTime ? isoDateTime(value) : isoDate(value);
  }
  if (typeof value === "number") return String(value);
  var s = String(value);
  // Por si una fecha llego como string con formato feo tipo "Fri May 01..."
  if (isDateField(header) && s.indexOf("GMT") !== -1) {
    var parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return String(header || "").toLowerCase().indexOf("hora") !== -1
        ? isoDateTime(parsed)
        : isoDate(parsed);
    }
  }
  return s;
}

/* ---------- HELPER: sheet rows to objects ---------- */
function sheetToObjects(sheet, keys) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = keys || data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = formatCellForJson(data[i][j], headers[j]);
    }
    rows.push(obj);
  }
  return rows;
}

function getNextSequentialId(sheet, prefix, columnIndex) {
  var lastRow = sheet.getLastRow();
  var col = columnIndex || 1;
  var maxId = 0;

  if (lastRow >= 2) {
    var values = sheet.getRange(2, col, lastRow - 1, 1).getValues();
    for (var i = 0; i < values.length; i++) {
      var raw = String(values[i][0] || "").trim();
      if (raw.indexOf(prefix) !== 0) continue;

      var numericPart = parseInt(raw.slice(prefix.length), 10);
      if (!isNaN(numericPart) && numericPart > maxId) {
        maxId = numericPart;
      }
    }
  }

  return prefix + Utilities.formatString("%03d", maxId + 1);
}

function findSheetByNames(ss, names) {
  for (var i = 0; i < names.length; i++) {
    var sheet = ss.getSheetByName(names[i]);
    if (sheet) return sheet;
  }
  var normalizedTargets = names.map(function(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  });
  var sheets = ss.getSheets();
  for (var j = 0; j < sheets.length; j++) {
    var normalizedName = sheets[j].getName().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedTargets.indexOf(normalizedName) !== -1) {
      return sheets[j];
    }
  }
  return null;
}

function getFinanceSheet(ss) {
  return findSheetByNames(ss, [
    "agenda_financiera","Agenda financiera","agenda financiera",
    "financial_calendar","Financial Calendar","cash_forecast",
    "Cash Forecast","cashflow","cash_flow"
  ]);
}

/* ---------- SETUP: crear pestanas y rellenar datos ---------- */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var def = ss.getSheetByName("Sheet1");

  // --- SOCIOS ---
  var sh = ss.getSheetByName("socios") || ss.insertSheet("socios");
  sh.clear();
  sh.appendRow(["id_socio","nombre","apellidos","email","telefono","sede","plan","fecha_alta","estado","cuota","ultimo_pago","premium_ia"]);
  var socios = [
    ["S001","Manuel","Garcia Lopez","manuel.garcia@demo.com","612345001","WiFit Retiro","Mensual","2026-01-15","Activo","41.90","2026-04-12","Si"],
    ["S002","Laura","Sanchez Ruiz","laura.sanchez@demo.com","612345002","WiFit Chamberi","Trimestral","2025-10-22","Activo","116.70","2026-04-01","No"],
    ["S003","Carlos","Fernandez Torres","carlos.fernandez@demo.com","612345003","WiFit Humanes","Mensual","2025-11-10","Impago","41.90","2026-03-15","Si"],
    ["S004","Ana","Martinez Diaz","ana.martinez@demo.com","612345004","WiFit Retiro","Anual","2025-09-01","Activo","394.80","2026-01-01","Si"],
    ["S005","Pablo","Ruiz Moreno","pablo.ruiz@demo.com","612345005","WiFit Moratalaz","Mensual","2026-02-03","Activo","41.90","2026-04-10","No"],
    ["S006","Elena","Lopez Navarro","elena.lopez@demo.com","612345006","WiFit Guindalera","Mensual","2025-12-18","Activo","41.90","2026-04-11","Si"],
    ["S007","Javier","Hernandez Gil","javier.hernandez@demo.com","612345007","WiFit Puerta de Hierro","Trimestral","2025-11-05","Activo","116.70","2026-03-05","No"],
    ["S008","Maria","Ortega Vega","maria.ortega@demo.com","612345008","WiFit Retiro","Mensual","2026-01-20","Activo","41.90","2026-04-08","Si"],
    ["S009","Daniel","Martin Ramos","daniel.martin@demo.com","612345009","WiFit Chamberi","Anual","2025-10-14","Activo","394.80","2026-02-14","Si"],
    ["S010","Sofia","Perez Castro","sofia.perez@demo.com","612345010","WiFit Humanes","Mensual","2026-02-07","Activo","41.90","2026-04-07","No"],
    ["S011","Raul","Gomez Blanco","raul.gomez@demo.com","612345011","WiFit Lopez de Hoyos","Mensual","2026-01-12","Impago","41.90","2026-02-12","No"],
    ["S012","Lucia","Alvarez Prieto","lucia.alvarez@demo.com","612345012","WiFit Moratalaz","Trimestral","2025-11-30","Activo","116.70","2026-02-28","Si"],
    ["S013","Sergio","Diaz Romero","sergio.diaz@demo.com","612345013","WiFit Guindalera","Mensual","2026-03-01","Activo","41.90","2026-04-01","No"],
    ["S014","Carmen","Jimenez Soto","carmen.jimenez@demo.com","612345014","WiFit Retiro","Mensual","2026-02-10","Activo","41.90","2026-04-10","Si"],
    ["S015","Andres","Vazquez Molina","andres.vazquez@demo.com","612345015","WiFit Puerta de Hierro","Mensual","2026-03-01","Activo","41.90","2026-04-01","No"]
  ];
  socios.forEach(function(r){ sh.appendRow(r); });
  sh.getRange("1:1").setFontWeight("bold").setBackground("#99b912").setFontColor("#ffffff");
  sh.setFrozenRows(1);

  // --- PAGOS ---
  var shP = ss.getSheetByName("pagos") || ss.insertSheet("pagos");
  shP.clear();
  shP.appendRow(["id_pago","id_socio","fecha","importe","metodo","estado","proximo_cobro","invoice_id"]);
  var pagos = [
    ["P001","S001","2026-04-12","41.90","Tarjeta","Confirmado","2026-05-12","INV-20260412-001"],
    ["P002","S002","2026-04-01","116.70","Tarjeta","Confirmado","2026-07-01","INV-20260401-002"],
    ["P003","S003","2026-03-15","41.90","Domiciliacion","Fallido","2026-04-15","INV-20260315-003"],
    ["P004","S004","2026-01-01","394.80","Tarjeta","Confirmado","2027-01-01","INV-20260101-004"],
    ["P005","S005","2026-04-10","41.90","Tarjeta","Confirmado","2026-05-10","INV-20260410-005"],
    ["P006","S006","2026-04-11","41.90","Domiciliacion","Confirmado","2026-05-11","INV-20260411-006"],
    ["P007","S007","2026-03-05","116.70","Tarjeta","Confirmado","2026-06-05","INV-20260305-007"],
    ["P008","S008","2026-04-08","41.90","Tarjeta","Confirmado","2026-05-08","INV-20260408-008"],
    ["P009","S009","2026-02-14","394.80","Domiciliacion","Confirmado","2027-02-14","INV-20260214-009"],
    ["P010","S010","2026-04-07","41.90","Tarjeta","Confirmado","2026-05-07","INV-20260407-010"],
    ["P011","S011","2026-02-12","41.90","Domiciliacion","Fallido","2026-03-12","INV-20260212-011"],
    ["P012","S012","2026-02-28","116.70","Tarjeta","Confirmado","2026-05-28","INV-20260228-012"],
    ["P013","S013","2026-04-01","41.90","Tarjeta","Confirmado","2026-05-01","INV-20260401-013"],
    ["P014","S014","2026-04-10","41.90","Domiciliacion","Confirmado","2026-05-10","INV-20260410-014"],
    ["P015","S015","2026-04-01","41.90","Tarjeta","Confirmado","2026-05-01","INV-20260401-015"]
  ];
  pagos.forEach(function(r){ shP.appendRow(r); });
  shP.getRange("1:1").setFontWeight("bold").setBackground("#007f68").setFontColor("#ffffff");
  shP.setFrozenRows(1);

  // --- LEADS ---
  var shL = ss.getSheetByName("leads") || ss.insertSheet("leads");
  shL.clear();
  shL.appendRow(["id_lead","canal","nombre","email","telefono","sede_interes","score","estado","siguiente_accion"]);
  var leads = [
    ["L001","Instagram","Pablo Ruiz","pablo.r@demo.com","634000001","WiFit Retiro","82","Contactado","Enviar oferta prueba gratis"],
    ["L002","Google Ads","Marta Flores","marta.f@demo.com","634000002","WiFit Chamberi","74","Nuevo","Llamada comercial"],
    ["L003","Facebook","Alejandro Nieto","alex.n@demo.com","634000003","WiFit Humanes","55","Visita trial","Seguimiento post-visita"],
    ["L004","Web organica","Sara Medina","sara.m@demo.com","634000004","WiFit Moratalaz","91","Contactado","Proponer plan anual"],
    ["L005","Instagram","David Castillo","david.c@demo.com","634000005","WiFit Guindalera","43","Nuevo","Email automatico"],
    ["L006","Referido","Natalia Vega","natalia.v@demo.com","634000006","WiFit Retiro","88","Visita trial","Cierre con descuento"],
    ["L007","Google Ads","Marcos Delgado","marcos.d@demo.com","634000007","WiFit Puerta de Hierro","67","Contactado","Segunda llamada"],
    ["L008","Facebook","Ines Ramos","ines.r@demo.com","634000008","WiFit Chamberi","38","Nuevo","Nurturing email"],
    ["L009","Web organica","Victor Herrera","victor.h@demo.com","634000009","WiFit Lopez de Hoyos","72","Contactado","Enviar horarios"],
    ["L010","Instagram","Paula Iglesias","paula.i@demo.com","634000010","WiFit Retiro","60","Nuevo","Email prueba gratis"]
  ];
  leads.forEach(function(r){ shL.appendRow(r); });
  shL.getRange("1:1").setFontWeight("bold").setBackground("#99b912").setFontColor("#ffffff");
  shL.setFrozenRows(1);

  // --- RESERVAS ---
  var shR = ss.getSheetByName("reservas") || ss.insertSheet("reservas");
  shR.clear();
  shR.appendRow(["id_reserva","id_socio","clase","sede","fecha_hora","estado"]);
  var reservas = [
    ["R001","S001","WiHiit","WiFit Retiro","2026-04-17 07:30","Confirmada"],
    ["R002","S008","Body Balance","WiFit Retiro","2026-04-17 19:00","Confirmada"],
    ["R003","S009","Body Pump","WiFit Chamberi","2026-04-17 07:30","Confirmada"],
    ["R004","S005","Spinning","WiFit Moratalaz","2026-04-17 18:30","Confirmada"],
    ["R005","S006","Pilates","WiFit Guindalera","2026-04-18 10:00","Pendiente"],
    ["R006","S012","Zumba","WiFit Moratalaz","2026-04-18 19:00","Pendiente"],
    ["R007","S014","GAP","WiFit Retiro","2026-04-18 18:00","Confirmada"],
    ["R008","S002","Body Combat","WiFit Chamberi","2026-04-19 19:30","Pendiente"],
    ["R009","S007","HIIT","WiFit Puerta de Hierro","2026-04-19 08:00","Confirmada"],
    ["R010","S004","Pilates","WiFit Retiro","2026-04-19 11:00","Confirmada"]
  ];
  reservas.forEach(function(r){ shR.appendRow(r); });
  shR.getRange("1:1").setFontWeight("bold").setBackground("#007f68").setFontColor("#ffffff");
  shR.setFrozenRows(1);

  // --- AUTOMATIZACIONES ---
  var shA = ss.getSheetByName("automatizaciones") || ss.insertSheet("automatizaciones");
  shA.clear();
  shA.appendRow(["id_evento","trigger","entidad","detalle","estado","hora_inicio","hora_fin","resultado"]);
  var autos = [
    ["A001","Pago confirmado","S001","Cobro mensual 41.90 EUR","Completado","2026-04-12 09:14","2026-04-12 09:14","Socio activado + email bienvenida + IA premium asignada"],
    ["A002","Lead nuevo","L001","Instagram lead score 82","Completado","2026-04-12 08:45","2026-04-12 08:45","Scoring + email prueba gratis enviado"],
    ["A003","Pago fallido","S003","Domiciliacion rechazada","En curso","2026-04-11 17:30","","Aviso enviado + tarea creada para gestor"],
    ["A004","Pago confirmado","S005","Cobro mensual 41.90 EUR","Completado","2026-04-10 10:22","2026-04-10 10:22","Socio activado + plan semana generado"],
    ["A005","Lead nuevo","L004","Web organica score 91","Completado","2026-04-10 14:10","2026-04-10 14:10","Scoring + propuesta plan anual"],
    ["A006","Pago fallido","S011","Domiciliacion rechazada 2o intento","En curso","2026-04-09 16:00","","Aviso + oferta recuperacion enviada"]
  ];
  autos.forEach(function(r){ shA.appendRow(r); });
  shA.getRange("1:1").setFontWeight("bold").setBackground("#232a04").setFontColor("#ffffff");
  shA.setFrozenRows(1);

  // --- TAREAS ---
  var shT = ss.getSheetByName("tareas") || ss.insertSheet("tareas");
  shT.clear();
  shT.appendRow(["id_tarea","tipo","sede","responsable","prioridad","estado","descripcion"]);
  var tareas = [
    ["T001","Mantenimiento","WiFit Retiro","Carlos Ruiz","Alta","En curso","Revision preventiva cinta de correr 3"],
    ["T002","Comercial","WiFit Chamberi","Ana Lopez","Media","Pendiente","Seguimiento lead Marcos Delgado"],
    ["T003","Operacion","WiFit Humanes","Pedro Gomez","Alta","Pendiente","Climatizacion sala 2 sobrecoste"],
    ["T004","Cobros","WiFit Retiro","Sistema","Alta","En curso","Recuperacion impago Carlos Fernandez"],
    ["T005","Comercial","WiFit Retiro","Ana Lopez","Media","Completada","Cierre prueba gratis Pablo Ruiz"],
    ["T006","Mantenimiento","WiFit Chamberi","Carlos Ruiz","Media","Pendiente","Reposicion kettlebells zona funcional"],
    ["T007","Operacion","WiFit Moratalaz","Pedro Gomez","Baja","Pendiente","Revision iluminacion vestuarios"],
    ["T008","Comercial","WiFit Guindalera","Ana Lopez","Alta","En curso","Contacto lead Natalia Vega referida"],
    ["T009","Cobros","WiFit Lopez de Hoyos","Sistema","Alta","En curso","2o aviso impago Raul Gomez"],
    ["T010","Mantenimiento","WiFit Puerta de Hierro","Carlos Ruiz","Baja","Completada","Calibracion bicicletas spinning"]
  ];
  tareas.forEach(function(r){ shT.appendRow(r); });
  shT.getRange("1:1").setFontWeight("bold").setBackground("#99b912").setFontColor("#ffffff");
  shT.setFrozenRows(1);

  // --- AGENDA FINANCIERA (nueva en v2) ---
  var shF = ss.getSheetByName("agenda_financiera") || ss.insertSheet("agenda_financiera");
  shF.clear();
  shF.appendRow(["fecha","tipo","categoria","sede","id_socio","importe","estado","origen","trigger_relacionado","comentario"]);
  var ingresosCuotas = [
    ["2026-05-01","ingreso","cuota","WiFit Retiro","S001","41.90","esperado","pagos","","Mensualidad"],
    ["2026-05-01","ingreso","cuota","WiFit Chamberi","S002","116.70","esperado","pagos","","Mensualidad trimestral"],
    ["2026-04-15","ingreso","cuota","WiFit Humanes","S003","41.90","riesgo","pagos","Pago fallido","Reintento pendiente"],
    ["2026-05-01","ingreso","cuota","WiFit Retiro","S008","41.90","esperado","pagos","","Mensualidad"],
    ["2026-05-01","ingreso","cuota","WiFit Moratalaz","S005","41.90","esperado","pagos","","Mensualidad"],
    ["2026-04-25","ingreso","cuota","WiFit Lopez de Hoyos","S011","41.90","riesgo","pagos","Pago fallido","2 avisos enviados"],
    ["2026-05-01","ingreso","cuota","WiFit Guindalera","S006","41.90","esperado","pagos","","Mensualidad"],
    ["2026-05-05","ingreso","cuota","WiFit Puerta de Hierro","S007","116.70","esperado","pagos","","Mensualidad trimestral"]
  ];
  var gastosFijos = [
    ["2026-04-28","gasto","alquiler","WiFit Retiro","","8500.00","previsto","operaciones","","Renta mensual"],
    ["2026-04-28","gasto","alquiler","WiFit Chamberi","","7200.00","previsto","operaciones","","Renta mensual"],
    ["2026-04-28","gasto","alquiler","WiFit Humanes","","6400.00","previsto","operaciones","","Renta mensual"],
    ["2026-04-28","gasto","alquiler","WiFit Moratalaz","","6100.00","previsto","operaciones","","Renta mensual"],
    ["2026-04-30","gasto","nominas","Cadena","","42800.00","previsto","operaciones","","Nominas mensuales"],
    ["2026-05-05","gasto","leasing","Cadena","","3900.00","previsto","operaciones","","Leasing equipamiento"],
    ["2026-05-10","gasto","mantenimiento","WiFit Puerta de Hierro","","1800.00","previsto","operaciones","","Revision preventiva cintas"]
  ];
  ingresosCuotas.concat(gastosFijos).forEach(function(r){ shF.appendRow(r); });
  shF.getRange("1:1").setFontWeight("bold").setBackground("#007f68").setFontColor("#ffffff");
  shF.setFrozenRows(1);

  if (def) {
    try { ss.deleteSheet(def); } catch(e) {}
  }

  SpreadsheetApp.flush();
  Logger.log("Setup v2 completado: 7 pestanas creadas con datos fake WiFit (incluye agenda_financiera)");
}

/* ---------- RESET: dejar la hoja en estado prístino ---------- */
function resetDemo() {
  setupSheet();
}

/* ---------- AGENDA FINANCIERA: helpers ---------- */
function findFinanceRowForSocio(financeSheet, socioId) {
  if (!financeSheet) return -1;
  var data = financeSheet.getDataRange().getValues();
  var best = -1;
  var bestDate = "";
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][4]) === String(socioId)) {
      var f = String(data[i][0]);
      if (!bestDate || f > bestDate) {
        bestDate = f;
        best = i + 1;
      }
    }
  }
  return best;
}

function setFinanceEstado(financeSheet, row, estado, triggerRelacionado, comentario) {
  if (!financeSheet || row < 0) return;
  financeSheet.getRange(row, 7).setValue(estado);
  if (triggerRelacionado) financeSheet.getRange(row, 9).setValue(triggerRelacionado);
  if (comentario) financeSheet.getRange(row, 10).setValue(comentario);
}

function appendFinanceRow(financeSheet, row) {
  if (!financeSheet) return;
  financeSheet.appendRow(row);
}

/* ---------- SHARED: handleTrigger ---------- */
function handleTrigger(action, params, ss) {
  var lock = LockService.getDocumentLock();
  lock.waitLock(10000);

  try {
    var autos = ss.getSheetByName("automatizaciones");
    var finance = getFinanceSheet(ss);
    var now = nowFormatted();
    var nextId = getNextSequentialId(autos, "A", 1);

    if (action === "activation") {
      var socios = ss.getSheetByName("socios");
      var pagos = ss.getSheetByName("pagos");
      var nombre = params.nombre || "Nuevo Socio Demo";
      var sede = normalizeSede(params.sede);
      var newId = getNextSequentialId(socios, "S", 1);
      var newPagoId = getNextSequentialId(pagos, "P", 1);

      socios.appendRow([newId, nombre.split(" ")[0], nombre.split(" ").slice(1).join(" ") || "Demo",
        nombre.toLowerCase().replace(/ /g,".") + "@demo.com", "612000000", sede,
        "Mensual", todayIso(),
        "Activo", "41.90", todayIso(), "Si"]);

      pagos.appendRow([newPagoId, newId, todayIso(),
        "41.90", "Tarjeta", "Confirmado", isoOffsetDate(30),
        "INV-" + Utilities.formatDate(new Date(), "Europe/Madrid", "yyyyMMdd") + "-" + newId]);

      autos.appendRow([nextId, "Pago confirmado", newId,
        "Cobro mensual 41.90 EUR - " + nombre,
        "Completado", now, now,
        "Socio activado + email bienvenida + IA premium asignada + plan semana 1 generado"]);

      // Agenda financiera: proximo cobro esperado a +30 dias
      if (finance) {
        appendFinanceRow(finance, [isoOffsetDate(30), "ingreso", "cuota", sede, newId,
          "41.90", "esperado", "pagos", "Pago confirmado", "Cobro recurrente programado"]);
      }

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok", action: "activation", socio_id: newId, pago_id: newPagoId, auto_id: nextId,
        mensaje: "Cobro confirmado. Socio " + nombre + " activado en " + sede + ". Email de bienvenida enviado. IA premium asignada.",
        timestamp: now
      }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "lead") {
      var leadsSheet = ss.getSheetByName("leads");
      var nombre = params.nombre || "Lead Demo";
      var canal = params.canal || "Instagram";
      var sede = normalizeSede(params.sede);
      var score = Math.floor(Math.random() * 40) + 55;
      var newId = getNextSequentialId(leadsSheet, "L", 1);

      leadsSheet.appendRow([newId, canal, nombre,
        nombre.toLowerCase().replace(/ /g,".") + "@demo.com",
        "634" + String(Math.floor(Math.random()*999999)).padStart(6,"0"),
        sede, String(score), "Nuevo",
        score > 75 ? "Llamada comercial prioritaria" : "Email prueba gratis"]);

      autos.appendRow([nextId, "Lead nuevo", newId,
        canal + " - " + nombre + " - score " + score,
        "Completado", now, now,
        "Scoring automatico (" + score + ") + " + (score > 75 ? "llamada comercial asignada" : "email prueba gratis enviado")]);

      if (score > 75) {
        var tareas = ss.getSheetByName("tareas");
        var tId = getNextSequentialId(tareas, "T", 1);
        tareas.appendRow([tId, "Comercial", sede, "Ana Lopez", "Alta", "Pendiente",
          "Contactar lead " + nombre + " (score " + score + ") - " + canal]);
      }

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok", action: "lead", lead_id: newId, score: score, auto_id: nextId,
        mensaje: "Lead " + nombre + " registrado via " + canal + ". Score: " + score + ". " + (score > 75 ? "Llamada comercial asignada." : "Email prueba gratis enviado."),
        timestamp: now
      }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "retention" || action === "detection") {
      // DETECCION de impago: marca al socio en impago y abre tarea
      var sociosSheet = ss.getSheetByName("socios");
      var socioId = params.socio_id || "S003";

      var sociosData = sociosSheet.getDataRange().getValues();
      var socioRow = -1;
      var socioNombre = "Socio";
      var socioSede = "WiFit Retiro";
      for (var i = 1; i < sociosData.length; i++) {
        if (sociosData[i][0] === socioId) {
          socioRow = i + 1;
          socioNombre = sociosData[i][1] + " " + sociosData[i][2];
          socioSede = sociosData[i][5] || "WiFit Retiro";
          break;
        }
      }

      if (socioRow > 0) {
        sociosSheet.getRange(socioRow, 9).setValue("Impago");
      }

      autos.appendRow([nextId, "Pago fallido", socioId,
        "Impago detectado - " + socioNombre,
        "En curso", now, "",
        "Aviso enviado al socio + tarea creada para gestor + oferta recuperacion programada"]);

      var tareas = ss.getSheetByName("tareas");
      var tId = getNextSequentialId(tareas, "T", 1);
      tareas.appendRow([tId, "Cobros", socioSede, "Sistema", "Alta", "En curso",
        "Recuperacion impago " + socioNombre + " (" + socioId + ")"]);

      // Agenda financiera: pasar el ingreso mas cercano de ese socio a riesgo
      if (finance) {
        var fRow = findFinanceRowForSocio(finance, socioId);
        if (fRow > 0) {
          setFinanceEstado(finance, fRow, "riesgo", "Pago fallido", "Marcado tras deteccion de impago");
        } else {
          appendFinanceRow(finance, [isoOffsetDate(5), "ingreso", "cuota", socioSede, socioId,
            "41.90", "riesgo", "pagos", "Pago fallido", "Reintento programado"]);
        }
      }

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok", action: "retention", socio_id: socioId, socio_nombre: socioNombre,
        auto_id: nextId, tarea_id: tId,
        mensaje: "Impago detectado para " + socioNombre + ". Aviso enviado. Tarea de recuperacion creada. Ingreso movido a riesgo en agenda financiera.",
        timestamp: now
      }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "regularize") {
      // REGULARIZACION real: cierra el impago de verdad
      var sociosSheet2 = ss.getSheetByName("socios");
      var pagosSheet = ss.getSheetByName("pagos");
      var tareasSheet = ss.getSheetByName("tareas");
      var socioId2 = params.socio_id || "S003";

      // Si no piden uno, buscar el primer socio en impago
      var sData = sociosSheet2.getDataRange().getValues();
      var rIdx = -1, sNombre = "Socio", sSede = "WiFit Retiro", sCuota = "41.90";
      if (!params.socio_id) {
        for (var k = 1; k < sData.length; k++) {
          if (String(sData[k][8]) === "Impago") { rIdx = k + 1; socioId2 = sData[k][0]; sNombre = sData[k][1]+" "+sData[k][2]; sSede = sData[k][5] || sSede; sCuota = String(sData[k][9]||"41.90"); break; }
        }
      } else {
        for (var k2 = 1; k2 < sData.length; k2++) {
          if (String(sData[k2][0]) === String(socioId2)) { rIdx = k2 + 1; sNombre = sData[k2][1]+" "+sData[k2][2]; sSede = sData[k2][5] || sSede; sCuota = String(sData[k2][9]||"41.90"); break; }
        }
      }

      if (rIdx > 0) {
        sociosSheet2.getRange(rIdx, 9).setValue("Activo");
        sociosSheet2.getRange(rIdx, 11).setValue(todayIso());
      }

      // Nuevo pago confirmado
      var newPagoId2 = getNextSequentialId(pagosSheet, "P", 1);
      pagosSheet.appendRow([newPagoId2, socioId2, todayIso(), sCuota, "Tarjeta", "Confirmado", isoOffsetDate(30),
        "INV-" + Utilities.formatDate(new Date(), "Europe/Madrid", "yyyyMMdd") + "-" + socioId2]);

      // Cerrar la tarea abierta de recuperacion (si existe)
      var tData = tareasSheet.getDataRange().getValues();
      for (var t = 1; t < tData.length; t++) {
        var desc = String(tData[t][6] || "").toLowerCase();
        var est = String(tData[t][5] || "").toLowerCase();
        if (desc.indexOf("recuperacion") !== -1 && desc.indexOf(String(socioId2).toLowerCase()) !== -1 && est !== "completada") {
          tareasSheet.getRange(t + 1, 6).setValue("Completada");
        }
      }

      autos.appendRow([nextId, "Regularizacion", socioId2,
        "Impago regularizado - " + sNombre,
        "Completado", now, now,
        "Cobro recuperado " + sCuota + " EUR + socio reactivado + tarea cerrada + agenda financiera actualizada"]);

      // Agenda financiera: mover la fila en riesgo a confirmado + previsión próxima
      if (finance) {
        var fRow2 = findFinanceRowForSocio(finance, socioId2);
        if (fRow2 > 0) {
          setFinanceEstado(finance, fRow2, "confirmado", "Regularizacion", "Cobro recuperado tras gestion de impago");
        }
        appendFinanceRow(finance, [isoOffsetDate(30), "ingreso", "cuota", sSede, socioId2,
          sCuota, "esperado", "pagos", "Regularizacion", "Siguiente cobro recurrente"]);
      }

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok", action: "regularize", socio_id: socioId2, socio_nombre: sNombre,
        pago_id: newPagoId2, auto_id: nextId,
        mensaje: "Impago regularizado para " + sNombre + ". Cobro recuperado " + sCuota + " EUR. Tarea cerrada. Agenda financiera actualizada (riesgo -> confirmado).",
        timestamp: now
      }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      error: "Accion no reconocida. Usa action=state|activation|lead|retention|regularize|reset|warmup|setup"
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/* ---------- STATE builder ---------- */
function buildStatePayload(ss, detailFull) {
  var socios = ss.getSheetByName("socios");
  var leadsSheet = ss.getSheetByName("leads");
  var autos = ss.getSheetByName("automatizaciones");
  var financeSheet = getFinanceSheet(ss);

  var sociosData = socios.getDataRange().getValues();
  var totalSocios = sociosData.length - 1;
  var activos = sociosData.filter(function(r,i){ return i > 0 && r[8] === "Activo"; }).length;
  var impagos = sociosData.filter(function(r,i){ return i > 0 && r[8] === "Impago"; }).length;
  var premiumIA = sociosData.filter(function(r,i){ return i > 0 && r[11] === "Si"; }).length;

  var leadsData = leadsSheet.getDataRange().getValues();
  var totalLeads = leadsData.length - 1;
  var nuevos = leadsData.filter(function(r,i){ return i > 0 && r[7] === "Nuevo"; }).length;

  var autosData = autos.getDataRange().getValues();
  var totalAutos = autosData.length - 1;
  var enCurso = autosData.filter(function(r,i){ return i > 0 && r[4] === "En curso"; }).length;

  var result = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "v2",
    resumen: {
      socios_total: totalSocios, socios_activos: activos,
      socios_impago: impagos, socios_premium_ia: premiumIA,
      leads_total: totalLeads, leads_nuevos: nuevos,
      automatizaciones_total: totalAutos, automatizaciones_en_curso: enCurso,
      cuota_media: "41.90 EUR", retencion_estimada: "89%"
    }
  };

  if (detailFull) {
    result.snapshot = {
      socios: sheetToObjects(socios, ["id_socio","nombre","apellidos","email","telefono","sede","plan","fecha_alta","estado","cuota","ultimo_pago","premium_ia"]),
      leads: sheetToObjects(leadsSheet, ["id_lead","canal","nombre","email","telefono","sede_interes","score","estado","siguiente_accion"]),
      logs: sheetToObjects(autos, ["id_evento","trigger","entidad","detalle","estado","hora_inicio","hora_fin","resultado"])
    };

    if (financeSheet && financeSheet.getLastRow() >= 2) {
      result.snapshot.finanzas = sheetToObjects(financeSheet);
    }
  }

  return result;
}

/* ---------- WEB APP: doGet ---------- */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "state";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "warmup") {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok", action: "warmup", version: "v2", timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "reset" || action === "setup") {
    setupSheet();
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok", action: action, version: "v2",
      mensaje: "Hoja reseteada a estado v2. 7 pestanas con datos sinteticos.",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "state") {
    var detail = (e && e.parameter && e.parameter.detail) ? e.parameter.detail : "";
    var result = buildStatePayload(ss, detail === "full");
    return ContentService.createTextOutput(JSON.stringify(result, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "activation" || action === "lead" || action === "retention" || action === "detection" || action === "regularize") {
    return handleTrigger(action, e.parameter || {}, ss);
  }

  return ContentService.createTextOutput(JSON.stringify({
    error: "Accion no reconocida. Usa ?action=state|activation|lead|retention|regularize|reset|warmup|setup"
  })).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- WEB APP: doPost ---------- */
function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch(err) {
    if (e && e.parameter) body = e.parameter;
  }
  var action = body.action || (e.parameter ? e.parameter.action : "");
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "warmup") {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok", action: "warmup", version: "v2", timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "reset" || action === "setup") {
    setupSheet();
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok", action: action, version: "v2",
      mensaje: "Hoja reseteada a estado v2.",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return handleTrigger(action, body, ss);
}
