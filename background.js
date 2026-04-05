chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToUtc",
    title: "Convert '%s' to UTC",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertToUtc" && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "contextMenuConvert",
      text: info.selectionText
    });
  }
});
