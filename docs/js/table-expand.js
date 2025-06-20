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
    // Helper to render any value (object, array, primitive)
    function renderValue(val) {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                return val.map(renderValue).join('<br>');
            } else {
                // Render object as key-value pairs (used for sections subtable)
                return Object.entries(val).map(
                    ([k, v]) => `
                        <div class="subtable-row">
                            <div class="subtable-label">${k}</div>
                            <div class="subtable-value">${renderValue(v)}</div>
                        </div>
                    `
                ).join('');
            }
        }
        return String(val);
    }

    // Render all top-level keys except 'description' and 'sections'
    const rows = Object.entries(data)
        .filter(([k]) => k !== 'description' && k !== 'sections')
        .map(([k, v]) => `
            <div class="legend-details-row-flex">
                <div class="legend-details-label">${k.charAt(0).toUpperCase() + k.slice(1)}</div>
                <div class="legend-details-value">${renderValue(v)}</div>
            </div>
        `).join('');

    // Render sections as a subtable if present
    let sectionsHtml = '';
    if (data.sections && typeof data.sections === 'object') {
        sectionsHtml = `
            <div class="legend-details-row-flex">
                <div class="legend-details-label">Sections</div>
                <div class="legend-details-value">
                    <div class="subtable">
                        ${Object.entries(data.sections).map(
                            ([k, v]) => `
                                <div class="subtable-row">
                                    <div class="subtable-label">${k}</div>
                                    <div class="subtable-value">${renderValue(v)}</div>
                                </div>
                            `
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    return `
    <div class="legend-details-flex">
      <div class="legend-details-row-flex">
        <div class="legend-details-label">Description</div>
        <div class="legend-details-value">${data.description || ''}</div>
      </div>
      ${rows}
      ${sectionsHtml}
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
            const expandedClass = 'expanded';
            // Collapse if already expanded
            if (next && next.classList.contains('dynamic') && next.classList.contains(detailsRowClass.split(' ')[0])) {
                next.remove();
                row.classList.remove(expandedClass);
                return;
            }
            // Remove all other details rows of this type and their expanded indicators
            document.querySelectorAll(`.${detailsRowClass.split(' ')[0]}.dynamic`).forEach(el => {
                if (el.previousElementSibling && el.previousElementSibling.classList.contains('expandable-clickable')) {
                    el.previousElementSibling.classList.remove(expandedClass);
                }
                el.remove();
            });
            const key = row.getAttribute(keyAttr);
            renderDetails(section, key, row, renderFn, detailsRowClass);
            row.classList.add(expandedClass);
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
//         selector: '.expandable-clickable:not([data-expandable])',
//         section: 'legend',
//         keyAttr: 'data-legend',
//         renderFn: renderLegendDetailsContent,
//         detailsRowClass: 'legend-details-row'
//     });
// });

// Example usage for homebrew
// loadDetailsJson('homebrew', './data/homebrew.json').then(() => {
//     bindExpandableRowEvents({
//         selector: '.expandable-clickable[data-expandable]',
//         section: 'homebrew',
//         keyAttr: 'data-expandable',
//         renderFn: renderHomebrewDetailsContent,
//         detailsRowClass: 'homebrew-details-row legend-details-row'
//     });
// }
