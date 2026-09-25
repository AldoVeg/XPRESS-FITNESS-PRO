const WHATSAPP_NUMBER = "51944861404";

const whatsappLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

/* ---------- Encabezado compacto al hacer scroll ---------- */

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Corredor del encabezado (una sola vez por carga) ----------
   1. Sale de detrás de la última "S" de XPRESS (la marquilla va por encima).
   2. Salta a la pista del borde inferior y corre revelando las palabras del menú.
   3. Da un salto final y encaja en el hueco de la X que lo espera.
   4. X + corredor se funden (destello, desenfoque) y se transforman en el logo,
      que crece a su tamaño final y queda así. Después solo sigue el brillo
      de la marquilla (CSS, cada 5 s).
   Las posiciones se miden al momento sin transformaciones, así se adapta
   a cualquier ancho (en celular el menú va en una segunda fila). */

const initHeaderRun = () => {
  const root = document.documentElement;
  const finishIntro = () => root.classList.remove("js-intro");

  const header = document.querySelector(".site-header");
  const layer = header && header.querySelector(".header-run");
  if (!layer || prefersReducedMotion || !("animate" in Element.prototype)) {
    finishIntro();
    return;
  }

  const wrap = header.querySelector(".nav-wrap");
  const logo = header.querySelector(".brand-logo");
  const nav = header.querySelector(".main-nav");
  const runner = layer.querySelector(".run-runner");
  const track = layer.querySelector(".run-track");
  const trackFill = layer.querySelector(".run-track-fill");
  const dock = header.querySelector(".run-dock");
  const links = Array.from(header.querySelectorAll(".main-nav > a"));

  const RUN_SPEED = 360; // px por segundo sobre la pista
  const EXIT_TIME = 760; // salir de detrás de la "S" y bajar a la pista
  const JUMP_TIME = 620; // salto final hacia la X

  // Hueco del corredor dentro del logo (medido sobre logo.png, 671 × 372)
  const HOLE = { left: 0.3398, top: 0.1774 };

  // Posición de un elemento dentro de .nav-wrap sin contar transformaciones
  const layoutBox = (el) => {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== wrap) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };

  const measure = () => {
    const l = layoutBox(logo);
    const d = layoutBox(dock);
    const runnerW = runner.offsetWidth;
    const runnerH = runner.offsetHeight;
    const navInline = getComputedStyle(nav).position !== "absolute";
    // La última "S" de XPRESS: 86 % → 98 % del ancho, franja superior de la marquilla
    const hideX = l.x + l.w * 0.92 - runnerW / 2;
    const hideY = l.y + l.h * 0.25 - runnerH / 2;

    return {
      runnerW,
      hide: { x: hideX, y: hideY },
      out: { x: l.x + l.w + 6, y: hideY + 2 },
      landX: l.x + l.w + 40,
      trackY: wrap.offsetHeight - runnerH - 2,
      end: { x: d.x + d.w * HOLE.left, y: d.y + d.h * HOLE.top },
      words: navInline
        ? links.map((el) => {
            const b = layoutBox(el);
            return { el, x: b.x + b.w / 2 };
          })
        : [],
    };
  };

  const at = (x, y) => `translate(${x}px, ${y}px)`;

  const run = () => {
    const g = measure();
    const jumpX = g.end.x - 78;
    const runTime = (Math.max(jumpX - g.landX, 40) / RUN_SPEED) * 1000;
    const total = EXIT_TIME + runTime + JUMP_TIME;
    const onTrack = EXIT_TIME / total;
    const offTrack = (EXIT_TIME + runTime) / total;
    const peak = offTrack + (1 - offTrack) * 0.55;

    runner.animate(
      [
        // Detrás de la S (la marquilla lo tapa)
        { offset: 0, transform: at(g.hide.x, g.hide.y), opacity: 0, filter: "blur(0px)" },
        { offset: onTrack * 0.2, transform: at(g.hide.x, g.hide.y), opacity: 1, easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
        // Asoma y sale por la derecha de la marquilla
        { offset: onTrack * 0.6, transform: at(g.out.x, g.out.y), opacity: 1, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)" },
        // Cae a la pista
        { offset: onTrack, transform: at(g.landX, g.trackY), opacity: 1 },
        // Carrera a velocidad constante (sincronizada con las palabras)
        { offset: offTrack, transform: at(jumpX, g.trackY), opacity: 1, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
        // Salto: sube por encima del hueco…
        { offset: peak, transform: at(jumpX + (g.end.x - jumpX) * 0.62, g.end.y - 7), opacity: 1, easing: "cubic-bezier(0.5, 0, 0.7, 1)" },
        // …y encaja en la X
        { offset: 0.94, transform: at(g.end.x, g.end.y), opacity: 1, filter: "blur(0px)" },
        { offset: 1, transform: at(g.end.x, g.end.y), opacity: 0, filter: "blur(2px)" },
      ],
      { duration: total }
    );

    track.style.left = `${g.landX}px`;
    track.style.width = `${Math.max(g.end.x - g.landX, 0)}px`;
    // La luz de la pista avanza al mismo paso que el corredor y se apaga al llegar
    const litAtJump = (jumpX - g.landX) / Math.max(g.end.x - g.landX, 1);
    trackFill.animate(
      [
        { offset: 0, transform: "scaleX(0)", opacity: 1 },
        { offset: onTrack, transform: "scaleX(0)", opacity: 1 },
        { offset: offTrack, transform: `scaleX(${litAtJump})`, opacity: 1 },
        { offset: 0.94, transform: "scaleX(1)", opacity: 1 },
        { offset: 1, transform: "scaleX(1)", opacity: 0 },
      ],
      { duration: total }
    );

    // Cada palabra aparece cuando el centro del corredor pasa debajo.
    // Las que quedan antes del punto de aterrizaje (celular) aparecen escalonadas al aterrizar.
    g.words.forEach(({ el, x }, i) => {
      const runnerCenter = x - g.runnerW / 2;
      if (runnerCenter > jumpX) return;
      const passAt =
        runnerCenter < g.landX
          ? EXIT_TIME + i * 90
          : EXIT_TIME + ((runnerCenter - g.landX) / RUN_SPEED) * 1000;
      setTimeout(() => el.classList.add("is-revealed"), passAt);
    });

    // Encaje: destello y transformación en logo, que queda formado
    setTimeout(() => {
      dock.classList.add("is-flash", "is-logo");
    }, total * 0.95);

    setTimeout(finishIntro, total + 400);
  };

  // Arranca cuando la marquilla termina de entrar
  setTimeout(run, 1000);
};

initHeaderRun();

/* ---------- Carrusel inclinado del hero ---------- */

const initHeroCarousel = () => {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const card = root.querySelector(".hero-carousel");
  const slides = Array.from(root.querySelectorAll(".slide"));
  const bar = root.querySelector(".carousel-progress span");
  const dotsWrap = root.querySelector(".carousel-dots");
  const caption = root.querySelector(".carousel-caption");
  const captionLabel = root.querySelector("[data-caption-label]");
  const captionTitle = root.querySelector("[data-caption-title]");
  const cta = root.querySelector(".carousel-cta");
  if (slides.length < 2) return;

  let current = 0;
  const pauseReasons = new Set();

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ver imagen ${index + 1} de ${slides.length}`);
    dot.addEventListener("click", () => goTo(index));
    dotsWrap.append(dot);
    return dot;
  });

  const restartProgress = () => {
    bar.classList.remove("is-running");
    // Forzar reflow para reiniciar la animación de la barra
    void bar.offsetWidth;
    if (!prefersReducedMotion) bar.classList.add("is-running");
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === current)));

    const { label, title, product } = slides[current].dataset;
    captionLabel.textContent = label;
    captionTitle.textContent = title;
    caption.classList.remove("is-changing");
    void caption.offsetWidth;
    caption.classList.add("is-changing");
    cta.dataset.openProduct = product;

    restartProgress();
  };

  // La barra de progreso marca el ritmo: al completarse, pasa a la siguiente imagen.
  // Pausarla (hover, foco, pestaña oculta) pausa el carrusel sin perder el avance.
  bar.addEventListener("animationend", () => goTo(current + 1));

  const setPaused = (reason, paused) => {
    if (paused) pauseReasons.add(reason);
    else pauseReasons.delete(reason);
    root.classList.toggle("is-paused", pauseReasons.size > 0);
  };

  card.addEventListener("mouseenter", () => setPaused("hover", true));
  card.addEventListener("mouseleave", () => setPaused("hover", false));
  // Solo pausa con foco de teclado; un clic en los puntos no debe detener el carrusel
  root.addEventListener("focusin", (event) => {
    if (event.target.matches(":focus-visible")) setPaused("focus", true);
  });
  root.addEventListener("focusout", () => setPaused("focus", false));
  document.addEventListener("visibilitychange", () => setPaused("hidden", document.hidden));

  card.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") goTo(current + 1);
    if (event.key === "ArrowLeft") goTo(current - 1);
  });

  // Deslizar con el dedo o arrastrar con el mouse
  let startX = null;
  card.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });
  card.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const deltaX = event.clientX - startX;
    startX = null;
    if (Math.abs(deltaX) > 40) goTo(current + (deltaX < 0 ? 1 : -1));
  });
  ["pointercancel", "pointerleave"].forEach((type) =>
    card.addEventListener(type, () => {
      startX = null;
    })
  );

  // Inclinación 3D sutil que sigue al mouse (solo en equipos con puntero fino)
  if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const maxTilt = 6;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-y", `${(x * maxTilt).toFixed(2)}deg`);
      card.style.setProperty("--tilt-x", `${(-y * maxTilt).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  }

  goTo(0);
};

initHeroCarousel();

/* ---------- Catálogo, guías y visor (datos en productos.js) ---------- */

const soles = (n) => `S/${n.toLocaleString("es-PE")}`;
const byId = (id) => (typeof PRODUCTOS !== "undefined" ? PRODUCTOS.find((p) => p.id === id) : null);

const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === "text") node.textContent = value;
    else if (key === "class") node.className = value;
    else if (key.startsWith("data-") || key.startsWith("aria-") || key === "role") node.setAttribute(key, value);
    else node[key] = value;
  });
  [].concat(children).forEach((child) => child && node.append(child));
  return node;
};

