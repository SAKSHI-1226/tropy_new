const params = new URLSearchParams(window.location.search);
const trophyId = params.get("id");

const title = document.getElementById("title");
const tagline = document.getElementById("tagline");
const image = document.getElementById("trophyImage");
const factsContainer = document.getElementById("factsContainer");
const historyText = document.getElementById("historyText");
const timelineContainer = document.getElementById("timelineContainer");
const playButton = document.getElementById("playButton");
const audioPlayer = document.getElementById("audioPlayer");

const summaryViewBlock = document.getElementById("summaryViewBlock");
const timelineViewBlock = document.getElementById("timelineViewBlock");
const toggleSummaryBtn = document.getElementById("toggleSummaryBtn");
const toggleTimelineBtn = document.getElementById("toggleTimelineBtn");

const iconMap = {
    "presented to": "👤", "date of presentation": "📅", "date of commemoration": "📆",
    "occasion": "⚔️", "presented by": "🎖️", "material": "🛡️", "description": "📄"
};

async function loadData() {
    try {
        const response = await fetch("data/trophies.json");
        const trophies = await response.json();
        let currentTrophy = trophyId ? trophies.find(item => item.id === trophyId) : trophies[0];
        if (currentTrophy) displayPlacard(currentTrophy);
    } catch (error) { console.error("Data load error:", error); }
}

function displayPlacard(trophy) {
    title.textContent = trophy.title;
    tagline.textContent = trophy.tagline || trophy.subtitle || "";
    image.src = trophy.image ? `images/${trophy.image}` : "";
    // History - now naturally picks up the updated .summary-body p styling
    historyText.innerHTML = (Array.isArray(trophy.history) ? trophy.history : [trophy.history])
        .map(t => `<p>${t}</p>`)
        .join('');
    // Timeline Logic
    if (trophy.timeline && trophy.timeline.length > 0) {
        toggleTimelineBtn.style.display = "flex";
        timelineContainer.innerHTML = trophy.timeline.map((node, i) => `
            <div class="timeline-node">
                <div class="node-marker ${i === 1 ? 'highlight' : ''}"></div>
                <div class="node-content"><h4>${node.title}</h4><p>${node.text}</p></div>
            </div>`).join('');
    } else {
        toggleTimelineBtn.style.display = "none";
    }

    // Facts Grid
    factsContainer.innerHTML = "";
    if (trophy.facts) {
        const factsArray = Object.entries(trophy.facts);
        const gridItems = factsArray.slice(0, 4);
        const bannerItems = factsArray.slice(4);

        const splitRowWrapper = document.createElement("div");
        splitRowWrapper.className = "matrix-row-split";
        gridItems.forEach(([key, value]) => {
            splitRowWrapper.innerHTML += `<div class="fact-card"><div class="key-icon">${iconMap[key.toLowerCase().trim()] || "▪"}</div><div class="fact-meta-container"><span class="fact-key">${key}</span><span class="fact-val">${value}</span></div></div>`;
        });
        factsContainer.appendChild(splitRowWrapper);

        bannerItems.forEach(([key, value]) => {
            factsContainer.innerHTML += `<div class="fact-card full-width-banner"><div class="key-icon">${iconMap[key.toLowerCase().trim()] || "▪"}</div><div class="fact-meta-container"><span class="fact-key">${key}</span><span class="fact-val">${value}</span></div></div>`;
        });
    }

    // History
    historyText.innerHTML = (Array.isArray(trophy.history) ? trophy.history : [trophy.history]).map(t => `<p>${t}</p>`).join('');

    // Audio
    if (trophy.audio) {
        audioPlayer.src = `audio/${trophy.audio}`;
        playButton.style.display = "inline-flex";
    } else {
        playButton.style.display = "none";
    }
}

window.switchView = (view) => {
    summaryViewBlock.classList.toggle("hidden-element", view !== 'summary');
    timelineViewBlock.classList.toggle("hidden-element", view !== 'timeline');
    toggleSummaryBtn.classList.toggle("active", view === 'summary');
    toggleTimelineBtn.classList.toggle("active", view === 'timeline');
};

playButton.addEventListener("click", () => {
    if (audioPlayer.paused) { audioPlayer.play(); playButton.querySelector(".btn-main-label").textContent = "PAUSE STORY"; }
    else { audioPlayer.pause(); playButton.querySelector(".btn-main-label").textContent = "LISTEN TO THE STORY"; }
});

loadData();