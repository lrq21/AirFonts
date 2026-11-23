/**
 * @name AirFonts
 * @author moh
 * @version 1.2.0
 * @description Change the font of the entire Discord interface with live previews. Adds an "AirFonts" page to the Experience section of User Settings.
 */
module.exports = class AirFonts {
    constructor() {
        this.name = "AirFonts";
        // axis: Google Fonts weight spec ("" = font only ships one weight)
        this.fonts = [
            {id: "0", name: "Discord Default", family: "gg sans", axis: null, description: "Discord's original font"},
            {id: "A", name: "Inter", family: "Inter", axis: "wght@400;500;600;700", description: "Clean and balanced"},
            {id: "B", name: "Manrope", family: "Manrope", axis: "wght@400;500;600;700", description: "Geometric and modern"},
            {id: "C", name: "Nunito Sans", family: "Nunito Sans", axis: "wght@400;500;600;700", description: "Soft and rounded"},
            {id: "D", name: "IBM Plex Sans", family: "IBM Plex Sans", axis: "wght@400;500;600;700", description: "Sharp and technical"},
            {id: "E", name: "Poppins", family: "Poppins", axis: "wght@400;500;600;700", description: "Friendly and bold"},
            {id: "F", name: "Montserrat", family: "Montserrat", axis: "wght@400;500;600;700", description: "Wide and stylish"},
            {id: "G", name: "Rubik", family: "Rubik", axis: "wght@400;500;600;700", description: "Slightly rounded corners"},
            {id: "H", name: "Outfit", family: "Outfit", axis: "wght@400;500;600;700", description: "Minimal and modern"},
            {id: "I", name: "Lexend", family: "Lexend", axis: "wght@400;500;600;700", description: "Made for easy reading"},
            {id: "J", name: "DM Sans", family: "DM Sans", axis: "wght@400;500;600;700", description: "Simple and compact"},
            {id: "K", name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", axis: "wght@400;500;600;700", description: "Elegant and crisp"},
            {id: "L", name: "Space Grotesk", family: "Space Grotesk", axis: "wght@400;500;600;700", description: "Techy with character"},
            {id: "M", name: "Quicksand", family: "Quicksand", axis: "wght@400;500;600;700", description: "Light and cute"},
            {id: "N", name: "Comfortaa", family: "Comfortaa", axis: "wght@400;500;600;700", description: "Round and cute"},
            {id: "O", name: "Fredoka", family: "Fredoka", axis: "wght@400;500;600;700", description: "Bubbly and playful"},
            {id: "P", name: "Baloo 2", family: "Baloo 2", axis: "wght@400;500;600;700", description: "Chunky and cute"},
            {id: "Q", name: "Varela Round", family: "Varela Round", axis: "", description: "Smooth rounded letters"},
            {id: "R", name: "Nunito", family: "Nunito", axis: "wght@400;500;600;700", description: "Rounded and warm"},
            {id: "S", name: "Ubuntu", family: "Ubuntu", axis: "wght@400;500;700", description: "Classic Linux vibe"},
            {id: "T", name: "Lato", family: "Lato", axis: "wght@400;700", description: "Neutral and readable"},
            {id: "U", name: "JetBrains Mono", family: "JetBrains Mono", axis: "wght@400;500;600;700", description: "Coder monospace"},
            {id: "V", name: "Pacifico", family: "Pacifico", axis: "", description: "Handwritten script"}
        ];
        this.settings = {font: "A"};
        this.previewText = "Cute font Air";
        this.fallback = `"Segoe UI", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        this.anchorItem = "language_and_time_panel";
        this.itemKey = "airfonts_panel";
        this.observer = null;
        this.overlay = null;
        this.onDocClick = this.onDocClick.bind(this);
        this.onResize = this.positionOverlay.bind(this);
    }

    start() {
        const saved = BdApi.Data.load(this.name, "settings") || {};
        this.settings.font = this.fonts.some(font => font.id === saved.font) ? saved.font : "A";
        this.applyFont();
        BdApi.DOM.addStyle(this.name + "-ui", this.uiCss());
        this.injectSidebarItem();
        this.observer = new MutationObserver(() => this.injectSidebarItem());
        this.observer.observe(document.body, {childList: true, subtree: true});
        document.addEventListener("click", this.onDocClick, true);
        window.addEventListener("resize", this.onResize);
    }

    stop() {
        BdApi.DOM.removeStyle(this.name);
        BdApi.DOM.removeStyle(this.name + "-ui");
        this.observer?.disconnect();
        this.observer = null;
        document.removeEventListener("click", this.onDocClick, true);
        window.removeEventListener("resize", this.onResize);
        this.closeOverlay();
        document.querySelectorAll(`[data-settings-sidebar-item="${this.itemKey}"]`).forEach(el => el.remove());
        document.querySelectorAll("link[data-airfonts-font]").forEach(el => el.remove());
    }

    // ---------- Font loading ----------
    fontUrl(font) {
        const fam = font.family.replace(/ /g, "+");
        return `https://fonts.googleapis.com/css2?family=${fam}${font.axis ? ":" + font.axis : ""}&display=swap`;
    }

    loadFont(font) {
        if (font.axis === null) return; // built-in Discord font
        if (document.querySelector(`link[data-airfonts-font="${font.id}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = this.fontUrl(font);
        link.dataset.airfontsFont = font.id;
        document.head.appendChild(link);
    }

    stack(font) {
        return `"${font.family}", ${this.fallback}`;
    }

    applyFont() {
        const font = this.fonts.find(item => item.id === this.settings.font) || this.fonts[1];
        BdApi.DOM.removeStyle(this.name);
        if (font.axis === null) return; // Discord Default = no override
        this.loadFont(font);
        const s = this.stack(font);
        const css = `
:root, html, body, #app-mount, .theme-dark, .theme-light, .theme-darker, .theme-midnight, [class*="theme-"] {
  --airfonts-family: ${s};
  --font-primary: ${s} !important;
  --font-display: ${s} !important;
  --font-headline: ${s} !important;
  --font-code: ${s} !important;
  --font-clan-body: ${s} !important;
  --font-clan-signature: ${s} !important;
}
html, body, body *, body input, body textarea, body button, body select, body pre, body code, body kbd, body samp {
  font-family: ${s} !important;
}
body *::before, body *::after { font-family: ${s} !important; }
body ::placeholder { font-family: ${s} !important; }`;
        BdApi.DOM.addStyle(this.name, css);
    }

    uiCss() {
        return `
.airfonts-overlay{position:fixed;z-index:1002;overflow-y:auto;background:var(--background-base-lower, var(--background-primary, #313338));box-sizing:border-box;padding:24px 32px}
.airfonts-item-active .airfonts-item-inner{background:var(--background-modifier-selected, rgba(78,80,88,.6));color:var(--interactive-active, #fff)}`;
    }

    // ---------- Sidebar ----------
    injectSidebarItem() {
        const anchor = document.querySelector(`[data-settings-sidebar-item="${this.anchorItem}"]`);
        if (!anchor) {
            if (this.overlay) this.closeOverlay();
            return;
        }
        const list = anchor.parentElement;
        if (!list || list.querySelector(`[data-settings-sidebar-item="${this.itemKey}"]`)) return;

        const item = anchor.cloneNode(true);
        item.setAttribute("data-settings-sidebar-item", this.itemKey);
        item.classList.add("airfonts-item");
        const inner = item.querySelector('[role="link"]') || item.firstElementChild;
        if (inner) {
            inner.classList.add("airfonts-item-inner");
            inner.removeAttribute("data-list-item-id");
            inner.setAttribute("tabindex", "0");
        }
        // Icon: "Aa" glyph instead of the language icon
        const svg = item.querySelector("svg");
        if (svg) {
            svg.innerHTML = '<text x="12" y="17" text-anchor="middle" fill="currentColor" style="font-family:Georgia,serif !important" font-size="15" font-weight="700">Aa</text>';
        }
        const label = item.querySelector("[data-text-variant]");
        if (label) label.textContent = "AirFonts";
        item.querySelectorAll('[class*="subnavContainer"]').forEach(el => el.remove());

        item.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.openOverlay(item);
        });
        item.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.openOverlay(item); }
        });
        anchor.after(item);
    }

    onDocClick(e) {
        if (!this.overlay) return;
        const sideItem = e.target.closest?.("[data-settings-sidebar-item]");
        if (sideItem && sideItem.getAttribute("data-settings-sidebar-item") !== this.itemKey) this.closeOverlay();
    }

    findSidebar(item) {
        // Walk up while the container is still a side column
        let el = item;
        let best = item;
        const maxW = window.innerWidth * 0.45;
        while (el && el !== document.body) {
            const r = el.getBoundingClientRect();
            if (r.width > maxW) break;
            best = el;
            el = el.parentElement;
        }
        return best;
    }

    openOverlay(item) {
        this.closeOverlay();
        this.sidebarEl = this.findSidebar(item);
        const overlay = document.createElement("div");
        overlay.className = "airfonts-overlay";
        overlay.appendChild(this.buildPanel());
        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.positionOverlay();
        document.querySelectorAll(".airfonts-item").forEach(el => el.classList.add("airfonts-item-active"));
    }

    positionOverlay() {
        if (!this.overlay || !this.sidebarEl) return;
        if (!document.body.contains(this.sidebarEl)) return this.closeOverlay();
        const r = this.sidebarEl.getBoundingClientRect();
        Object.assign(this.overlay.style, {
            left: r.right + "px",
            top: r.top + "px",
            right: "0px",
            height: r.height + "px"
        });
    }

    closeOverlay() {
        this.overlay?.remove();
        this.overlay = null;
        this.sidebarEl = null;
        document.querySelectorAll(".airfonts-item-active").forEach(el => el.classList.remove("airfonts-item-active"));
    }

    // ---------- Panel ----------
    selectFont(id) {
        if (!this.fonts.some(font => font.id === id)) return;
        this.settings.font = id;
        BdApi.Data.save(this.name, "settings", this.settings);
        this.applyFont();
        this.updateCards();
    }

    activeName() {
        return this.fonts.find(f => f.id === this.settings.font)?.name || "Inter";
    }

    updateCards() {
        for (const panel of document.querySelectorAll(".airfonts-settings")) {
            for (const card of panel.querySelectorAll("[data-airfont]")) {
                const chosen = card.dataset.airfont === this.settings.font;
                card.style.borderColor = chosen ? "var(--brand-experiment, #5865f2)" : "var(--background-modifier-accent)";
                card.style.boxShadow = chosen ? "0 0 0 1px var(--brand-experiment, #5865f2)" : "none";
                card.setAttribute("aria-pressed", String(chosen));
            }
            const status = panel.querySelector("[data-airfonts-status]");
            if (status) status.textContent = "Active font: " + this.activeName();
        }
    }

    buildPanel() {
        this.fonts.forEach(font => this.loadFont(font)); // load all fonts for the previews
        const panel = document.createElement("div");
        panel.className = "airfonts-settings";
        panel.style.cssText = "max-width:900px;color:var(--text-normal, #dbdee1)";
        const title = document.createElement("h2");
        title.textContent = "AirFonts";
        title.style.cssText = "margin:0 0 6px;font-size:20px;font-weight:700;color:var(--header-primary, #f2f3f5)";
        const intro = document.createElement("p");
        intro.textContent = "Pick a font: it applies instantly across the whole interface.";
        intro.style.cssText = "margin:0 0 16px;color:var(--text-muted)";
        const grid = document.createElement("div");
        grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:12px";
        for (const font of this.fonts) {
            const selected = font.id === this.settings.font;
            // inline !important wins over the global font rule, so each card keeps its own font
            const ff = `${this.stack(font)} !important`;
            const card = document.createElement("button");
            card.type = "button";
            card.dataset.airfont = font.id;
            card.setAttribute("aria-pressed", String(selected));
            card.style.cssText = `text-align:left;padding:14px;border:1px solid ${selected ? "var(--brand-experiment, #5865f2)" : "var(--background-modifier-accent)"};box-shadow:${selected ? "0 0 0 1px var(--brand-experiment, #5865f2)" : "none"};border-radius:10px;background:var(--background-secondary);color:var(--text-normal);cursor:pointer;font-family:${ff}`;
            const key = document.createElement("div");
            key.textContent = font.id === "0" ? "DEFAULT" : font.id;
            key.style.cssText = `font-size:11px;opacity:.65;font-weight:700;letter-spacing:.08em;font-family:${ff}`;
            const name = document.createElement("div");
            name.textContent = font.name;
            name.style.cssText = `margin-top:6px;font-size:17px;font-weight:700;font-family:${ff}`;
            const preview = document.createElement("div");
            preview.textContent = this.previewText;
            preview.style.cssText = `margin-top:12px;font-size:22px;line-height:1.35;font-family:${ff}`;
            const note = document.createElement("div");
            note.textContent = font.description;
            note.style.cssText = `margin-top:10px;font-size:11px;color:var(--text-muted);font-family:${ff}`;
            card.append(key, name, preview, note);
            card.addEventListener("click", () => this.selectFont(font.id));
            grid.appendChild(card);
        }
        const status = document.createElement("div");
        status.dataset.airfontsStatus = "true";
        status.style.cssText = "margin-top:14px;font-size:12px;color:var(--text-muted)";
        status.textContent = "Active font: " + this.activeName();
        panel.append(title, intro, grid, status);
        return panel;
    }

    getSettingsPanel() {
        const wrap = this.buildPanel();
        wrap.style.padding = "16px";
        return wrap;
    }
};