const priceLabel = (p) => {
  if (p.precio === null || p.precio === undefined) return "Precio a consultar";
  return p.precioPar ? `${soles(p.precio)} c/u · ${soles(p.precioPar)} el par` : soles(p.precio);
};

// Enlaces suaves a WhatsApp declarados en el HTML con data-whatsapp="mensaje"
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsappLink(link.dataset.whatsapp);
  link.target = "_blank";
  link.rel = "noreferrer";
});

/* Visor de producto: imagen grande, galería, datos y consulta sin compromiso */
const viewer = (() => {
  const dialog = document.querySelector("[data-viewer]");
  if (!dialog || typeof dialog.showModal !== "function") return { open: () => {} };

  const img = dialog.querySelector("[data-viewer-img]");
  const thumbs = dialog.querySelector("[data-viewer-thumbs]");
  const prev = dialog.querySelector("[data-viewer-prev]");
  const next = dialog.querySelector("[data-viewer-next]");
  let product = null;
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + product.imagenes.length) % product.imagenes.length;
    img.src = product.imagenes[index];
    img.alt = `${product.nombre} — imagen ${index + 1} de ${product.imagenes.length}`;
    thumbs.querySelectorAll("button").forEach((b, n) => b.setAttribute("aria-current", String(n === index)));
  };

  const open = (id, trigger) => {
    product = byId(id);
    if (!product) return;
    opener = trigger || document.activeElement;
    const multiple = product.imagenes.length > 1;

    dialog.querySelector("[data-viewer-cat]").textContent = CATEGORIAS[product.categoria].nombre;
    dialog.querySelector("[data-viewer-title]").textContent = product.nombre;
    dialog.querySelector("[data-viewer-hook]").textContent = product.gancho;
    dialog.querySelector("[data-viewer-use]").textContent = product.uso;
    dialog.querySelector("[data-viewer-data]").replaceChildren(...product.datos.map((d) => el("li", { text: d })));

    const price = dialog.querySelector("[data-viewer-price]");
    price.replaceChildren(el("strong", { text: priceLabel(product) }));
    if (product.precioAntes) price.append(" ", el("s", { text: `antes ${soles(product.precioAntes)}` }));

    dialog.querySelector("[data-viewer-cta]").href = whatsappLink(product.mensaje);
    dialog.classList.toggle("is-rosa", product.categoria === "linea-rosa");

    prev.hidden = next.hidden = !multiple;
    thumbs.replaceChildren(
      ...(multiple
        ? product.imagenes.map((src, n) =>
            el("button", { type: "button", "aria-label": `Ver imagen ${n + 1}`, onclick: () => show(n) }, [
              el("img", { src, alt: "", loading: "lazy" }),
            ])
          )
        : [])
    );

    show(0);
    dialog.showModal();
  };

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  dialog.querySelector("[data-viewer-close]").addEventListener("click", () => dialog.close());
  // Clic fuera del contenido cierra el visor
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (!product || product.imagenes.length < 2) return;
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  });
  dialog.addEventListener("close", () => opener && opener.focus && opener.focus());

  return { open };
})();

