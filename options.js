document.getElementById("save").addEventListener("click", () => {
  const sites = document.getElementById("blockedSites").value.split("\n");
  const blockUntil = new Date(document.getElementById("blockUntil").value).getTime();

  chrome.storage.sync.set(
    {
      blockedSites: sites,
      blockUntilTime: blockUntil,
    },
    () => {
      alert("Block list and time saved!");
    }
  );
});
