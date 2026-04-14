/* ============================================================
   WiFit Live Demo - Apps Script (bound to Google Sheet)
   ============================================================
   - setupSheet(): crea las 6 pestanas y rellena datos fake
   - doGet(e):  GET ?action=state|activation|lead|retention
                     &detail=full  (snapshot completo)
   - doPost(e): POST (mismas acciones, para compatibilidad)
   ============================================================ */

/* ---------- SETUP: crear pestanas y rellenar datos ---------- */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var def = ss.getSheetByName("Sheet1");

  // --- SOCIOS ---
  var sh = ss.getSheetByName("socios") || ss.insertSheet("socios");
  sh.clear();
  sh.appendRow(["id_socio","nombre","apellidos","email","telefono","sede","plan","fecha_alta","estado","cuota","ultimo_pago","premium_ia"]);
  var socios = [
    ["S001","Manuel","Garcia Lopez","manuel.garcia@demo.com","612345001","WiFit Retiro","Mensual","2024-03-15","Activo","41.90","2025-04-12","Si"],
    ["S002","Laura","Sanchez Ruiz","laura.sanchez@demo.com","612345002","WiFit Chamberi","Trimestral","2024-06-22","Activo","116.70","2025-04-01","No"],
    ["S003","Carlos","Fernandez Torres","carlos.fernandez@demo.com","612345003","WiFit Humanes","Mensual","2024-01-10","Impago","41.90","2025-03-15","Si"],
    ["S004","Ana","Martinez Diaz","ana.martinez@demo.com","612345004","WiFit Retiro","Anual","2023-09-01","Activo","394.80","2025-01-01","Si"],
    ["S005","Pablo","Ruiz Moreno","pablo.ruiz@demo.com","612345005","WiFit Moratalaz","Mensual","2024-11-03","Activo","41.90","2025-04-10","No"],
    ["S006","Elena","Lopez Navarro","elena.lopez@demo.com","612345006","WiFit Guindalera","Mensual","2024-07-18","Activo","41.90","2025-04-11","Si"],
    ["S007","Javier","Hernandez Gil","javier.hernandez@demo.com","612345007","WiFit Puerta de Hierro","Trimestral","2024-04-05","Activo","116.70","2025-03-05","No"],
    ["S008","Maria","Ortega Vega","maria.ortega@demo.com","612345008","WiFit Retiro","Mensual","2024-08-20","Activo","41.90","2025-04-08","Si"],
    ["S009","Daniel","Martin Ramos","daniel.martin@demo.com","612345009","WiFit Chamberi","Anual","2024-02-14","Activo","394.80","2025-02-14","Si"],
    ["S010","Sofia","Perez Castro","sofia.perez@demo.com","612345010","WiFit Humanes","Mensual","2025-01-07","Activo","41.90","2025-04-07","No"],
    ["S011","Raul","Gomez Blanco","raul.gomez@demo.com","612345011","WiFit Lopez de Hoyos","Mensual","2024-10-12","Impago","41.90","2025-02-12","No"],
    ["S012","Lucia","Alvarez Prieto","lucia.alvarez@demo.com","612345012","WiFit Moratalaz","Trimestral","2024-05-30","Activo","116.70","2025-03-30","Si"],
    ["S013","Sergio","Diaz Romero","sergio.diaz@demo.com","612345013","WiFit Guindalera","Mensual","2025-02-01","Activo","41.90","2025-04-01","No"],
    ["S014","Carmen","Jimenez Soto","carmen.jimenez@demo.com","612345014","WiFit Retiro","Mensual","2024-12-10","Activo","41.90","2025-04-10","Si"],
    ["S015","Andres","Vazquez Molina","andres.vazquez@demo.com","612345015","WiFit Puerta de Hierro","Mensual","2025-03-01","Activo","41.90","2025-04-01","No"]
  ];
  socios.forEach(function(r){ sh.appendRow(r); });
  sh.getRange("1:1").setFontWeight("bold").setBackground("#99b912").setFontColor("#ffffff");
  sh.setFrozenRows(1);

  // --- PAGOS ---
  var shP = ss.getSheetByName("pagos") || ss.insertSheet("pagos");
  shP.clear();
  shP.appendRow(["id_pago","id_socio","fecha","importe","metodo","estado","proximo_cobro","invoice_id"]);
  var pagos = [
    ["P001","S001","2025-04-12","41.90","Tarjeta","Confirmado","2025-05-12","INV-20250412-001"],
    ["P002","S002","2025-04-01","116.70","Tarjeta","Confirmado","2025-07-01","INV-20250401-002"],
    ["P003","S003","2025-03-15","41.90","Domiciliacion","Fallido","2025-04-15","INV-20250315-003"],
    ["P004","S004","2025-01-01","394.80","Tarjeta","Confirmado","2026-01-01","INV-20250101-004"],
    ["P005","S005","2025-04-10","41.90","Tarjeta","Confirmado","2025-05-10","INV-20250410-005"],
    ["P006","S006","2025-04-11","41.90","Domiciliacion","Confirmado","2025-05-11","INV-20250411-006"],
    ["P007","S007","2025-03-05","116.70","Tarjeta","Confirmado","2025-06-05","INV-20250305-007"],
    ["P008","S008","2025-04-08","41.90","Tarjeta","Confirmado","2025-05-08","INV-20250408-008"],
    ["P009","S009","2025-02-14","394.80","Domiciliacion","Confirmado","2026-02-14","INV-20250214-009"],
    ["P010","S010","2025-04-07","41.90","Tarjeta","Confirmado","2025-05-07","INV-20250407-010"],
    ["P011","S011","2025-02-12","41.90","Domiciliacion","Fallido","2025-03-12","INV-20250212-011"],
    ["P012","S012","2025-03-30","116.70","Tarjeta","Confirmado","2025-06-30","INV-20250330-012"],
    ["P013","S013","2025-04-01","41.90","Tarjeta","Confirmado","2025-05-01","INV-20250401-013"],
    ["P014","S014","2025-04-10","41.90","Domiciliacion","Confirmado","2025-05-10","INV-20250410-014"],
    ["P015","S015","2025-04-01","41.90","Tarjeta","Confirmado","2025-05-01","INV-20250401-015"]
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
    ["R001","S001","WiHiit","WiFit Retiro","2025-04-15 07:30","Confirmada"],
    ["R002","S008","Body Balance","WiFit Retiro","2025-04-15 19:00","Confirmada"],
    ["R003","S009","Body Pump","WiFit Chamberi","2025-04-15 07:30","Confirmada"],
    ["R004","S005","Spinning","WiFit Moratalaz","2025-04-15 18:30","Confirmada"],
    ["R005","S006","Pilates","WiFit Guindalera","2025-04-16 10:00","Pendiente"],
    ["R006","S012","Zumba","WiFit Moratalaz","2025-04-16 19:00","Pendiente"],
    ["R007","S014","GAP","WiFit Retiro","2025-04-16 18:00","Confirmada"],
    ["R008","S002","Body Combat","WiFit Chamberi","2025-04-17 19:30","Pendiente"],
    ["R009","S007","HIIT","WiFit Puerta de Hierro","2025-04-17 08:00","Confirmada"],
    ["R010","S004","Pilates","WiFit Retiro","2025-04-17 11:00","Confirmada"]
  ];
  reservas.forEach(function(r){ shR.appendRow(r); });
  shR.getRange("1:1").setFontWeight("bold").setBackground("#007f68").setFontColor("#ffffff");
  shR.setFrozenRows(1);

  // --- AUTOMATIZACIONES ---
  var shA = ss.getSheetByName("automatizaciones") || ss.insertSheet("automatizaciones");
  shA.clear();
  shA.appendRow(["id_evento","trigger","entidad","detalle","estado","hora_inicio","hora_fin","resultado"]);
  var autos = [
    ["A001","Pago confirmado","S001","Cobro mensual 41.90 EUR","Completado","2025-04-12 09:14","2025-04-12 09:14","Socio activado + email bienvenida + IA asignada"],
    ["A002","Lead nuevo","L001","Instagram lead score 82","Completado","2025-04-12 08:45","2025-04-12 08:45","Scoring + email prueba gratis enviado"],
    ["A003","Pago fallido","S003","Domiciliacion rechazada","En curso","2025-04-11 17:30","","Aviso enviado + tarea creada para gestor"],
    ["A004","Pago confirmado","S005","Cobro mensual 41.90 EUR","Completado","2025-04-10 10:22","2025-04-10 10:22","Socio activado + plan semana generado"],
    ["A005","Lead nuevo","L004","Web organica score 91","Completado","2025-04-10 14:10","2025-04-10 14:10","Scoring + propuesta plan anual"],
    ["A006","Pago fallido","S011","Domiciliacion rechazada 2o intento","En curso","2025-04-09 16:00","","Aviso + oferta recuperacion enviada"]
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

  if (def) {
    try { ss.deleteSheet(def); } catch(e) {}
  }

  SpreadsheetApp.flush();
  Logger.log("Setup completado: 6 pestanas creadas con datos fake WiFit");
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
      obj[headers[j]] = data[i][j] !== undefined ? String(data[i][j]) : "";
    }
    rows.push(obj);
  }
  return rows;
}

