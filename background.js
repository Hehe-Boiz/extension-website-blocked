let blockedSites = [];
let blockUntilTime = null;

chrome.storage.sync.get(["blockedSites", "blockUntilTime"], (data) => {
  blockedSites = data.blockedSites || [];
  blockUntilTime = data.blockUntilTime || null;
  updateBlockingRules();
});

function updateBlockingRules() {
  const now = new Date().getTime();
  if (blockUntilTime && now < blockUntilTime) {
    const rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { 
        type: "redirect",
        redirect: { url: chrome.runtime.getURL("challenge.html") + "?site=" + encodeURIComponent(site) }
      },
      condition: {
        urlFilter: site,
        resourceTypes: ["main_frame"],
      },
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
      removeRuleIds: rules.map((rule) => rule.id),
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: blockedSites.map((_, index) => index + 1),
    });
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue || [];
  }
  if (changes.blockUntilTime) {
    blockUntilTime = changes.blockUntilTime.newValue || null;
  }
  updateBlockingRules();
});

// Xử lý yêu cầu từ challenge.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "VERIFY_CHALLENGE") {
    const isCorrect = verifyChallengeAnswer(request.challenge, request.answer);
    sendResponse({ success: isCorrect });
  }
});

function verifyChallengeAnswer(challenge, answer) {
  switch (challenge.type) {
    case 'math':
      return Number(answer) === challenge.expectedAnswer;
    case 'typing':
      return answer.toLowerCase() === challenge.text.toLowerCase();
    default:
      return false;
  }
}