// Cualquier elemento con data-open-product abre el visor (carrusel, guías, kits, rutinas…)
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-product]");
  if (!trigger) return;
  event.preventDefault();
  viewer.open(trigger.dataset.openProduct, trigger);
});

const productLink = (id) => {
  const p = byId(id);
  return p ? el("button", { type: "button", class: "inline-product", "data-open-product": id, text: p.nombre }) : null;
};

const initCatalog = () => {
  if (typeof PRODUCTOS === "undefined") return;

  const grid = document.querySelector("[data-catalog]");
  const filters = document.querySelector("[data-filters]");
  const sort = document.querySelector("[data-sort]");
  const title = document.querySelector("[data-catalog-title]");
  const lead = document.querySelector("[data-catalog-lead]");
  const countEl = document.querySelector("[data-count-products]");
  if (countEl) countEl.textContent = PRODUCTOS.length;
  if (!grid) return;

  const defaultLead = lead ? lead.textContent.trim() : "";
  let current = "todos";

  const card = (p, i) => {
    const media = el("span", { class: "product-media" }, [
      el("img", {
        src: p.imagenes[0],
        alt: p.nombre,
        loading: "lazy",
        decoding: "async",
      }),
      el("span", { class: "product-zoom", "aria-hidden": "true", text: p.imagenes.length > 1 ? `+${p.imagenes.length - 1} fotos` : "Ver" }),
    ]);
    media.style.setProperty("--img", `url('${p.imagenes[0]}')`);

    const price = el("p", { class: "product-price" }, [el("strong", { text: priceLabel(p) })]);
    if (p.precioAntes) price.append(" ", el("s", { text: soles(p.precioAntes) }));

    const article = el(
      "article",
      { class: `product-card is-${p.categoria}`, "data-category": p.categoria },
      [
        el("button", { type: "button", class: "product-open", "data-open-product": p.id, "aria-label": `Ver ${p.nombre}` }, [media]),
        el("div", { class: "product-content" }, [
          el("span", { class: "cat-tag", text: CATEGORIAS[p.categoria].nombre }),
          el("h3", { text: p.nombre }),
          el("p", { class: "product-hook", text: p.gancho }),
          price,
        ]),
      ]
    );
    article.style.setProperty("--i", Math.min(i, 8));
    return article;
  };

  const render = () => {
    let list = PRODUCTOS.filter((p) => current === "todos" || p.categoria === current);
    const order = Object.keys(CATEGORIAS);
    const price = (p) => (p.precio === null ? Infinity : p.precio);
    if (sort.value === "precio-asc") list = [...list].sort((a, b) => price(a) - price(b));
    else if (sort.value === "precio-desc") list = [...list].sort((a, b) => (price(b) === Infinity ? -1 : price(b) - price(a)));
    else list = [...list].sort((a, b) => order.indexOf(a.categoria) - order.indexOf(b.categoria));

    grid.replaceChildren(...list.map(card));

    const cat = CATEGORIAS[current];
    if (title) title.textContent = cat ? cat.titulo : "Todos nuestros equipos";
    if (lead) lead.textContent = cat ? cat.bajada : defaultLead;
  };

  const chips = [["todos", `Todos (${PRODUCTOS.length})`]].concat(
    Object.entries(CATEGORIAS).map(([key, c]) => [key, `${c.nombre} (${PRODUCTOS.filter((p) => p.categoria === key).length})`])
  );
  chips.forEach(([key, label]) => {
    filters.append(
      el("button", {
        type: "button",
        role: "tab",
        class: `filter-chip is-${key}`,
        "aria-selected": String(key === current),
        "data-filter": key,
        text: label,
      })
    );
  });

  const select = (key) => {
    current = CATEGORIAS[key] ? key : "todos";
    filters.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.filter === current)));
    render();
  };

  filters.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-filter]");
    if (chip) select(chip.dataset.filter);
  });
  sort.addEventListener("change", render);

  // Tarjetas de categoría: filtran y bajan al catálogo
  const catGrid = document.querySelector("[data-categories]");
  if (catGrid) {
    Object.entries(CATEGORIAS).forEach(([key, c]) => {
      const items = PRODUCTOS.filter((p) => p.categoria === key);
      const cover = items[0].imagenes[0];
      const link = el("a", { href: "#catalogo", class: `category-card is-${key}`, "data-go-category": key }, [
        el("span", { class: "category-cover" }, [el("img", { src: cover, alt: "", loading: "lazy" })]),
        el("span", { class: "category-count", text: `${items.length} ${items.length === 1 ? "equipo" : "equipos"}` }),
        el("h3", { text: c.nombre }),
        el("p", { text: c.bajada }),
      ]);
      catGrid.append(link);
    });
    catGrid.addEventListener("click", (event) => {
      const link = event.target.closest("[data-go-category]");
      if (link) select(link.dataset.goCategory);
    });
  }

  render();
};