/* ---------- SHARED: handleTrigger ---------- */
function handleTrigger(action, params, ss) {
  var autos = ss.getSheetByName("automatizaciones");
  var now = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd HH:mm");
  var nextId = "A" + String(autos.getLastRow()).padStart(3, "0");

  if (action === "activation") {
    var socios = ss.getSheetByName("socios");
    var pagos = ss.getSheetByName("pagos");
    var nombre = params.nombre || "Nuevo Socio Demo";
    var sede = params.sede || "WiFit Retiro";
    var newId = "S" + String(socios.getLastRow()).padStart(3, "0");
    var newPagoId = "P" + String(pagos.getLastRow()).padStart(3, "0");

    socios.appendRow([newId, nombre.split(" ")[0], nombre.split(" ").slice(1).join(" ") || "Demo",
      nombre.toLowerCase().replace(/ /g,".") + "@demo.com", "612000000", sede,
      "Mensual", Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"),
      "Activo", "41.90", Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"), "Si"]);

    pagos.appendRow([newPagoId, newId, Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"),
      "41.90", "Tarjeta", "Confirmado",
      Utilities.formatDate(new Date(Date.now() + 30*86400000), "Europe/Madrid", "yyyy-MM-dd"),
      "INV-" + Utilities.formatDate(new Date(), "Europe/Madrid", "yyyyMMdd") + "-" + newId]);

    autos.appendRow([nextId, "Pago confirmado", newId,
      "Cobro mensual 41.90 EUR - " + nombre,
      "Completado", now, now,
      "Socio activado + email bienvenida + IA premium asignada + plan semana 1 generado"]);

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
    var sede = params.sede || "WiFit Retiro";
    var score = Math.floor(Math.random() * 40) + 55;
    var newId = "L" + String(leadsSheet.getLastRow()).padStart(3, "0");

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
      var tId = "T" + String(tareas.getLastRow()).padStart(3, "0");
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

  if (action === "retention") {
    var sociosSheet = ss.getSheetByName("socios");
    var socioId = params.socio_id || "S003";

    var sociosData = sociosSheet.getDataRange().getValues();
    var socioRow = -1;
    var socioNombre = "Socio";
    for (var i = 1; i < sociosData.length; i++) {
      if (sociosData[i][0] === socioId) {
        socioRow = i + 1;
        socioNombre = sociosData[i][1] + " " + sociosData[i][2];
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
    var tId = "T" + String(tareas.getLastRow()).padStart(3, "0");
    tareas.appendRow([tId, "Cobros", "WiFit Retiro", "Sistema", "Alta", "En curso",
      "Recuperacion impago " + socioNombre + " (" + socioId + ")"]);

    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok", action: "retention", socio_id: socioId, socio_nombre: socioNombre,
      auto_id: nextId, tarea_id: tId,
      mensaje: "Impago detectado para " + socioNombre + ". Aviso enviado. Tarea de recuperacion creada.",
      timestamp: now
    }, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    error: "Accion no reconocida. Usa action=state|activation|lead|retention"
  })).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- WEB APP: doGet ---------- */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "state";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "state") {
    var socios = ss.getSheetByName("socios");
    var leadsSheet = ss.getSheetByName("leads");
    var autos = ss.getSheetByName("automatizaciones");

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
      resumen: {
        socios_total: totalSocios, socios_activos: activos,
        socios_impago: impagos, socios_premium_ia: premiumIA,
        leads_total: totalLeads, leads_nuevos: nuevos,
        automatizaciones_total: totalAutos, automatizaciones_en_curso: enCurso,
        cuota_media: "41.90 EUR", retencion_estimada: "89%"
      }
    };

    var detail = (e && e.parameter && e.parameter.detail) ? e.parameter.detail : "";
    if (detail === "full") {
      result.snapshot = {
        socios: sheetToObjects(socios, ["id_socio","nombre","apellidos","email","telefono","sede","plan","fecha_alta","estado","cuota","ultimo_pago","premium_ia"]),
        leads: sheetToObjects(leadsSheet, ["id_lead","canal","nombre","email","telefono","sede_interes","score","estado","siguiente_accion"]),
        logs: sheetToObjects(autos, ["id_evento","trigger","entidad","detalle","estado","hora_inicio","hora_fin","resultado"])
      };
    }

    return ContentService.createTextOutput(JSON.stringify(result, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Trigger actions via GET (compatibilidad Google Workspace)
  if (action === "activation" || action === "lead" || action === "retention") {
    return handleTrigger(action, e.parameter || {}, ss);
  }

  return ContentService.createTextOutput(JSON.stringify({
    error: "Accion no reconocida. Usa ?action=state|activation|lead|retention"
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
  return handleTrigger(action, body, ss);
}
