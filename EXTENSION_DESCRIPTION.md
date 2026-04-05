The Timezone to UTC Converter is a professional browser extension designed to provide instantaneous, accurate UTC time conversions directly within the web browsing experience. It is built to assist developers, traders, and global teams who rely on UTC as their primary time standard.

The extension functions through three primary interaction layers:

1. Live System Dashboard: A draggable, glassmorphism-styled floating panel remains visible on web pages to provide real-time synchronization between UTC Universal time and the Local System time. The panel is designed with a high-contrast dashboard aesthetic and remembers its user-defined position across different websites and browsing sessions.

2. Smart Hover Detection: The extension automatically scans the webpage for time strings. When a user pauses their cursor over a detected time, a non-intrusive tooltip appears with the UTC equivalent. This system utilizes the Intl.DateTimeFormat API to ensure 100% accuracy during Daylight Saving Time transitions and includes smart context searching to identify timezones mentioned in surrounding text or metadata. It also features a 600ms grace period to allow for easy clicking to copy the result to the clipboard.

3. Global Context Menu and Popup: Users can highlight any text on a page and right-click to convert the selection to UTC via the browser's native context menu. Additionally, the extension popup offers manual conversion tools, including a quick-search timezone database, a manual date and time picker, and a smart-parse input field for natural language date strings.

Technical highlights include the use of Shadow DOM encapsulation to prevent website CSS from interfering with the extension's interface, and an event-driven architecture that minimizes CPU and memory overhead by using mouse-over triggers rather than constant polling.
