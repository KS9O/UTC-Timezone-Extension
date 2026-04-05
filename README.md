# Timezone → UTC Converter (v3.5)

The Timezone to UTC Converter is a professional browser extension designed to provide instantaneous, accurate UTC time conversions directly within the web browsing experience. It is built to assist developers, traders, and global teams who rely on UTC as their primary time standard.

## Video Demonstration
Watch the extension in action: [Click here to watch the demo on YouTube](https://www.youtube.com/watch?v=HMNJb-iqSaw)

---

## Key Features

### 1. Live System Dashboard
A draggable, glassmorphism-styled floating panel remains visible on web pages to provide real-time synchronization between **UTC Universal** time and the **Local System** time. The panel is designed with a high-contrast dashboard aesthetic and remembers its user-defined position across different websites and browsing sessions.

### 2. Smart Hover Detection
The extension automatically scans the webpage for time strings. When a user pauses their cursor over a detected time, a non-intrusive tooltip appears with the UTC equivalent.
*   **Precision:** Utilizes the `Intl.DateTimeFormat` API to ensure 100% accuracy during Daylight Saving Time transitions.
*   **Contextual Intelligence:** Includes smart context searching to identify timezones mentioned in surrounding text or metadata.
*   **UX Focused:** Features a 600ms grace period to allow for easy clicking to copy the result to the clipboard.

### 3. Global Context Menu and Popup
*   **Context Menu:** Highlight any text on a page and right-click to convert the selection to UTC via the browser's native context menu.
*   **Manual Tools:** The extension popup offers a quick-search timezone database, a manual date and time picker, and a smart-parse input field for natural language date strings.

---

## 🛠 Technical Highlights
*   **Shadow DOM Encapsulation:** Isolated UI components prevent website CSS from interfering with the extension's interface, ensuring visual consistency across all domains.
*   **Event-Driven Architecture:** Minimal CPU and memory overhead is achieved by utilizing `mouseover` triggers and storage listeners rather than constant polling.
*   **Cross-Tab Synchronization:** Integrated with `chrome.storage.onChanged` to keep panel visibility and preferences perfectly synced across all open browser tabs.

---

## Installation
* Add to your browser found within the [Google Chrome Extension Store](https://chromewebstore.google.com/detail/timezone-%E2%86%92-utc-converter/ldiglbdlekhfnaahokmmhomhfnolngap?authuser=1&hl=en&pli=1)

---