/* Guía por objetivo: orienta hacia los equipos sin vender */
const initGoals = () => {
  const box = document.querySelector("[data-goals]");
  if (!box || typeof PRODUCTOS === "undefined") return;
  const goals = [
    { titulo: "Moverte más, sin impacto", texto: "Cardio suave que cuida rodillas y tobillos.", productos: ["eliptica", "spinning-3en1"] },
    { titulo: "Caminar o trotar en casa", texto: "Para sumar pasos cuando no puedes salir.", productos: ["trotadora-mecanica", "trotadora-electrica"] },
    { titulo: "Ganar fuerza", texto: "Pocas piezas bien elegidas rinden para todo el cuerpo.", productos: ["mancuernas-24", "banca-plana", "barra-pared"] },
    { titulo: "Trabajar el abdomen", texto: "Movimientos guiados para el centro del cuerpo.", productos: ["ab-coaster", "ab-shaper", "banca-abdominal-ligas"] },
    { titulo: "Empezar con poco espacio", texto: "Compacto, fácil de guardar y de usar en cualquier rincón.", productos: ["set-rosa", "barra-pared"] },
  ];
  goals.forEach((g, i) => {
    box.append(
      el("div", { class: "goal-row" }, [
        el("span", { class: "goal-num", text: String(i + 1).padStart(2, "0") }),
        el("div", {}, [
          el("h3", { text: g.titulo }),
          el("p", { text: g.texto }),
          el("p", { class: "goal-products" }, g.productos.map(productLink)),
        ]),
      ])
    );
  });
};

