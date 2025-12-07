let allItems = [];
let currentResults = [];

function initApp() {
  const FILE_URLS = [
    "https://raw.githubusercontent.com/Yu08083/nemuinemui/main/transformed_items.txt",
    "https://raw.githubusercontent.com/Yu08083/nemuinemui/main/transformed_items_other.txt"
  ];

  Promise.all(FILE_URLS.map(url => fetch(url).then(res => res.text())))
    .then(texts => {
      texts.forEach(text => {
        const lines = text.trim().split("\n");
        lines.forEach(line => {
          const parts = line.split("_");
          if (parts.length >= 3) {
            allItems.push({
              hex: parts[0].trim(),
              int: parts[1].trim(),
              name: parts.slice(2).join("_").trim()
            });
          }
        });
      });
      const loading = document.getElementById("loading");
      if(loading) {
        loading.innerHTML = '<i class="fa-solid fa-check-circle"></i> Data Loaded';
        loading.style.color = "#10b981";
      }
    })
    .catch(err => {
      console.error(err);
      const loading = document.getElementById("loading");
      if(loading) {
        loading.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Load Error';
        loading.style.color = "#ef4444";
      }
    });
}

function normalizeQuery(q) {
  return q.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
          .replace(/[,，]/g, "") 
          .trim();
}

function clearInput() {
  const textarea = document.getElementById("query");
  textarea.value = "";
  textarea.focus();
  searchItems();
}

function searchItems() {
  const rawInput = document.getElementById("query").value;
  const pcBody = document.getElementById("results-pc-body");
  const mobileBody = document.getElementById("results-mobile-body");
  const countSpan = document.getElementById("result-count");
  const statusSpan = document.getElementById("result-status");

  const keywords = rawInput.split(/[\n\s]+/)
                           .map(k => normalizeQuery(k).toLowerCase())
                           .filter(k => k.length > 0);

  if (keywords.length === 0) {
    const msg = `
      <div class="no-results fade-in">
        <i class="fa-solid fa-magnifying-glass-arrow-right"></i>
        Enter keywords
      </div>`;
    pcBody.innerHTML = `<tr><td colspan="3" style="padding:0;">${msg}</td></tr>`;
    mobileBody.innerHTML = msg;
    countSpan.textContent = "0";
    statusSpan.textContent = "Ready";
    currentResults = [];
    return;
  }

  const results = allItems.filter(item => {
    const hexLower = item.hex.toLowerCase();
    const nameLower = item.name.toLowerCase();
    return keywords.some(key => {
      return hexLower.includes(key) || item.int === key || nameLower.includes(key);
    });
  });

  currentResults = results;

  const MAX_DISPLAY = 500;
  countSpan.textContent = results.length;
  statusSpan.textContent = results.length > 0 ? "Found" : "Not Found";

  if (results.length === 0) {
    const msg = `
      <div class="no-results fade-in">
        <i class="fa-regular fa-face-frown-open"></i>
        No items found
      </div>`;
    pcBody.innerHTML = `<tr><td colspan="3" style="padding:0;">${msg}</td></tr>`;
    mobileBody.innerHTML = msg;
  } else {
    const displayData = results.slice(0, MAX_DISPLAY);

    pcBody.innerHTML = displayData.map(item => `
      <tr class="fade-in">
        <td><span class="code-badge bg-hex">${item.hex}</span></td>
        <td><span class="code-badge bg-int">${item.int}</span></td>
        <td><span class="item-name">${item.name}</span></td>
      </tr>
    `).join("");

    mobileBody.innerHTML = displayData.map(item => `
      <div class="m-card fade-in">
        <div class="m-header">
          <span class="code-badge bg-hex">${item.hex}</span>
          <span class="code-badge bg-int">${item.int}</span>
        </div>
        <div class="m-title">${item.name}</div>
      </div>
    `).join("");
  }
}

function downloadCSV() {
  if (!currentResults || currentResults.length === 0) {
    return;
  }

  let csvContent = "Hex ID,Signed Int,Item Name\n";
  currentResults.forEach(item => {
    const hex = `="${item.hex}"`; 
    const int = `="${item.int}"`;
    const name = `"${item.name.replace(/"/g, '""')}"`;
    csvContent += `${hex},${int},${name}\n`;
  });

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const now = new Date();
  const timestamp = now.toISOString().slice(0,19).replace(/[-T:]/g, "");
  link.download = `denpa_search_${timestamp}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById("query").addEventListener("keydown", function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    searchItems();
  }
});