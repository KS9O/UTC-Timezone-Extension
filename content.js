(function() {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let selectedTz = localTz;
  let panelVisible = true;
  let currentUTC = null;
  let activeTarget = null;
  let hoverTimeout = null;
  let hideTimeout = null;
  let mouseX = 0, mouseY = 0;

  const container = document.createElement("div");
  container.id = "utc-converter-extension-root";
  const shadow = container.attachShadow({ mode: "open" });
  document.body.appendChild(container);

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    #utc-converter-panel {
      position: fixed; 
      background: rgba(15, 23, 42, 0.95); 
      color: white;
      padding: 14px; 
      border-radius: 14px; 
      box-shadow: 0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
      z-index: 2147483647; 
      min-width: 170px; 
      backdrop-filter: blur(16px);
      display: none; 
      cursor: move; 
      user-select: none;
      transition: opacity 0.3s ease;
      border: 1px solid rgba(56, 189, 248, 0.1);
    }
    #utc-converter-panel.show { display: block; }
    
    .panel-header { 
      font-size: 9px; 
      color: #94a3b8; 
      text-transform: uppercase; 
      letter-spacing: 1.2px; 
      margin-bottom: 10px; 
      font-weight: 700; 
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .time-group {
      background: rgba(30, 41, 59, 0.5);
      padding: 8px 10px;
      border-radius: 8px;
      margin-bottom: 6px;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .time-row { 
      display: flex; 
      flex-direction: column;
      gap: 1px;
    }

    .time-label { 
      font-size: 8px; 
      color: #64748b; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .time-val { 
      color: #38bdf8; 
      font-size: 18px; 
      font-weight: 700; 
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.3px;
      line-height: 1.1;
      text-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
    }

    .tz-info { 
      font-size: 10px; 
      color: #475569; 
      margin-top: 6px; 
      text-align: center; 
      font-weight: 600;
    }

    .close-btn { 
      cursor: pointer; 
      color: #475569; 
      font-size: 16px; 
      line-height: 1;
      transition: color 0.2s;
    }
    .close-btn:hover { color: #f87171; }

    .utc-hover-tooltip {
      position: fixed; background: #1e293b; color: white; padding: 12px 16px;
      border-radius: 12px; font-size: 14px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
      z-index: 2147483647; display: none; backdrop-filter: blur(16px); text-align: center;
      border: 1px solid rgba(56, 189, 248, 0.4); pointer-events: auto;
      opacity: 0; transform: translateY(10px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .utc-hover-tooltip.active { display: block; opacity: 1; transform: translateY(0); }
    .utc-hover-label { color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
    .utc-hover-time { color: #38bdf8; font-weight: 800; font-size: 20px; display: block; line-height: 1; }
    .copy-hint { color: #22c55e; font-size: 11px; margin-top: 8px; font-weight: 600; display: block; }
  `;
  shadow.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "utc-converter-panel";
  panel.innerHTML = `
    <div class="panel-header">
      <span>System Status</span>
      <span class="close-btn" id="utcPanelClose">×</span>
    </div>
    
    <div class="time-group">
      <div class="time-row">
        <span class="time-label">UTC Universal</span>
        <span class="time-val" id="utcTimeDisplay">--:--</span>
      </div>
    </div>

    <div class="time-group">
      <div class="time-row">
        <span class="time-label">Local System</span>
        <span class="time-val" id="localTimeDisplay">--:--</span>
      </div>
    </div>

    <div class="tz-info" id="tzDisplay"></div>
  `;
  shadow.appendChild(panel);

  const tooltip = document.createElement("div");
  tooltip.className = "utc-hover-tooltip";
  tooltip.innerHTML = `<span class="utc-hover-label">UTC Conversion</span><span class="utc-hover-time"></span><span class="copy-hint" id="copyHint">Click to Copy</span>`;
  shadow.appendChild(tooltip);

  const highlightStyle = document.createElement("style");
  highlightStyle.textContent = `.utc-highlight-target { outline: 2px dashed #38bdf8 !important; outline-offset: 2px !important; background: rgba(56, 189, 248, 0.08) !important; transition: background 0.2s; }`;
  document.head.appendChild(highlightStyle);

  const tzMap = { "EST":"America/New_York","EDT":"America/New_York","CST":"America/Chicago","CDT":"America/Chicago","MST":"America/Denver","MDT":"America/Denver","PST":"America/Los_Angeles","PDT":"America/Los_Angeles","UTC":"UTC","GMT":"UTC" };
  const timeRegex = /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\s*(am|pm)?\b/i;

  function findTz(el) {
    let curr = el;
    for(let i=0; i<5; i++) {
      if(!curr) break;
      const t = (curr.innerText || curr.getAttribute('title') || curr.getAttribute('aria-label') || "").toUpperCase();
      for(const k in tzMap) { if(t.includes(k)) return tzMap[k]; }
      curr = curr.parentElement;
    }
    return null;
  }

  function showTooltip(x, y, utc, target) {
    currentUTC = utc;
    tooltip.querySelector(".utc-hover-time").textContent = utc;
    tooltip.querySelector("#copyHint").textContent = "Click to Copy";
    
    let finalX = x + 15;
    let finalY = y + 15;
    if (finalX + 180 > window.innerWidth) finalX = x - 190;
    if (finalY + 100 > window.innerHeight) finalY = y - 110;

    tooltip.style.left = finalX + "px";
    tooltip.style.top = finalY + "px";
    tooltip.classList.add("active");
    
    if(target) {
      if(activeTarget) activeTarget.classList.remove("utc-highlight-target");
      activeTarget = target;
      activeTarget.classList.add("utc-highlight-target");
    }
  }

  function hideTooltip() {
    tooltip.classList.remove("active");
    setTimeout(() => {
        if (!tooltip.classList.contains("active")) {
            if(activeTarget) activeTarget.classList.remove("utc-highlight-target");
            activeTarget = null;
            currentUTC = null;
        }
    }, 200);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("#utc-converter-extension-root")) {
      clearTimeout(hideTimeout);
      return;
    }

    const target = e.target;
    const candidates = [target.innerText, target.getAttribute('title'), target.getAttribute('aria-label')].filter(Boolean);
    
    let match = null;
    for (const text of candidates) {
        if (text.length > 3 && text.length < 150) {
            match = text.trim().match(timeRegex);
            if (match) break;
        }
    }

    if (match) {
        clearTimeout(hoverTimeout);
        clearTimeout(hideTimeout);
        hoverTimeout = setTimeout(() => {
            const tz = findTz(target);
            const now = new Date();
            let h = parseInt(match[1]);
            if(match[4]?.toLowerCase()==="pm" && h!==12) h+=12;
            if(match[4]?.toLowerCase()==="am" && h===12) h=0;
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, parseInt(match[2]));
            
            const opts = { hour:"2-digit", minute:"2-digit", hour12:true, timeZone:"UTC" };
            let utcStr = tz ? 
                new Intl.DateTimeFormat("en-US", opts).format(new Date(d.getTime() + (d.getTime() - new Date(d.toLocaleString("en-US", { timeZone: tz })).getTime()))) :
                new Intl.DateTimeFormat("en-US", opts).format(d);
            
            showTooltip(mouseX, mouseY, utcStr, target);
        }, 150);
    }
  }, true);

  document.addEventListener("mouseout", (e) => {
    clearTimeout(hoverTimeout);
    if (tooltip.classList.contains("active")) {
        hideTimeout = setTimeout(() => {
            if (!tooltip.matches(":hover")) hideTooltip();
        }, 600);
    }
  }, true);

  tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
  tooltip.addEventListener("mouseleave", hideTooltip);
  window.addEventListener("scroll", hideTooltip, { passive: true });

  tooltip.addEventListener("click", () => {
    if(currentUTC) {
      navigator.clipboard.writeText(currentUTC);
      tooltip.querySelector("#copyHint").textContent = "✓ Copied to Clipboard";
      setTimeout(hideTooltip, 1000);
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "showUtcPanel") {
        panel.classList.add("show");
    } else if (msg.type === "hideUtcPanel") {
        panel.classList.remove("show");
    } else if (msg.type === "contextMenuConvert") {
        const match = msg.text.match(timeRegex);
        if (match) {
            const now = new Date();
            let h = parseInt(match[1]);
            if(match[4]?.toLowerCase()==="pm" && h!==12) h+=12;
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, parseInt(match[2]));
            const utcStr = new Intl.DateTimeFormat("en-US", { hour:"2-digit", minute:"2-digit", hour12:true, timeZone:"UTC" }).format(d);
            showTooltip(mouseX, mouseY, utcStr, null);
        }
    }
  });

  let drag=false, sx, sy, il, it;
  panel.addEventListener("mousedown", (e) => {
    if(e.target.id==="utcPanelClose") return;
    drag=true; sx=e.clientX; sy=e.clientY;
    const r=panel.getBoundingClientRect(); il=r.left; it=r.top;
    panel.style.bottom="auto"; panel.style.right="auto";
  });
  document.addEventListener("mousemove", (e) => {
    if(!drag) return;
    panel.style.left=(il+(e.clientX-sx))+"px";
    panel.style.top=(it+(e.clientY-sy))+"px";
  });
  document.addEventListener("mouseup", () => {
    if(drag) { drag=false; chrome.storage.sync.set({ panelPos: { left: panel.style.left, top: panel.style.top } }); }
  });

  shadow.getElementById("utcPanelClose").addEventListener("click", () => {
    panel.classList.remove("show");
    chrome.storage.sync.set({ panelVisible: false });
  });

  function update() {
    const n = new Date();
    const f = (t) => new Intl.DateTimeFormat("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true, timeZone:t }).format(n);
    shadow.getElementById("utcTimeDisplay").textContent = f("UTC");
    shadow.getElementById("localTimeDisplay").textContent = f(localTz);
    shadow.getElementById("tzDisplay").textContent = selectedTz.replace(/_/g, " ");
  }

  chrome.storage.sync.get(["selectedTimezone", "panelVisible", "panelPos"], (r) => {
    if(r.selectedTimezone) selectedTz = r.selectedTimezone;
    if(r.panelPos) { panel.style.left=r.panelPos.left; panel.style.top=r.panelPos.top; }
    else { panel.style.bottom="16px"; panel.style.right="16px"; }
    panel.classList.toggle("show", r.panelVisible !== false);
    update();
  });
  setInterval(update, 1000);
})();