/* Kits: combinaciones reales con total calculado */
const initKits = () => {
  const box = document.querySelector("[data-kits]");
  if (!box || typeof KITS === "undefined") return;
  KITS.forEach((kit) => {
    const items = kit.productos.map(byId).filter(Boolean);
    const total = items.reduce((sum, p) => sum + (kit.par && p.precioPar ? p.precioPar : p.precio || 0), 0);
    box.append(
      el("article", { class: "kit-card" }, [
        el("div", { class: "kit-thumbs" }, items.map((p) => el("img", { src: p.imagenes[0], alt: "", loading: "lazy" }))),
        el("h3", { text: kit.nombre }),
        el("p", { class: "kit-space", text: kit.espacio }),
        el("ul", { class: "kit-items" }, items.map((p) => el("li", {}, [productLink(p.id)]))),
        el("p", { class: "kit-total" }, [
          "Todo junto: ",
          el("strong", { text: soles(total) }),
          kit.nota ? el("small", { text: ` (${kit.nota.toLowerCase()})` }) : null,
        ]),
      ])
    );
  });
};

/* Rutinas de 20 minutos */
const initRoutines = () => {
  const box = document.querySelector("[data-routines]");
  if (!box || typeof RUTINAS === "undefined") return;
  RUTINAS.forEach((r) => {
    box.append(
      el("article", { class: "routine-card" }, [
        el("span", { class: "routine-time", text: "20 min" }),
        el("h3", { text: r.nombre }),
        el("ol", {}, r.pasos.map((paso) => el("li", { text: paso }))),
        el("p", { class: "routine-gear" }, ["Con: "].concat(r.equipo.map(productLink))),
      ])
    );
  });
};

