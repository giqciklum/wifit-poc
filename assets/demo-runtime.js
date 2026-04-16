(() => {
    const STORAGE_KEY = "wifit_runtime_v1";
    const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec";
    const BACKEND_TIMEOUT = 10000;
    const BACKEND_FULL_TIMEOUT = 15000;
    const BACKEND_MAX_FAILURES = 2;
    const BACKEND_POLL_INTERVAL = 12000;
    const IS_PRESENT_MODE = (() => {
        try {
            return new URLSearchParams(window.location.search).get("mode") === "present";
        } catch (_) {
            return false;
        }
    })();

    const deepClone = (value) => JSON.parse(JSON.stringify(value));

    const backend = {
        mode: "local",
        liveState: null,
        lastError: null,
        checking: false,
        lastSyncedAt: null,
        lastDigest: null,
        pollTimer: null,
        snapshot: null,
        hasFullSnapshot: false,
        version: null,
        warmupStarted: false,
        snapshotChecking: false,
        failureCount: 0
    };

    // Fire-and-forget warmup para tumbar el cold start del Apps Script.
    // No bloquea nada, no actualiza UI; solo precalienta la instancia
    // antes de que el usuario toque nada.
    function warmupBackend() {
        if (backend.warmupStarted) return;
        backend.warmupStarted = true;
        try {
            const url = BACKEND_URL + "?action=warmup&t=" + Date.now();
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
            fetch(url, { signal: controller.signal, cache: "no-store" })
                .then(() => clearTimeout(timer))
                .catch(() => clearTimeout(timer));
        } catch (_) { /* no-op */ }
    }

    function formatClock(value) {
        if (!value) return "Pendiente";
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return "Pendiente";
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }

    function buildDigest(value) {
        try {
            return JSON.stringify(value || {});
        } catch (error) {
            return String(Date.now());
        }
    }

    function normalizeYesNo(value) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        return ["si", "sí", "yes", "true", "1", "activo", "activa"].includes(raw) ? "Sí" : "No";
    }

    function normalizeSocioStatus(value) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        if (raw.includes("impago")) return "Impago";
        if (raw.includes("pend")) return "Pendiente";
        return "Activo";
    }

    function normalizeLeadChannel(value) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        if (raw.includes("insta")) return "instagram";
        if (raw.includes("meta") || raw.includes("facebook")) return "meta";
        return "google";
    }

    function normalizeLeadStatus(value) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        if (raw.includes("conver")) return "Convertido";
        if (raw.includes("visit")) return "Visita";
        if (raw.includes("contact")) return "Contactado";
        return "Nuevo";
    }

    function normalizeDrivers(value) {
        if (Array.isArray(value) && value.every((item) => Array.isArray(item))) {
            return value.map(([label, score]) => [String(label || "Driver"), Number(score || 0)]);
        }
        if (Array.isArray(value)) {
            return value.slice(0, 3).map((item, index) => [String(item.label || item.titulo || item.name || `Driver ${index + 1}`), Number(item.score || item.valor || 0)]);
        }
        return [["Intención", 84], ["Cercanía", 79], ["Encaje horario", 76]];
    }

    function normalizeSocioRows(rows) {
        if (!Array.isArray(rows)) return null;
        const normalized = rows.map((row, index) => {
            if (Array.isArray(row)) {
                return [
                    String(row[0] || `S${String(index + 1).padStart(3, "0")}`),
                    row[1] || "",
                    row[2] || "",
                    row[3] || "",
                    row[5] || "",
                    row[6] || "",
                    row[7] || "",
                    normalizeSocioStatus(row[8] || "Activo"),
                    row[9] || "",
                    row[10] || "",
                    normalizeYesNo(row[11] || "No")
                ];
            }
            if (!row || typeof row !== "object") return null;
            return [
                String(row.id || row.id_socio || row.socio_id || `S${String(index + 1).padStart(3, "0")}`),
                row.nombre || "",
                row.apellidos || row.apellido || "",
                row.email || row.correo || "",
                row.sede || row.sede_interes || row.club || "",
                row.plan || row.membresia || "",
                row.fecha_alta || row.alta || row.created_at || "",
                normalizeSocioStatus(row.estado || "Activo"),
                row.cuota || row.importe || row.cuota_mensual || row.cuota_media || "",
                row.ultimo_pago || row.fecha_ultimo_pago || row.proximo_cobro || row.fecha_pago || "",
                normalizeYesNo(row.premium_ia || row.ai_premium || row.servicio_ia || row.ia_activa || "No")
            ];
        }).filter(Boolean);
        return normalized.length ? normalized : null;
    }

    function normalizeLeadRows(rows) {
        if (!Array.isArray(rows)) return null;
        const normalized = rows.map((row, index) => {
            if (Array.isArray(row)) {
                return {
                    id: String(row[0] || `lead-live-${index + 1}`),
                    canal: normalizeLeadChannel(row[1] || "google"),
                    nombre: row[2] || "",
                    sede: row[5] || "WiFit",
                    estado: normalizeLeadStatus(row[7] || "Nuevo"),
                    score: Number(row[6] || 75),
                    detalle: "Lead sincronizado desde Google Sheets.",
                    siguiente: row[8] || "Revisar siguiente acción comercial.",
                    drivers: normalizeDrivers()
                };
            }
            if (!row || typeof row !== "object") return null;
            return {
                id: String(row.id || row.id_lead || `lead-live-${index + 1}`),
                canal: normalizeLeadChannel(row.canal || row.source || "google"),
                nombre: row.nombre || row.name || "",
                sede: row.sede || row.sede_interes || row.club || "WiFit",
                estado: normalizeLeadStatus(row.estado || "Nuevo"),
                score: Number(row.score || row.puntuacion || 75),
                detalle: row.detalle || row.descripcion || row.interes || "Lead sincronizado desde Google Sheets.",
                siguiente: row.siguiente || row.siguiente_accion || row.next_action || "Revisar siguiente acción comercial.",
                drivers: normalizeDrivers(row.drivers || row.factores || row.criterios)
            };
        }).filter(Boolean);
        return normalized.length ? normalized : null;
    }

    function normalizeLogRows(rows) {
        if (!Array.isArray(rows)) return null;
        const normalized = rows.map((row, index) => {
            if (Array.isArray(row)) {
                return {
                    tipo: row[0] || "Operación",
                    titulo: row[1] || `Actualización ${index + 1}`,
                    texto: row[2] || row[3] || "Registro sincronizado desde Google Sheets."
                };
            }
            if (!row || typeof row !== "object") return null;
            return {
                tipo: row.tipo || row.categoria || row.trigger || row.accion || "Operación",
                titulo: row.titulo || row.nombre || row.asunto || row.evento || `Actualización ${index + 1}`,
                texto: row.texto || row.detalle || row.resultado || row.estado || "Registro sincronizado desde Google Sheets."
            };
        }).filter(Boolean);
        return normalized.length ? normalized.slice(0, 6) : null;
    }

    function parseFinanceNumber(value) {
        if (typeof value === "number") return value;
        const raw = String(value == null ? "" : value).trim();
        if (!raw) return 0;
        const normalized = raw
            .replace(/EUR|€/gi, "")
            .replace(/\s/g, "")
            .replace(/\.(?=\d{3}(?:\D|$))/g, "")
            .replace(",", ".");
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function normalizeObjectKeys(row) {
        const normalized = {};
        Object.keys(row || {}).forEach((key) => {
            const nextKey = String(key)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            normalized[nextKey] = row[key];
        });
        return normalized;
    }

    function normalizeFinanceFlow(value, amount) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        if (raw.includes("riesgo") || raw.includes("risk")) return "risk";
        if (raw.includes("salida") || raw.includes("out") || raw.includes("gasto") || raw.includes("expense") || raw.includes("pago")) return "outflow";
        if (raw.includes("entrada") || raw.includes("in") || raw.includes("ingreso") || raw.includes("revenue") || raw.includes("cobro")) return "inflow";
        return amount < 0 ? "outflow" : "inflow";
    }

    function normalizeFinanceType(value, fallbackFlow) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        if (raw.includes("gasto") || raw.includes("expense") || raw.includes("out")) return "gasto";
        if (raw.includes("ingreso") || raw.includes("revenue") || raw.includes("in") || raw.includes("cuota") || raw.includes("cobro")) return "ingreso";
        return fallbackFlow === "outflow" ? "gasto" : "ingreso";
    }

    function normalizeFinanceState(value, type, fallbackFlow) {
        const raw = String(value == null ? "" : value).trim().toLowerCase();
        if (raw.includes("riesgo") || raw.includes("risk") || fallbackFlow === "risk") return "riesgo";
        if (raw.includes("prev")) return "previsto";
        if (raw.includes("confirm")) return "confirmado";
        if (raw.includes("esper")) return "esperado";
        return type === "gasto" ? "previsto" : "esperado";
    }

    function formatLiveCurrency(value) {
        const raw = String(value == null ? "" : value).trim();
        if (!raw) return "--";
        const amount = parseFinanceNumber(raw);
        const hasDecimals = Math.abs(amount % 1) > 0.001;
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function normalizeFinanceRows(rows) {
        if (!Array.isArray(rows)) return null;
        const normalized = rows.map((row, index) => {
            if (!row || typeof row !== "object") return null;
            const normalizedRow = normalizeObjectKeys(row);
            const amount = parseFinanceNumber(
                normalizedRow.amount || normalizedRow.importe || normalizedRow.valor || normalizedRow.euros || normalizedRow.expected_amount || normalizedRow.monto
            );
            const rawDate = normalizedRow.date || normalizedRow.fecha || normalizedRow.fecha_evento || normalizedRow.fecha_prevista || normalizedRow.dia || "";
            const flowHint = normalizeFinanceFlow(
                normalizedRow.flow || normalizedRow.tipo || normalizedRow.movimiento || normalizedRow.kind || normalizedRow.sentido || normalizedRow.estado,
                amount
            );
            const tipo = normalizeFinanceType(
                normalizedRow.tipo || normalizedRow.movimiento || normalizedRow.kind || normalizedRow.sentido,
                flowHint
            );
            const estado = normalizeFinanceState(normalizedRow.estado || normalizedRow.status, tipo, flowHint);
            const flow = estado === "riesgo" ? "risk" : tipo === "gasto" ? "outflow" : "inflow";
            const categoria = String(
                normalizedRow.categoria || normalizedRow.category || normalizedRow.concepto || normalizedRow.tipo_gasto || normalizedRow.detalle || ""
            ).trim() || (tipo === "gasto" ? "gasto" : "cuota");
            const sede = String(
                normalizedRow.sede || normalizedRow.scope || normalizedRow.ambito || normalizedRow.centro || normalizedRow.area || ""
            ).trim() || "Cadena";
            const comentario = String(
                normalizedRow.comentario || normalizedRow.note || normalizedRow.nota || normalizedRow.observaciones || normalizedRow.detalle || normalizedRow.descripcion || ""
            ).trim();
            const triggerRelacionado = String(
                normalizedRow.trigger_relacionado || normalizedRow.trigger || normalizedRow.automatizacion || normalizedRow.evento || ""
            ).trim();
            return {
                fecha: rawDate,
                tipo: tipo,
                categoria: categoria,
                sede: sede,
                id_socio: String(normalizedRow.id_socio || normalizedRow.socio_id || normalizedRow.member_id || "").trim(),
                importe: Math.abs(amount),
                estado: estado,
                origen: String(normalizedRow.origen || normalizedRow.origin || "").trim(),
                trigger_relacionado: triggerRelacionado,
                comentario: comentario,
                date: rawDate,
                flow: flow,
                label: normalizedRow.label || normalizedRow.etiqueta || (flow === "outflow" ? "Gasto" : flow === "risk" ? "Riesgo" : "Ingreso"),
                concept: normalizedRow.concept || normalizedRow.concepto || normalizedRow.evento || normalizedRow.titulo || categoria || `Evento ${index + 1}`,
                scope: sede,
                amount: Math.abs(amount),
                note: comentario || estado
            };
        }).filter(Boolean);
        return normalized.length ? normalized : null;
    }

    function extractBackendSnapshot(data) {
        const raw = data && (data.snapshot || data.snapshots || data.data || data.hojas || data.detalle);
        if (!raw || typeof raw !== "object") return null;
        const snapshot = {};
        const socios = normalizeSocioRows(raw.socios || raw.members || raw.clientes);
        const liveLeads = normalizeLeadRows(raw.leads || raw.oportunidades);
        const logs = normalizeLogRows(raw.logs || raw.automatizaciones || raw.eventos);
        const finanzas = normalizeFinanceRows(
            raw.finanzas ||
            raw.finance ||
            raw.cash_forecast ||
            raw.financial_calendar ||
            raw.agenda_financiera
        );

        if (socios) snapshot.socios = socios;
        if (liveLeads) snapshot.leads = liveLeads;
        if (logs) snapshot.logs = logs;
        if (finanzas) snapshot.finanzas = finanzas;

        return Object.keys(snapshot).length ? snapshot : null;
    }

    function applyBackendSnapshot(snapshot) {
        if (!snapshot) return false;
        let changed = false;

        if (snapshot.socios) {
            replaceArray(sociosGestion, snapshot.socios);
            changed = true;
        }

        if (snapshot.leads) {
            replaceArray(leads, snapshot.leads);
            changed = true;
        }

        if (snapshot.logs) {
            estado.logs = deepClone(snapshot.logs);
            changed = true;
        }

        if (snapshot.finanzas && Array.isArray(estado.finanzasAgenda)) {
            estado.finanzasAgenda = deepClone(snapshot.finanzas);
            changed = true;
        }

        return changed;
    }

    function backendFetch(params, options) {
        const opts = options || {};
        const url = BACKEND_URL + "?" + new URLSearchParams(params).toString();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), opts.timeout || BACKEND_TIMEOUT);
        return fetch(url, { signal: controller.signal, cache: "no-store" })
            .then(function (resp) {
                clearTimeout(timer);
                if (!resp.ok) {
                    throw new Error(`HTTP ${resp.status}`);
                }
                return resp.json();
            })
            .catch(function (err) { clearTimeout(timer); throw err; });
    }

    function probeBackend(options) {
        const opts = Object.assign({ quiet: true, notifyOnChange: false, syncSnapshot: false, timeout: BACKEND_TIMEOUT }, options || {});
        if (backend.checking) return;
        backend.checking = true;
        renderBackendBadge();
        backendFetch({ action: "state" }, { timeout: opts.timeout })
            .then(function (data) {
                if (data && data.status === "ok") {
                    var digestChanged = !!backend.lastDigest && backend.lastDigest !== buildDigest(data.resumen);
                    var previousMode = backend.mode;
                    backend.mode = "live";
                    backend.liveState = data.resumen;
                    backend.lastSyncedAt = data.timestamp || new Date().toISOString();
                    backend.lastError = null;
                    backend.version = data.version || backend.version;
                    backend.lastDigest = buildDigest(data.resumen);
                    backend.failureCount = 0;

                    renderRuntimeShell();
                    if (typeof renderSocio === "function") renderSocio();
                    if (typeof renderGestion === "function") renderGestion();

                    if (opts.notifyOnChange && digestChanged) {
                        showToast(
                            backend.hasFullSnapshot ? "Datos sincronizados" : "KPIs actualizados",
                            backend.hasFullSnapshot
                                ? "La página ha refrescado datos reales desde Google Sheets."
                                : "Los indicadores en vivo se han refrescado desde Google Sheets."
                        );
                    }

                    if (previousMode !== "live" && !opts.quiet) {
                        showToast("Backend conectado", "La demo ya está leyendo el estado vivo del backend.");
                    }

                    if ((opts.syncSnapshot || !backend.hasFullSnapshot || digestChanged) && !backend.snapshotChecking) {
                        syncBackendSnapshot({ notifyOnChange: opts.notifyOnChange && !digestChanged });
                    }
                } else {
                    backend.lastError = "Respuesta inesperada";
                    backend.failureCount += 1;
                    if (backend.mode !== "live" || backend.failureCount >= BACKEND_MAX_FAILURES) {
                        backend.mode = "local";
                    }
                }
            })
            .catch(function (err) {
                backend.lastError = err.message || "Error de red";
                backend.failureCount += 1;
                if (backend.mode !== "live" || backend.failureCount >= BACKEND_MAX_FAILURES) {
                    backend.mode = "local";
                }
            })
            .finally(function () {
                backend.checking = false;
                renderBackendBadge();
                renderRuntimeShell();
            });
    }

    function syncBackendSnapshot(options) {
        const opts = Object.assign({ notifyOnChange: false, timeout: BACKEND_FULL_TIMEOUT }, options || {});
        if (backend.snapshotChecking) return;
        backend.snapshotChecking = true;

        backendFetch({ action: "state", detail: "full" }, { timeout: opts.timeout })
            .then(function (data) {
                if (!(data && data.status === "ok")) {
                    throw new Error("Respuesta inesperada");
                }
                var previousSnapshotDigest = buildDigest(backend.snapshot);
                var snapshot = extractBackendSnapshot(data);
                backend.mode = "live";
                backend.liveState = data.resumen || backend.liveState;
                backend.lastSyncedAt = data.timestamp || new Date().toISOString();
                backend.lastError = null;
                backend.version = data.version || backend.version;
                backend.snapshot = snapshot;
                backend.hasFullSnapshot = !!snapshot;
                backend.failureCount = 0;
                applyBackendSnapshot(snapshot);

                renderRuntimeShell();
                if (typeof renderSocio === "function") renderSocio();
                if (typeof renderGestion === "function") renderGestion();

                if (opts.notifyOnChange && previousSnapshotDigest && previousSnapshotDigest !== buildDigest(snapshot)) {
                    showToast("Datos sincronizados", "La página ha refrescado filas reales desde Google Sheets.");
                }
            })
            .catch(function (err) {
                backend.lastError = err.message || "Error de red";
            })
            .finally(function () {
                backend.snapshotChecking = false;
                renderBackendBadge();
                renderRuntimeShell();
            });
    }

    function triggerBackendAction(actionName, params) {
        var query = Object.assign({ action: actionName }, params || {});
        return backendFetch(query)
            .then(function (data) {
                if (data && data.status === "ok") {
                    backend.lastError = null;
                    return data;
                }
                throw new Error("Backend respondió con error");
            })
            .catch(function (err) {
                backend.lastError = err.message || "Error de red";
                return null;
            });
    }

    function renderBackendBadge() {
        var el = document.getElementById("backend-mode-badge");
        if (!el) return;
        if (backend.checking && backend.mode !== "live") {
            el.className = "backend-badge syncing";
            el.innerHTML = '<span class="badge-dot"></span> Conectando backend';
            el.title = "Pidiendo estado al Apps Script...";
        } else if (backend.mode === "live") {
            el.className = "backend-badge live";
            var tag = backend.version ? (" · " + backend.version) : "";
            el.innerHTML = '<span class="badge-dot"></span> Backend en vivo' + tag;
            el.title = "Leyendo Google Sheets en tiempo real" + (backend.lastSyncedAt ? (" · Ultima sync: " + backend.lastSyncedAt) : "");
        } else {
            el.className = "backend-badge local";
            el.innerHTML = '<span class="badge-dot"></span> Modo demo local';
            el.title = backend.lastError ? ("Backend no alcanzable: " + backend.lastError) : "Mostrando datos seed locales";
        }
    }

    const scenarioLibrary = {
        defaultScenario: "activation",
        scenarios: {
            activation: {
                badge: "Cobros",
                label: "Activación premium",
                summary: "Un cobro confirmado activa la capa premium, genera comunicaciones y deja al socio listo para entrenar.",
                flow: "activation",
                memberProfile: "manuel",
                canalLead: "instagram",
                selectedLead: "lead-1",
                status: {
                    badge: "Cobro confirmado",
                    title: "Activación premium conectada",
                    text: "La demo mantiene el estado de alta, comunicaciones y outputs generados incluso si recargas la página."
                },
                toast: {
                    title: "Activación completada",
                    text: "Manuel ya tiene IA premium, bienvenida enviada y plan de semana 1 generado."
                },
                memberSync: {
                    tone: "success",
                    label: "Servicio activo",
                    title: "Manuel ya ve una experiencia ampliada dentro de WiFit",
                    text: "El cobro validado activa acceso, plan de semana, sugerencia de clase y seguimiento sin trabajo manual adicional.",
                    actions: ["QR activo", "Semana 1 enviada", "Coach premium", "Reserva sugerida"]
                },
                phoneNotice: {
                    tone: "success",
                    title: "IA Premium activa",
                    text: "Ya tienes disponible tu plan personalizado de la semana y una propuesta de clase en Retiro."
                },
                tablePatches: [
                    { id: "001", values: { 9: "14/04/2026", 10: "Sí" } }
                ],
                chatPatches: [
                    {
                        profile: "manuel",
                        messages: [
                            { tipo: "ia", texto: "Tu servicio WiFit IA Premium ya está activo. He preparado la semana 1, te recomiendo WiHiit mañana a las 07:30 y te dejo el seguimiento listo tras cada check-in." }
                        ]
                    }
                ],
                artifacts: [
                    {
                        id: "welcome-mail",
                        kind: "Correo",
                        title: "Bienvenida a WiFit IA Premium",
                        summary: "Email enviado a Manuel con acceso, QR, primer plan y próxima clase sugerida.",
                        meta: ["manuel@miwifit.app", "Retiro", "Enviado 07:46"],
                        detail: {
                            title: "Asunto: Ya tienes activo tu servicio WiFit IA Premium",
                            subtitle: "Canal: correo transaccional / activación",
                            paragraphs: [
                                "Hola Manuel, tu activación premium ya está completada.",
                                "Desde este momento puedes consultar tu rutina diaria, recomendaciones de clase, nutrición y progreso dentro de la experiencia WiFit IA.",
                                "Tu primera sugerencia es WiHiit mañana a las 07:30 en WiFit Retiro, una franja con baja ocupación y buen encaje con tu objetivo."
                            ],
                            bullets: [
                                "QR de acceso y estado de cuenta actualizados",
                                "Semana 1 generada automáticamente",
                                "Reserva sugerida preparada para la siguiente visita"
                            ]
                        }
                    },
                    {
                        id: "invoice",
                        kind: "Factura",
                        title: "Factura WF-2026-0414-001",
                        summary: "Comprobante emitido tras el cobro validado y registrado en la hoja operativa.",
                        meta: ["41,90 €", "Mensual", "Pagado"],
                        detail: {
                            title: "Comprobante de activación",
                            subtitle: "Origen: pasarela de pago / conciliación",
                            paragraphs: [
                                "Cobro validado correctamente por 41,90 € para la cuota mensual.",
                                "El registro ha quedado sincronizado con el estado del socio y con la activación del servicio premium.",
                                "Esta misma señal puede alimentar conciliación, reporting y seguimiento de renovaciones."
                            ],
                            bullets: [
                                "Estado del pago: confirmado",
                                "Suscripción: mensual",
                                "Servicio premium activado en el mismo flujo"
                            ]
                        }
                    },
                    {
                        id: "plan-week-1",
                        kind: "Plan IA",
                        title: "Semana 1 generada automáticamente",
                        summary: "Rutina, nutrición y recomendación de clase creadas en el momento de la activación.",
                        meta: ["Tren superior", "WiHiit", "Objetivo masa"],
                        detail: {
                            title: "Plan inicial del socio",
                            subtitle: "Motor: WiFit IA / perfil Manuel García",
                            paragraphs: [
                                "El sistema genera una primera semana con base en objetivo, patrón de uso y disponibilidad de la sede.",
                                "La recomendación evita horas de alta ocupación y combina fuerza con una clase corta para mantener adherencia.",
                                "El mismo output puede entregarse en app, correo, pantalla o kiosco."
                            ],
                            bullets: [
                                "Sesión principal: tren superior 55 min",
                                "Clase sugerida: WiHiit mañana 07:30",
                                "Seguimiento nutricional alineado con ganancia de masa"
                            ]
                        }
                    },
                    {
                        id: "cash-forecast",
                        kind: "Forecast",
                        title: "Previsión de caja actualizada",
                        summary: "El cobro confirmado entra en agenda financiera y ajusta la lectura de caja prevista a 30 días.",
                        meta: ["30 días", "Cobro conciliado", "Forecast"],
                        detail: {
                            title: "Agenda financiera actualizada",
                            subtitle: "Origen: cobro confirmado / lectura CFO",
                            paragraphs: [
                                "La misma señal que activa al socio consolida el ingreso dentro de la agenda financiera.",
                                "Así la dirección puede ver cobros esperados, salidas previstas y caja neta sin separar operación y finanzas.",
                                "La demo no enseña solo una factura: enseña cómo ese cobro mueve forecast y previsión de caja."
                            ],
                            bullets: [
                                "Próximos ingresos esperados refrescados",
                                "Caja neta prevista ajustada",
                                "Trazabilidad financiera visible en el mismo flujo"
                            ]
                        }
                    }
                ],
                events: [
                    { time: "07:45", title: "Cobro confirmado", detail: "La pasarela valida el pago mensual y actualiza el estado del socio." },
                    { time: "07:45", title: "Servicio activado", detail: "La cuenta premium queda habilitada sin esperar gestión manual." },
                    { time: "07:46", title: "Bienvenida enviada", detail: "Se genera email de activación con QR, siguiente paso y recomendaciones." },
                    { time: "07:46", title: "Previsión de caja actualizada", detail: "El ingreso confirmado entra en agenda financiera y refresca el forecast de caja a 30 días." },
                    { time: "07:46", title: "Plan IA preparado", detail: "WiFit IA construye la primera semana y propone una clase en Retiro." }
                ]
            },
            lead: {
                badge: "Leads",
                label: "Lead de prueba",
                summary: "La captación deja de ser una lista y se convierte en una secuencia de scoring, contacto y reserva sugerida.",
                flow: "lead",
                memberProfile: "maria",
                canalLead: "google",
                selectedLead: "lead-5",
                status: {
                    badge: "Lead priorizado",
                    title: "Conversión guiada desde el primer minuto",
                    text: "La señal de intención ya genera scoring, propuesta de prueba y una siguiente mejor acción lista para el equipo."
                },
                toast: {
                    title: "Lead priorizado",
                    text: "El nuevo lead ya tiene score, mensaje de prueba y siguiente acción comercial preparada."
                },
                memberSync: {
                    tone: "info",
                    label: "Onboarding preparado",
                    title: "La experiencia del socio puede activarse antes incluso del alta",
                    text: "La misma lógica que convierte un lead prepara ya la prueba, la franja sugerida y el futuro journey del socio.",
                    actions: ["Pase de prueba", "Mensaje inmediato", "Clase sugerida", "Seguimiento comercial"]
                },
                phoneNotice: {
                    tone: "info",
                    title: "Prueba gratuita preparada",
                    text: "Este mismo entorno puede activarse al convertir el lead, sin rehacer el journey desde cero."
                },
                leadPatches: [
                    { id: "lead-5", values: { estado: "Contactado", score: 89, siguiente: "Enviar pase de prueba hoy, proponer visita mañana a las 07:30 y confirmar por WhatsApp si responde." } }
                ],
                artifacts: [
                    {
                        id: "trial-pass",
                        kind: "Pase",
                        title: "Pase de prueba emitido",
                        summary: "Acceso temporal generado para una visita de prueba en la sede de interés.",
                        meta: ["Google Ads", "López de Hoyos", "Válido 24h"],
                        detail: {
                            title: "Pase de prueba WiFit",
                            subtitle: "Origen: lead con alta intención",
                            paragraphs: [
                                "Se ha generado un pase temporal para la primera visita del lead.",
                                "El objetivo no es solo responder: es reducir fricción y cerrar una visita concreta lo antes posible.",
                                "El paso siguiente puede llegar por correo, WhatsApp o llamada según canal y disponibilidad."
                            ],
                            bullets: [
                                "Sede propuesta: López de Hoyos",
                                "Duración de acceso: 24 horas",
                                "Siguiente acción comercial ya preparada"
                            ]
                        }
                    },
                    {
                        id: "whatsapp-sequence",
                        kind: "Mensaje",
                        title: "Secuencia de WhatsApp sugerida",
                        summary: "Primer contacto listo con propuesta concreta de prueba y franja recomendada.",
                        meta: ["Menos de 20 min", "Alta intención", "Automatizado"],
                        detail: {
                            title: "Mensaje comercial sugerido",
                            subtitle: "Canal: WhatsApp / follow-up rápido",
                            paragraphs: [
                                "Hola Álvaro, soy del equipo de WiFit López de Hoyos. Hemos visto tu interés y te hemos preparado una prueba gratuita.",
                                "Si te viene bien, te proponemos mañana a las 07:30, una franja con muy buena disponibilidad para conocer el club.",
                                "Si prefieres, también podemos dejarte preparada una visita guiada más tarde."
                            ],
                            bullets: [
                                "Mensaje orientado a cierre de visita",
                                "Personalizado por sede y franja",
                                "Preparado para enviar o revisar"
                            ]
                        }
                    },
                    {
                        id: "sales-task",
                        kind: "Tarea",
                        title: "Seguimiento comercial creado",
                        summary: "La prioridad comercial queda registrada sin depender de una llamada manual desordenada.",
                        meta: ["Score 89", "Google", "Llamar hoy"],
                        detail: {
                            title: "Tarea comercial",
                            subtitle: "Destino: cola comercial / CRM",
                            paragraphs: [
                                "El lead queda etiquetado como alta prioridad por intención, cercanía y horario compatible.",
                                "El equipo comercial recibe la siguiente mejor acción ya redactada y con contexto.",
                                "Esto permite responder más rápido sin que el proceso se rompa entre proveedores y Excel."
                            ],
                            bullets: [
                                "Prioridad: alta",
                                "Ventana sugerida de contacto: hoy",
                                "Objetivo: cerrar visita de prueba"
                            ]
                        }
                    }
                ],
                events: [
                    { time: "10:02", title: "Lead registrado", detail: "Nueva oportunidad desde Google Ads con intención fuerte y sede concreta." },
                    { time: "10:02", title: "Scoring ejecutado", detail: "La oportunidad sube a 89/100 por cercanía, intención y horario compatible." },
                    { time: "10:03", title: "Pase de prueba creado", detail: "Se deja preparado acceso temporal y mensaje inmediato de seguimiento." },
                    { time: "10:04", title: "Siguiente acción comercial", detail: "El equipo recibe tarea y guion de contacto en el mismo flujo." }
                ]
            },
            retention: {
                badge: "Retención",
                label: "Detección de impago",
                summary: "El impago deja de ser una sorpresa tardía y pasa a una secuencia visible de detección, aviso y preparación de regularización.",
                flow: "retention",
                memberProfile: "daniel",
                canalLead: "meta",
                selectedLead: "lead-3",
                status: {
                    badge: "Impago detectado",
                    title: "Detección y seguimiento automatizados en marcha",
                    text: "La incidencia se comunica, genera tarea y deja preparada la regularización antes de que se pierda el socio."
                },
                toast: {
                    title: "Impago detectado",
                    text: "La incidencia ya ha generado aviso, tarea y enlace de regularización."
                },
                memberSync: {
                    tone: "warning",
                    label: "Incidencia controlada",
                    title: "La plataforma detecta fricción antes de que se convierta en baja",
                    text: "Cobros, equipo y experiencia quedan alineados para recuperar el método de pago sin romper la relación con el socio.",
                    actions: ["Aviso automático", "Tarea al equipo", "Enlace de pago", "Periodo de gracia"]
                },
                phoneNotice: {
                    tone: "warning",
                    title: "Seguimiento de cuenta",
                    text: "La misma capa puede avisar al socio, proteger la experiencia y orientar la recuperación."
                },
                tablePatches: [
                    { id: "003", values: { 7: "Impago", 9: "14/04/2026", 10: "Sí" } }
                ],
                opsPatches: [
                    { club: "humanes", column: "pendiente", task: ["WF-512", "Seguimiento cobro Carlos Fernández", "Retención automatizada · llamada sugerida hoy"] }
                ],
                artifacts: [
                    {
                        id: "recovery-mail",
                        kind: "Correo",
                        title: "Aviso de regularización enviado",
                        summary: "Comunicación automática con enlace de pago y periodo de gracia controlado.",
                        meta: ["Carlos Fernández", "Humanes", "Enviado 09:17"],
                        detail: {
                            title: "Asunto: Hemos detectado un problema con tu cuota",
                            subtitle: "Canal: correo de retención",
                            paragraphs: [
                                "Hola Carlos, hemos detectado una incidencia con el último cobro de tu cuota.",
                                "Hemos dejado tu acceso en observación temporal mientras regularizamos el método de pago, para evitar una mala experiencia en tu próxima visita.",
                                "Puedes actualizarlo directamente desde el enlace seguro que te hemos enviado."
                            ],
                            bullets: [
                                "Comunicación inmediata tras el fallo",
                                "Enlace de actualización de método",
                                "Acceso protegido durante el periodo de gracia"
                            ]
                        }
                    },
                    {
                        id: "payment-link",
                        kind: "Cobro",
                        title: "Enlace de actualización de método",
                        summary: "Se genera un enlace seguro para recuperar la cuota sin intervención administrativa manual.",
                        meta: ["Pago seguro", "1 clic", "Retención"],
                        detail: {
                            title: "Recuperación de método de pago",
                            subtitle: "Origen: cobro fallido / retención",
                            paragraphs: [
                                "El sistema prepara un enlace individual para actualizar tarjeta o método de pago.",
                                "Esto reduce esperas, evita llamadas innecesarias y deja trazabilidad completa del intento de recuperación.",
                                "Si el socio no responde, el caso ya está preparado para seguimiento humano."
                            ],
                            bullets: [
                                "Vigencia limitada por seguridad",
                                "Registro automático del estado",
                                "Escalado a tarea si no hay respuesta"
                            ]
                        }
                    },
                    {
                        id: "retention-task",
                        kind: "Tarea",
                        title: "Tarea de retención abierta en operación",
                        summary: "El equipo recibe una acción concreta con contexto del socio y del club.",
                        meta: ["WF-512", "Humanes", "Llamar hoy"],
                        detail: {
                            title: "Tarea operativa de recuperación",
                            subtitle: "Destino: operación / club manager",
                            paragraphs: [
                                "La incidencia no se pierde en un correo o en una hoja: queda visible en la operativa de la sede.",
                                "Esto permite coordinar cobro, acceso y relación con el socio en una sola cola de trabajo.",
                                "El objetivo es retener antes de que el problema se traduzca en baja."
                            ],
                            bullets: [
                                "Prioridad: alta",
                                "Club: WiFit Humanes",
                                "Siguiente acción: llamada y confirmación"
                            ]
                        }
                    },
                    {
                        id: "cash-risk",
                        kind: "Forecast",
                        title: "Ingreso movido a riesgo",
                        summary: "La incidencia sale del bloque de cobros esperados y ajusta el forecast de caja hasta regularización.",
                        meta: ["Ingreso en riesgo", "Caja 30 días", "Retención"],
                        detail: {
                            title: "Forecast de caja ajustado",
                            subtitle: "Origen: impago / agenda financiera",
                            paragraphs: [
                                "El impago no solo abre una tarea: también mueve ese ingreso a la banda de riesgo dentro de la agenda financiera.",
                                "De este modo la previsión de tesorería se recalcula en el momento y no al final del mes.",
                                "La historia para dirección es clara: el problema se detecta, se comunica y además modifica el forecast operativo."
                            ],
                            bullets: [
                                "Ingreso esperado movido a riesgo",
                                "Forecast de caja refrescado automáticamente",
                                "Secuencia de recuperación ya preparada"
                            ]
                        }
                    }
                ],
                events: [
                    { time: "09:16", title: "Impago detectado", detail: "La conciliación marca incidencia y actualiza el estado del socio." },
                    { time: "09:17", title: "Aviso enviado", detail: "Se dispara la comunicación con enlace de regularización y contexto claro." },
                    { time: "09:17", title: "Tarea creada", detail: "La sede recibe seguimiento prioritario para recuperar el método de pago." },
                    { time: "09:18", title: "Ingreso movido a riesgo", detail: "La cuota deja de contar como cobro esperado y pasa a ingresos en riesgo en la agenda financiera." },
                    { time: "09:18", title: "Forecast de caja ajustado", detail: "La previsión a 30 días se recalcula al instante para enseñar impacto financiero real." },
                    { time: "09:18", title: "Regularización preparada", detail: "El caso queda listo para resolverse sin romper la experiencia del socio." }
                ]
            }
        }
    };

    const baseline = {
        socios: deepClone(sociosGestion),
        leads: deepClone(leads),
        operaciones: deepClone(operaciones),
        logs: deepClone(logsIniciales),
        chats: deepClone(estado.chats),
        finanzas: deepClone(estado.finanzas),
        finanzasAgenda: deepClone(estado.finanzasAgenda || [])
    };

    const runtime = {
        currentScenario: null,
        artifacts: [],
        events: [],
        memberSync: null,
        phoneNotice: null,
        lastAppliedAt: null
    };

    function replaceArray(target, source) {
        target.splice(0, target.length, ...deepClone(source));
    }

    function replaceObject(target, source) {
        Object.keys(target).forEach((key) => delete target[key]);
        Object.assign(target, deepClone(source));
    }

    function saveRuntime() {
        if (IS_PRESENT_MODE) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currentScenario: runtime.currentScenario,
                lastAppliedAt: runtime.lastAppliedAt
            }));
        } catch (error) {
            console.warn("No se pudo guardar el estado runtime", error);
        }
    }

    function loadRuntime() {
        if (IS_PRESENT_MODE) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (_) { /* no-op */ }
            return null;
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn("No se pudo leer el estado runtime", error);
            return null;
        }
    }

    function resetData({ keepSelection = true } = {}) {
        replaceArray(sociosGestion, baseline.socios);
        replaceArray(leads, baseline.leads);
        replaceObject(operaciones, baseline.operaciones);
        estado.logs = deepClone(baseline.logs);
        replaceObject(estado.chats, baseline.chats);
        estado.finanzas = deepClone(baseline.finanzas);
        estado.finanzasAgenda = deepClone(baseline.finanzasAgenda);
        runtime.artifacts = [];
        runtime.events = [];
        runtime.memberSync = null;
        runtime.phoneNotice = null;
        runtime.lastAppliedAt = null;
        if (!keepSelection) {
            runtime.currentScenario = null;
        }
        if (typeof clearAutomationTimers === "function") {
            clearAutomationTimers();
        }
        estado.automationActive = "activation";
        estado.automationStep = -1;
    }

    function applyTablePatches(patches = []) {
        patches.forEach((patch) => {
            const row = sociosGestion.find((item) => item[0] === patch.id);
            if (!row) return;
            Object.entries(patch.values).forEach(([column, value]) => {
                row[Number(column)] = value;
            });
        });
    }

    function applyLeadPatches(patches = []) {
        patches.forEach((patch) => {
            const lead = leads.find((item) => item.id === patch.id);
            if (!lead) return;
            Object.assign(lead, patch.values);
        });
    }

    function applyOpsPatches(patches = []) {
        patches.forEach((patch) => {
            const club = operaciones[patch.club];
            if (!club || !club.tablero[patch.column]) return;
            club.tablero[patch.column] = [patch.task, ...club.tablero[patch.column]];
        });
    }

    function applyChatPatches(patches = []) {
        patches.forEach((patch) => {
            if (!estado.chats[patch.profile]) return;
            estado.chats[patch.profile].push(...patch.messages);
        });
    }

    function refreshAllViews() {
        renderRuntimeShell();
        renderSocio();
        renderGestion();
    }

    function renderRuntimeShell() {
        const bar = document.getElementById("runtime-bar");
        const summary = document.getElementById("runtime-summary");
        const meta = document.getElementById("runtime-meta");
        const panelCopy = document.getElementById("runtime-panel-copy");
        const actions = document.getElementById("runtime-actions");
        const status = document.getElementById("runtime-status");
        if (!bar || !summary || !meta || !panelCopy || !actions || !status) return;

        actions.innerHTML = Object.entries(scenarioLibrary.scenarios).map(([id, scenario]) => `
            <button class="runtime-btn ${runtime.currentScenario === id ? "activo" : ""}" type="button" onclick="applyRuntimeScenario('${id}')">
                <small>${scenario.badge}</small>
                <strong>${scenario.label}</strong>
                <span>${scenario.summary}</span>
            </button>
        `).join("") + (IS_PRESENT_MODE ? "" : `
            <button class="runtime-btn" type="button" onclick="resetRuntimeScenario()">
                <small>Reset</small>
                <strong>Volver al estado base</strong>
                <span>Limpia escenarios, evidencias generadas y vuelve al punto de partida.</span>
            </button>
        `);

        const scenario = runtime.currentScenario ? scenarioLibrary.scenarios[runtime.currentScenario] : null;
        const liveStats = backend.mode === "live" && backend.liveState ? backend.liveState : null;
        const liveBlock = liveStats ? `
            <div class="live-stats">
                <small>Google Sheets en tiempo real</small>
                <div class="live-stats-grid">
                    <span><strong>${liveStats.socios_activos}</strong> socios activos</span>
                    <span><strong>${liveStats.leads_nuevos}</strong> leads nuevos</span>
                    <span><strong>${liveStats.automatizaciones_en_curso}</strong> automatizaciones</span>
                    <span><strong>${liveStats.retencion_estimada}</strong> retención</span>
                </div>
            </div>
        ` : "";

        summary.innerHTML = (scenario ? `
            <div class="eyebrow">Demo viva</div>
            <strong>${scenario.label}</strong>
            <p>${scenario.summary}</p>
        ` : `
            <div class="eyebrow">Demo viva</div>
            <strong>Experiencia lista para presentar</strong>
            <p>Abre el simulador solo cuando quieras enseñar la capa de automatización y backend.</p>
        `);

        meta.innerHTML = [
            `<span class="runtime-chip">${scenario ? scenario.status.badge : "Base lista"}</span>`,
            `<span class="runtime-pill"><strong>${runtime.lastAppliedAt || "Listo"}</strong> ${runtime.lastAppliedAt ? "última ejecución" : "sin ejecutar"}</span>`,
            backend.mode === "live" && liveStats
                ? `<span class="runtime-pill"><strong>${liveStats.socios_activos}</strong> socios activos</span>`
                : backend.checking
                    ? `<span class="runtime-pill"><strong>Conectando</strong> backend de demo</span>`
                    : `<span class="runtime-pill"><strong>Modo local</strong> recorrido disponible</span>`,
            backend.mode === "live" && liveStats
                ? `<span class="runtime-pill"><strong>${liveStats.leads_nuevos}</strong> leads nuevos</span>`
                : `<span class="runtime-pill"><strong>Google Sheets</strong> visible al activar triggers</span>`,
            backend.mode === "live"
                ? `<span class="runtime-pill"><strong>${formatClock(backend.lastSyncedAt)}</strong> última sync</span>`
                : `<span class="runtime-pill"><strong>Sin live sync</strong> solo demo local</span>`,
            backend.mode === "live"
                ? `<span class="runtime-pill"><strong>${backend.hasFullSnapshot ? "Bidireccional" : "Resumen live"}</strong> ${backend.hasFullSnapshot ? "fila y KPIs" : "KPIs conectados"}</span>`
                : `<span class="runtime-pill"><strong>Fallback</strong> experiencia preservada</span>`
        ].join("");

        panelCopy.innerHTML = scenario ? `
            <div class="eyebrow">Recorrido guiado</div>
            <strong>${scenario.label}</strong>
            <p>${scenario.summary}</p>
            <p>La interfaz cambia al instante y, cuando el backend está disponible, además deja rastro real en Google Sheets para reforzar la sensación de producto conectado.</p>
            ${liveBlock}
        ` : `
            <div class="eyebrow">Recorrido guiado</div>
            <strong>Selecciona una escena cuando la quieras contar</strong>
            <p>La portada queda limpia y el simulador aparece solo cuando necesitas enseñar cobros, captación o retención con trazabilidad real.</p>
            <p>Así la demo se siente más cercana a producto y menos a dashboard de laboratorio.</p>
            ${liveBlock}
        `;

        status.innerHTML = scenario ? `
            <div class="status-chip">${scenario.status.badge}</div>
            <strong>${scenario.status.title}</strong>
            <p>${scenario.status.text}</p>
            <p><strong>Última ejecución:</strong> ${runtime.lastAppliedAt || "ahora mismo"}</p>
            ${liveStats ? `<p><strong>Backend:</strong> ${liveStats.automatizaciones_en_curso} automatizaciones activas y ${liveStats.retencion_estimada} de retención estimada.</p>` : `<p><strong>Backend:</strong> el flujo local sigue disponible aunque no haya conexión en vivo.</p>`}
        ` : `
            <div class="status-chip">Base lista</div>
            <strong>Simulador listo para abrirse cuando lo necesites</strong>
            <p>La experiencia arranca limpia y sin artificios. Cuando abras el simulador podrás lanzar un caso realista y enseñar outputs, documentos y tareas coordinadas.</p>
            <p><strong>Persistencia:</strong> el estado se guarda en tu navegador para que la demo mantenga continuidad.</p>
        `;

        renderBackendBadge();
    }

    function renderMemberSync() {
        const container = document.getElementById("member-sync");
        if (!container) return;
        if (!runtime.currentScenario) {
            container.innerHTML = `
                <div class="member-sync-card">
                    <span>Sin trigger activo</span>
                    <strong>Este bloque mostrará el impacto real del escenario seleccionado</strong>
                    <p>Al activar un trigger verás cómo cambia la experiencia del socio, qué se genera en gestión y qué outputs quedan disponibles.</p>
                </div>
            `;
            return;
        }

        const sync = runtime.memberSync;
        container.innerHTML = `
            <div class="member-sync-card ${sync.tone}">
                <span>${sync.label}</span>
                <strong>${sync.title}</strong>
                <p>${sync.text}</p>
                <div class="member-sync-actions">
                    ${sync.actions.map((action) => `<span>${action}</span>`).join("")}
                </div>
            </div>
        `;
    }

    function injectPhoneNotice() {
        const phoneContent = document.getElementById("phone-content");
        if (!phoneContent || !runtime.phoneNotice) return;

        const selectedScenario = scenarioLibrary.scenarios[runtime.currentScenario];
        if (!selectedScenario || selectedScenario.memberProfile !== estado.socioPerfil) return;

        const notice = document.createElement("div");
        notice.className = `phone-notice ${runtime.phoneNotice.tone || ""}`;
        notice.innerHTML = `
            <strong>${runtime.phoneNotice.title}</strong>
            <p>${runtime.phoneNotice.text}</p>
        `;
        phoneContent.prepend(notice);
    }

    function renderArtifacts() {
        const container = document.getElementById("artifact-grid");
        if (!container) return;
        if (!runtime.artifacts.length) {
            container.innerHTML = `
                <div class="artifact-card">
                    <small>Preparado</small>
                    <strong>Los outputs aparecerán aquí al activar un trigger</strong>
                    <p>Correo, pase de prueba, factura, tarea o plan generado según el escenario que ejecutes.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = runtime.artifacts.map((artifact) => `
            <button class="artifact-card" type="button" onclick="openArtifactModal('${artifact.id}')">
                <div class="artifact-head">
                    <div>
                        <small>${artifact.kind}</small>
                        <strong>${artifact.title}</strong>
                    </div>
                    <span class="flow-badge">Ver detalle</span>
                </div>
                <p>${artifact.summary}</p>
                <div class="artifact-meta">
                    ${artifact.meta.map((item) => `<span>${item}</span>`).join("")}
                </div>
            </button>
        `).join("");
    }

    function renderEventFeed() {
        const container = document.getElementById("event-feed");
        if (!container) return;
        if (!runtime.events.length) {
            container.innerHTML = `
                <div class="event-item">
                    <time>Listo</time>
                    <strong>La cronología del escenario aparecerá aquí</strong>
                    <p>Cada trigger dejará una secuencia clara para contar qué ocurrió y por qué aporta valor al cliente.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = runtime.events.map((event) => `
            <div class="event-item">
                <time>${event.time}</time>
                <strong>${event.title}</strong>
                <p>${event.detail}</p>
            </div>
        `).join("");
    }

    function showToast(title, text) {
        const toast = document.getElementById("runtime-toast");
        if (!toast) return;
        toast.innerHTML = `
            <strong>${title}</strong>
            <p>${text}</p>
        `;
        toast.classList.add("visible");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("visible");
        }, 2800);
    }

    function openArtifactModal(id) {
        const artifact = runtime.artifacts.find((item) => item.id === id);
        if (!artifact) return;
        const modal = document.getElementById("artifact-modal");
        const title = document.getElementById("modal-title");
        const subtitle = document.getElementById("modal-subtitle");
        const body = document.getElementById("modal-body");
        if (!modal || !title || !subtitle || !body) return;

        title.textContent = artifact.detail.title;
        subtitle.textContent = artifact.detail.subtitle;
        body.innerHTML = `
            ${artifact.detail.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
            <ul>
                ${artifact.detail.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
            </ul>
        `;
        modal.hidden = false;
    }

    function closeArtifactModal() {
        const modal = document.getElementById("artifact-modal");
        if (modal) {
            modal.hidden = true;
        }
    }

    function applyScenario(id, { silent = false } = {}) {
        const scenario = scenarioLibrary.scenarios[id];
        if (!scenario) return;

        resetData({ keepSelection: true });
        runtime.currentScenario = id;
        runtime.lastAppliedAt = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

        if (scenario.tablePatches) applyTablePatches(scenario.tablePatches);
        if (scenario.leadPatches) applyLeadPatches(scenario.leadPatches);
        if (scenario.opsPatches) applyOpsPatches(scenario.opsPatches);
        if (scenario.chatPatches) applyChatPatches(scenario.chatPatches);

        runtime.artifacts = deepClone(scenario.artifacts || []);
        runtime.events = deepClone(scenario.events || []);
        runtime.memberSync = deepClone(scenario.memberSync || null);
        runtime.phoneNotice = deepClone(scenario.phoneNotice || null);

        estado.socioPerfil = scenario.memberProfile || estado.socioPerfil;
        estado.socioView = "dia";
        estado.canalLead = scenario.canalLead || estado.canalLead;
        estado.selectedLead = scenario.selectedLead || estado.selectedLead;

        if (typeof simulateAutomation === "function" && scenario.flow) {
            simulateAutomation(scenario.flow);
        }

        refreshAllViews();
        saveRuntime();
        if (!silent) {
            showToast(scenario.toast.title, scenario.toast.text);
        }

        if (backend.mode === "live" && !silent) {
            fireLiveTrigger(id, scenario);
        }
    }

    function fireLiveTrigger(id, scenario) {
        var actionMap = {
            activation: { action: "activation", nombre: "Manuel Garcia", sede: "WiFit Retiro" },
            lead: { action: "lead", nombre: "Nuevo Lead Demo", canal: "Google Ads", sede: "WiFit Lopez de Hoyos" },
            retention: { action: "retention", socio_id: "S003" }
        };
        var params = actionMap[id];
        if (!params) return;

        triggerBackendAction(params.action, params)
            .then(function (data) {
                if (!data) return;
                var prev = runtime.events.length ? runtime.events : [];
                var liveEvent = {
                    time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
                    title: "Backend confirmado",
                    detail: data.mensaje || "Acción registrada en Google Sheets."
                };
                runtime.events = prev.concat([liveEvent]);
                renderEventFeed();
                probeBackend({ quiet: true, syncSnapshot: true, timeout: BACKEND_FULL_TIMEOUT });
            });
    }

    function resetRuntimeScenario(options) {
        var silent = options && options.silent;
        resetData({ keepSelection: false });
        saveRuntime();
        refreshAllViews();
        if (!silent) {
            showToast("Escenario reiniciado", "La demo ha vuelto al estado base y ha limpiado las evidencias generadas.");
        }
    }

    function openRuntimeModal() {
        var modal = document.getElementById("runtime-modal");
        if (modal) {
            modal.hidden = false;
        }
    }

    function closeRuntimeModal() {
        var modal = document.getElementById("runtime-modal");
        if (modal) {
            modal.hidden = true;
        }
    }

    const originalRenderSocio = renderSocio;
    renderSocio = function wrappedRenderSocio() {
        originalRenderSocio();
        renderMemberSync();
        injectPhoneNotice();
    };

    const originalRenderSociosTab = renderSociosTab;
    renderSociosTab = function wrappedRenderSociosTab() {
        originalRenderSociosTab();
        renderLiveMemberKpis();
        renderArtifacts();
        renderEventFeed();
    };

    const originalRenderGestion = renderGestion;
    renderGestion = function wrappedRenderGestion() {
        originalRenderGestion();
        renderRuntimeShell();
        if (estado.gestionTab === "socios") {
            renderArtifacts();
            renderEventFeed();
        }
    };

    window.applyRuntimeScenario = (id) => applyScenario(id);
    window.resetRuntimeScenario = resetRuntimeScenario;
    window.openRuntimeModal = openRuntimeModal;
    window.closeRuntimeModal = closeRuntimeModal;
    window.openArtifactModal = openArtifactModal;
    window.closeArtifactModal = closeArtifactModal;

    document.addEventListener("click", (event) => {
        const runtimeModal = document.getElementById("runtime-modal");
        const modal = document.getElementById("artifact-modal");
        if (runtimeModal && event.target === runtimeModal) {
            closeRuntimeModal();
        }
        if (modal && event.target === modal) {
            closeArtifactModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closeRuntimeModal();
        closeArtifactModal();
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            probeBackend({ quiet: true, syncSnapshot: true, timeout: BACKEND_FULL_TIMEOUT });
        }
    });

    function startBackendPolling() {
        if (backend.pollTimer) {
            clearInterval(backend.pollTimer);
        }
        backend.pollTimer = setInterval(() => {
            if (document.hidden) return;
            probeBackend({ quiet: true, notifyOnChange: true });
        }, BACKEND_POLL_INTERVAL);
    }

    function renderLiveMemberKpis() {
        if (backend.mode !== "live" || !backend.liveState) return;
        const container = document.getElementById("member-kpis");
        if (!container) return;
        container.innerHTML = `
            <div class="kpi-card">
                <span>Socios activos</span>
                <strong>${backend.liveState.socios_activos || "--"}</strong>
                <p>Dato vivo leído desde Google Sheets para enseñar operación conectada.</p>
            </div>
            <div class="kpi-card">
                <span>Impagos</span>
                <strong>${backend.liveState.socios_impago || "--"}</strong>
                <p>Lectura viva de los casos abiertos en la hoja operativa.</p>
            </div>
            <div class="kpi-card">
                <span>Retención</span>
                <strong>${backend.liveState.retencion_estimada || "--"}</strong>
                <p>Indicador sincronizado con el resumen actual del backend.</p>
            </div>
            <div class="kpi-card">
                <span>Cuota media</span>
                <strong>${formatLiveCurrency(backend.liveState.cuota_media)}</strong>
                <p>Referencia financiera conectada al estado actual de la hoja.</p>
            </div>
        `;
    }

    // Modo presentación: ?mode=present en la URL
    // - oculta botones peligrosos de reset
    // - añade watermark discreto "Modo presentación"
    // Permite enseñar la demo sin miedo a pulsaciones accidentales.
    (function applyPresentMode() {
        if (!IS_PRESENT_MODE) return;
        try {
            document.documentElement.classList.add("present-mode");
            var mark = document.createElement("div");
            mark.className = "present-watermark";
            mark.textContent = "Modo presentación · WiFit × Ciklum";
            document.body.appendChild(mark);
        } catch (_) { /* no-op */ }
    })();

    const saved = loadRuntime();
    renderRuntimeShell();
    if (!IS_PRESENT_MODE && saved && saved.currentScenario && scenarioLibrary.scenarios[saved.currentScenario]) {
        applyScenario(saved.currentScenario, { silent: true });
        runtime.lastAppliedAt = saved.lastAppliedAt || runtime.lastAppliedAt;
        renderRuntimeShell();
    } else {
        resetRuntimeScenario({ silent: true });
    }

    // Precalentamos el Apps Script en cuanto carga la pagina,
    // antes de la primera acción del usuario: el cold start se va
    // mientras miran la landing, no mientras esperan una demo.
    warmupBackend();
    probeBackend({ quiet: true, syncSnapshot: true, timeout: BACKEND_FULL_TIMEOUT });
    startBackendPolling();

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("sw.js").catch((error) => {
                console.warn("No se pudo registrar el service worker", error);
            });
        });
    }
})();
