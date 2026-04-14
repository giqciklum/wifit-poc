(() => {
    const STORAGE_KEY = "wifit_runtime_v1";
    const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwmmgY9mg4p8o6lVboAelyR2P0WtnMYo7kDJWWLpvzHy6B2kuiatZSr1qguU2jGDLwnWg/exec";
    const BACKEND_TIMEOUT = 8000;

    const deepClone = (value) => JSON.parse(JSON.stringify(value));

    const backend = {
        mode: "local",
        liveState: null,
        lastError: null,
        checking: false
    };

    function backendFetch(params) {
        const url = BACKEND_URL + "?" + new URLSearchParams(params).toString();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
        return fetch(url, { signal: controller.signal })
            .then(function (resp) { clearTimeout(timer); return resp.json(); })
            .catch(function (err) { clearTimeout(timer); throw err; });
    }

    function probeBackend() {
        if (backend.checking) return;
        backend.checking = true;
        backendFetch({ action: "state" })
            .then(function (data) {
                if (data && data.status === "ok") {
                    backend.mode = "live";
                    backend.liveState = data.resumen;
                    backend.lastError = null;
                } else {
                    backend.mode = "local";
                    backend.lastError = "Respuesta inesperada";
                }
            })
            .catch(function (err) {
                backend.mode = "local";
                backend.lastError = err.message || "Error de red";
            })
            .finally(function () {
                backend.checking = false;
                renderBackendBadge();
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
        } else if (backend.mode === "live") {
            el.className = "backend-badge live";
            el.innerHTML = '<span class="badge-dot"></span> Backend en vivo';
        } else {
            el.className = "backend-badge local";
            el.innerHTML = '<span class="badge-dot"></span> Modo demo local';
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
                    }
                ],
                events: [
                    { time: "07:45", title: "Cobro confirmado", detail: "La pasarela valida el pago mensual y actualiza el estado del socio." },
                    { time: "07:45", title: "Servicio activado", detail: "La cuenta premium queda habilitada sin esperar gestión manual." },
                    { time: "07:46", title: "Bienvenida enviada", detail: "Se genera email de activación con QR, siguiente paso y recomendaciones." },
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
                label: "Recuperación de impago",
                summary: "El impago deja de ser una sorpresa tardía y pasa a una secuencia visible de recuperación y seguimiento.",
                flow: "retention",
                memberProfile: "daniel",
                canalLead: "meta",
                selectedLead: "lead-3",
                status: {
                    badge: "Impago detectado",
                    title: "Recuperación automatizada en marcha",
                    text: "La incidencia se comunica, genera tarea y prepara una salida operativa antes de que se pierda el socio."
                },
                toast: {
                    title: "Recuperación abierta",
                    text: "El impago ya ha generado aviso, tarea y enlace de regularización."
                },
                memberSync: {
                    tone: "warning",
                    label: "Riesgo controlado",
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
                    }
                ],
                events: [
                    { time: "09:16", title: "Impago detectado", detail: "La conciliación marca incidencia y actualiza el estado del socio." },
                    { time: "09:17", title: "Aviso enviado", detail: "Se dispara la comunicación con enlace de regularización y contexto claro." },
                    { time: "09:17", title: "Tarea creada", detail: "La sede recibe seguimiento prioritario para recuperar el método de pago." },
                    { time: "09:18", title: "Acción de retención preparada", detail: "El caso queda listo para resolver sin romper la experiencia del socio." }
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
        finanzas: deepClone(estado.finanzas)
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
        `).join("") + `
            <button class="runtime-btn" type="button" onclick="resetRuntimeScenario()">
                <small>Reset</small>
                <strong>Volver al estado base</strong>
                <span>Limpia escenarios, evidencias generadas y vuelve al punto de partida.</span>
            </button>
        `;

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
                : `<span class="runtime-pill"><strong>Google Sheets</strong> visible al activar triggers</span>`
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
            lead: { action: "lead", nombre: "Nuevo Lead Demo", canal: "Google Ads" },
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
                probeBackend();
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

    const saved = loadRuntime();
    renderRuntimeShell();
    if (saved && saved.currentScenario && scenarioLibrary.scenarios[saved.currentScenario]) {
        applyScenario(saved.currentScenario, { silent: true });
        runtime.lastAppliedAt = saved.lastAppliedAt || runtime.lastAppliedAt;
        renderRuntimeShell();
    } else {
        resetRuntimeScenario({ silent: true });
    }

    probeBackend();

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("sw.js").catch((error) => {
                console.warn("No se pudo registrar el service worker", error);
            });
        });
    }
})();