/* Precios de temporada: solo productos con precio anterior real */
const initDeals = () => {
  const box = document.querySelector("[data-deals]");
  if (!box || typeof PRODUCTOS === "undefined") return;
  PRODUCTOS.filter((p) => p.precioAntes).forEach((p) => {
    box.append(
      el("button", { type: "button", class: "deal-row", "data-open-product": p.id }, [
        el("img", { src: p.imagenes[0], alt: "", loading: "lazy" }),
        el("span", { class: "deal-name", text: p.nombre }),
        el("span", { class: "deal-prices" }, [el("s", { text: soles(p.precioAntes) }), " ", el("strong", { text: soles(p.precio) })]),
      ])
    );
  });
};

/* Datos estructurados para buscadores: la tienda y su catálogo con precios en soles */
const initStructuredData = () => {
  if (typeof PRODUCTOS === "undefined") return;
  const base = "https://aldoveg.github.io/XPRESS-FITNESS-PRO/";
  const data = {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    name: "XPRESS Fitness PRO",
    url: base,
    logo: `${base}assets/marca/logo.png`,
    image: `${base}assets/productos/linea-rosa/contrapeso-ajustable-rosa.jpg`,
    telephone: `+${WHATSAPP_NUMBER}`,
    areaServed: { "@type": "Country", name: "Perú" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Equipos de entrenamiento",
      itemListElement: PRODUCTOS.filter((p) => p.precio).map((p) => ({
        "@type": "Offer",
        price: p.precio,
        priceCurrency: "PEN",
        itemOffered: {
          "@type": "Product",
          name: p.nombre,
          description: p.uso,
          image: `${base}${p.imagenes[0]}`,
          category: CATEGORIAS[p.categoria].nombre,
          brand: { "@type": "Brand", name: "XPRESS Fitness PRO" },
        },
      })),
    },
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.append(script);
};

initStructuredData();
initCatalog();
initGoals();
initKits();
initRoutines();
initDeals();

/* ---------- Formulario de contacto → WhatsApp ---------- */

const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("nameInput");
    const interestInput = document.getElementById("interestInput");
    const button = form.querySelector("button");
    const originalText = button.textContent;

    const name = nameInput ? nameInput.value.trim() : "";
    const interest = interestInput ? interestInput.value : "un equipo";

    button.textContent = "Abriendo WhatsApp...";
    button.disabled = true;

    window.open(whatsappLink(`Hola XPRESS Fitness PRO, soy ${name}. Tengo una consulta sobre ${interest}.`), "_blank");

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      form.reset();
    }, 1800);
  });
}
