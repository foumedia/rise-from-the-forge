function loadSectionContent(file, element) {
    fetch(file)
        .then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`HTTP status ${response.status}`);
            }
        })
        .then((html) => {
            element.innerHTML = html;
        })
        .finally(() => {
            if (file.includes('legends.html')) {
                loadLegendDetailsJson().then(() => {
                    bindLegendRowEvents(element);
                });
            }
            // --- Add this block for homebrew ---
            if (file.includes('homebrew.html')) {
                loadHomebrewDetailsJson().then(() => {
                    bindHomebrewRowEvents(element);
                });
            }
        })
        .catch((error) => {
            console.error(`Error loading ${file}: ${error.message}`);
            element.innerHTML = `<p>Error loading content. Please try again later.</p>`;
        });
}

let legendDetailsData = {};
let homebrewDetailsData = {};

function loadLegendDetailsJson() {
    return fetch('./data/legends.json')
        .then(res => res.json())
        .then(json => { legendDetailsData = json; });
}

// --- Add this function for homebrew ---
function loadHomebrewDetailsJson() {
    return fetch('./data/homebrew.json')
        .then(res => res.json())
        .then(json => { homebrewDetailsData = json; });
}

function renderLegendDetails(legendKey, afterRow) {
    // Remove any existing details row
    document.querySelectorAll('.legend-details-row.dynamic').forEach(el => el.remove());
    const data = legendDetailsData[legendKey];
    if (!data) return;

    // Build the details flexbox structure
    const flex = document.createElement('div');
    flex.className = 'legend-details-row active dynamic';
    flex.innerHTML = `
    <div class="legend-details-flex">
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Description</div>
        <div class="legend-details-value">${data.description}</div>
      </div>
      <div class="legend-details-row-flex">
        <div class="legend-details-label">SPECIAL ♥</div>
        <div class="legend-details-value">
          <div class="special-flex-header">
            ${['S', 'P', 'E', 'C', 'I', 'A', 'L', '♥'].map(l => `<span class="special-col">${l}</span>`).join('')}
          </div>
          <div class="special-flex-values">
            ${data.special.map(val => `<span class="special-col-value">${val}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Weapon</div>
        <div class="legend-details-value">
          ${Array.isArray(data.weapon) ? data.weapon.map(w => `${w}`).join('<br>') : data.weapon}
        </div>
      </div>
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Perks</div>
        <div class="legend-details-value">
          ${Array.isArray(data.perks) ? data.perks.map(p => `${p}`).join('<br>') : data.perks}
        </div>
      </div>
    </div>
  `;
    // Insert after the clicked row
    if (afterRow && afterRow.parentNode) {
        afterRow.parentNode.insertBefore(flex, afterRow.nextSibling);
    }
}

// --- Add this function for homebrew ---
function renderHomebrewDetails(homebrewKey, afterRow) {
    document.querySelectorAll('.homebrew-details-row.dynamic').forEach(el => el.remove());
    const data = homebrewDetailsData[homebrewKey];
    if (!data) return;
    const flex = document.createElement('div');
    flex.className = 'homebrew-details-row legend-details-row active dynamic';
    flex.innerHTML = `
    <div class="legend-details-flex">
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Description</div>
        <div class="legend-details-value">${data.description}</div>
      </div>
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Stats</div>
        <div class="legend-details-value">
          <strong>Damage:</strong> ${data.stats.damage}<br>
          <strong>Weight:</strong> ${data.stats.weight}<br>
          <strong>Special:</strong> ${data.stats.special}
        </div>
      </div>
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Creator</div>
        <div class="legend-details-value">${data.creator}</div>
      </div>
    </div>
  `;
    if (afterRow && afterRow.parentNode) {
        afterRow.parentNode.insertBefore(flex, afterRow.nextSibling);
    }
}

function bindLegendRowEvents(scope) {
    (scope || document).querySelectorAll('.legend-clickable').forEach(function (row) {
        // Remove previous listeners by using named handlers
        row.removeEventListener('click', row._legendClickHandler);
        row.removeEventListener('touchstart', row._legendTouchStartHandler);
        row.removeEventListener('touchend', row._legendTouchEndHandler);

        // Define named handlers so we can remove them later
        row._legendClickHandler = function () {
            const next = row.nextElementSibling;
            if (next && next.classList.contains('legend-details-row') && next.classList.contains('dynamic')) {
                next.remove();
                return;
            }
            document.querySelectorAll('.legend-details-row.dynamic').forEach(el => el.remove());
            var legend = row.getAttribute('data-legend');
            renderLegendDetails(legend, row);
        };

        // Touch event handlers for tap detection
        let touchStartY = 0, touchStartX = 0;
        row._legendTouchStartHandler = function (e) {
            if (e.touches && e.touches.length === 1) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }
        };
        row._legendTouchEndHandler = function (e) {
            if (e.changedTouches && e.changedTouches.length === 1) {
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndX = e.changedTouches[0].clientX;
                // Only trigger if finger didn't move much (i.e., not a scroll)
                if (Math.abs(touchEndY - touchStartY) < 10 && Math.abs(touchEndX - touchStartX) < 10) {
                    e.preventDefault();
                    row._legendClickHandler();
                }
            }
        };

        row.addEventListener('click', row._legendClickHandler);
        row.addEventListener('touchstart', row._legendTouchStartHandler);
        row.addEventListener('touchend', row._legendTouchEndHandler);
    });
}

// --- Add this function for homebrew ---
function bindHomebrewRowEvents(scope) {
    (scope || document).querySelectorAll('.legend-clickable[data-homebrew]').forEach(function (row) {
        row.removeEventListener('click', row._homebrewClickHandler);
        row._homebrewClickHandler = function () {
            const next = row.nextElementSibling;
            if (next && next.classList.contains('homebrew-details-row') && next.classList.contains('dynamic')) {
                next.remove();
                return;
            }
            document.querySelectorAll('.homebrew-details-row.dynamic').forEach(el => el.remove());
            const key = row.getAttribute('data-homebrew');
            renderHomebrewDetails(key, row);
        };
        row.addEventListener('click', row._homebrewClickHandler);
    });
}
