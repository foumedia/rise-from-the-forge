let detailsData = {};

// Generic function to load JSON data for a section
function loadDetailsJson(section, url) {
    return fetch(url)
        .then(res => res.json())
        .then(json => { detailsData[section] = json; });
}

// Generic function to render details for a row
function renderDetails(section, key, afterRow, renderFn, detailsRowClass) {
    // Remove any existing details row for this section
    document.querySelectorAll(`.${detailsRowClass}.dynamic`).forEach(el => el.remove());
    const data = detailsData[section][key];
    if (!data) return;

    const flex = document.createElement('div');
    flex.className = `${detailsRowClass} active dynamic`;
    flex.innerHTML = renderFn(data);
    if (afterRow && afterRow.parentNode) {
        afterRow.parentNode.insertBefore(flex, afterRow.nextSibling);
    }
}

// Example render functions for each section
function renderLegendDetailsContent(data) {
    return `
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
}

function renderHomebrewDetailsContent(data) {
    return `
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
}

// Generic event binder for expandable table rows
function bindExpandableRowEvents({
    selector,
    section,
    keyAttr,
    renderFn,
    detailsRowClass
}, scope) {
    (scope || document).querySelectorAll(selector).forEach(function (row) {
        // Remove previous listeners
        row.removeEventListener('click', row._expandableClickHandler);
        row.removeEventListener('touchstart', row._expandableTouchStartHandler);
        row.removeEventListener('touchend', row._expandableTouchEndHandler);

        // Click handler
        row._expandableClickHandler = function () {
            const next = row.nextElementSibling;
            if (next && next.classList.contains(detailsRowClass) && next.classList.contains('dynamic')) {
                next.remove();
                return;
            }
            document.querySelectorAll(`.${detailsRowClass}.dynamic`).forEach(el => el.remove());
            const key = row.getAttribute(keyAttr);
            renderDetails(section, key, row, renderFn, detailsRowClass);
        };

        // Touch event handlers for tap detection
        let touchStartY = 0, touchStartX = 0;
        row._expandableTouchStartHandler = function (e) {
            if (e.touches && e.touches.length === 1) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }
        };
        row._expandableTouchEndHandler = function (e) {
            if (e.changedTouches && e.changedTouches.length === 1) {
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndX = e.changedTouches[0].clientX;
                if (Math.abs(touchEndY - touchStartY) < 10 && Math.abs(touchEndX - touchStartX) < 10) {
                    e.preventDefault();
                    row._expandableClickHandler();
                }
            }
        };

        row.addEventListener('click', row._expandableClickHandler);
        row.addEventListener('touchstart', row._expandableTouchStartHandler);
        row.addEventListener('touchend', row._expandableTouchEndHandler);
    });
}

// Example usage for legends
// loadDetailsJson('legend', './data/legends.json').then(() => {
//     bindExpandableRowEvents({
//         selector: '.legend-clickable:not([data-homebrew])',
//         section: 'legend',
//         keyAttr: 'data-legend',
//         renderFn: renderLegendDetailsContent,
//         detailsRowClass: 'legend-details-row'
//     });
// });

// Example usage for homebrew
// loadDetailsJson('homebrew', './data/homebrew.json').then(() => {
//     bindExpandableRowEvents({
//         selector: '.legend-clickable[data-homebrew]',
//         section: 'homebrew',
//         keyAttr: 'data-homebrew',
//         renderFn: renderHomebrewDetailsContent,
//         detailsRowClass: 'homebrew-details-row legend-details-row'
//     });
// }
