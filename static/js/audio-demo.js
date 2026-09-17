const manifest = await fetch("static/data/manifest.json").then((response) => response.json());
const samplesTable = document.getElementById("samples-table");
const refreshButton = document.getElementById("refresh-samples");

let seed = 123456;

function seededRandom() {
  seed += 0x6D2B79F5;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function chooseSamples() {
  const shuffled = [...manifest.samples];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, manifest.visibleSampleCount);
}

function audioFor(sample, column) {
  return column.key === "original" ? sample.original : sample.models[column.key].audio;
}

function renderSamplesTable(samples) {
  samplesTable.innerHTML = `
    <thead>
      <tr>
        <th></th>
        ${manifest.columns.map((column) => `
          <th>${column.label}</th>
        `).join("")}
      </tr>
    </thead>
    <tbody>
      ${samples.map((sample) => `
        <tr>
          <td class="sample-cell">${sample.label}</td>
          ${manifest.columns.map((column) => `
            <td class="audio-cell">
              <audio class="audio-example" controls preload="none">
                <source src="${audioFor(sample, column)}" type="audio/mpeg">
              </audio>
            </td>
          `).join("")}
        </tr>
      `).join("")}
    </tbody>
  `;
}

function stopOtherAudio(activeAudio) {
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio === activeAudio) return;
    audio.pause();
    audio.currentTime = 0;
  });
}

document.addEventListener("play", (event) => {
  if (!(event.target instanceof HTMLAudioElement)) return;
  stopOtherAudio(event.target);
  event.target.currentTime = 0;
}, true);

refreshButton.addEventListener("click", () => {
  seed = Date.now();
  renderSamplesTable(chooseSamples());
});

renderSamplesTable(chooseSamples());
