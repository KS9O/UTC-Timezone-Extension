document.addEventListener("DOMContentLoaded", () => {
  const timezoneAliases = {
    "PST": "America/Los_Angeles", "PDT": "America/Los_Angeles",
    "MST": "America/Denver", "MDT": "America/Denver",
    "CST": "America/Chicago", "CDT": "America/Chicago",
    "EST": "America/New_York", "EDT": "America/New_York",
    "GMT": "UTC", "UTC": "UTC", "JST": "Asia/Tokyo"
  };

  let timezones = [];
  try {
    timezones = Intl.supportedValuesOf("timeZone");
  } catch (e) {
    timezones = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "UTC", "Europe/London", "Asia/Tokyo"];
  }

  let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let panelVisible = true;

  const search = document.getElementById("timezoneSearch");
  const list = document.getElementById("timezoneList");
  const datetimePopup = document.getElementById("datetimePopup");
  const panelToggle = document.getElementById("panelToggle");
  const toggleRow = document.querySelector(".toggle-row");
  const output = document.getElementById("output");

  const formatTzName = (tz) => tz.replace(/_/g, " ");

  const renderList = (filter = "") => {
    list.innerHTML = "";
    let filtered = filter 
      ? timezones.filter(tz => tz.toLowerCase().includes(filter.toLowerCase()))
      : timezones.slice(0, 20);
    
    const upperFilter = filter.toUpperCase();
    if (timezoneAliases[upperFilter] && !filtered.includes(timezoneAliases[upperFilter])) {
      filtered.unshift(timezoneAliases[upperFilter]);
    }

    if (filtered.length > 0) {
      list.style.display = "block";
      filtered.slice(0, 15).forEach(tz => {
        const div = document.createElement("div");
        div.className = "option";
        div.textContent = formatTzName(tz);
        div.style.cssText = "padding:8px 12px; cursor:pointer; font-size:13px; border-bottom:1px solid #334155; color:white;";
        div.addEventListener("click", () => {
          selectedTimezone = tz;
          search.value = formatTzName(tz);
          list.style.display = "none";
          chrome.storage.sync.set({ selectedTimezone: tz });
        });
        list.appendChild(div);
      });
    } else {
      list.style.display = "none";
    }
  };

  search.addEventListener("input", (e) => renderList(e.target.value));
  search.addEventListener("focus", (e) => renderList(e.target.value));
  document.addEventListener("click", (e) => {
    if (!search.contains(e.target) && !list.contains(e.target)) list.style.display = "none";
  });

  document.getElementById("datetimeIcon").addEventListener("click", (e) => {
    e.stopPropagation();
    datetimePopup.classList.toggle("show");
    datetimePopup.style.left = "16px";
    datetimePopup.style.top = "160px";
  });

  document.addEventListener("click", (e) => {
    if (!datetimePopup.contains(e.target) && e.target.id !== "datetimeIcon") {
      datetimePopup.classList.remove("show");
    }
  });

  const showResult = (utcStr) => {
    output.textContent = utcStr;
    output.style.color = "#38bdf8";
    navigator.clipboard.writeText(utcStr);
    const originalText = utcStr;
    setTimeout(() => {
      output.textContent = "Copied to clipboard!";
      output.style.color = "#4ade80";
      setTimeout(() => {
        output.textContent = originalText;
        output.style.color = "#38bdf8";
      }, 2000);
    }, 200);
  };

  const formatToUTC = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false, timeZone: "UTC"
    }).format(date).replace(/(\d+)\/(\d+)\/(\d+),?\s*/, "$3-$1-$2 ");
  };

  document.getElementById("convertBtn").addEventListener("click", () => {
    const time = document.getElementById("localTime").value;
    if (!time) return (output.textContent = "Select time", output.style.color = "#f87171");
    
    const [h, m] = time.split(":");
    const date = new Date();
    date.setHours(h, m, 0);
    showResult(formatToUTC(date));
  });

  document.getElementById("convertFromPopup").addEventListener("click", () => {
    const dateVal = document.getElementById("manualDate").value;
    const timeVal = document.getElementById("manualTime").value;
    if (!dateVal && !timeVal) return (output.textContent = "Select date/time", output.style.color = "#f87171");

    let d = new Date();
    if (dateVal && timeVal) d = new Date(`${dateVal}T${timeVal}`);
    else if (dateVal) d = new Date(`${dateVal}T00:00:00`);
    else if (timeVal) {
      const [h, m] = timeVal.split(":");
      d.setHours(h, m, 0);
    }

    if (isNaN(d)) return (output.textContent = "Invalid date", output.style.color = "#f87171");
    showResult(formatToUTC(d));
    datetimePopup.classList.remove("show");
  });

  document.getElementById("convertCustomBtn").addEventListener("click", () => {
    const inputStr = document.getElementById("customInput").value.trim();
    if (!inputStr) return (output.textContent = "Enter something", output.style.color = "#f87171");
    
    const d = new Date(inputStr);
    if (isNaN(d)) return (output.textContent = "Could not parse", output.style.color = "#f87171");
    showResult(formatToUTC(d));
  });

  const togglePanel = () => {
    panelVisible = !panelVisible;
    panelToggle.classList.toggle("on", panelVisible);
    chrome.storage.sync.set({ panelVisible });
    
    // Broadcast message to active tab as a priority update
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: panelVisible ? "showUtcPanel" : "hideUtcPanel" }, () => {
          if (chrome.runtime.lastError) { /* ignore */ }
        });
      }
    });
  };

  toggleRow.addEventListener("click", togglePanel);
  toggleRow.style.cursor = "pointer";

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.panelVisible) {
      panelVisible = changes.panelVisible.newValue;
      panelToggle.classList.toggle("on", panelVisible);
    }
  });

  chrome.storage.sync.get(["selectedTimezone", "panelVisible"], (r) => {
    if (r.selectedTimezone) {
      selectedTimezone = r.selectedTimezone;
      search.value = formatTzName(selectedTimezone);
    } else {
      search.value = formatTzName(selectedTimezone);
    }
    if (r.panelVisible !== undefined) panelVisible = r.panelVisible;
    panelToggle.classList.toggle("on", panelVisible);
  });
});
