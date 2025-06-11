const sections = [
  { title: "INTRO", file: "./sections/intro.html" },
  { title: "PRIZES", file: "./sections/giveaways.html" },
  { title: "RULES", file: "./sections/rules.html" },
  { title: "LEGENDS", file: "./sections/legends.html" },
  { title: "CREWS", file: "./sections/crews.html" }, // <-- Added Crews section
  { title: "BOUNTIES", file: "./sections/bounties.html" },
  { title: "ASCENSION", file: "./sections/ascension.html" },
];

const nav = document.getElementById("nav");
const carousel = document.getElementById("carousel");

sections.forEach((section, i) => {
  const btn = document.createElement("button");
  btn.textContent = section.title;
  btn.onclick = () => setActive(i);
  nav.appendChild(btn);

  const div = document.createElement("div");
  div.className = "carousel-section-left carousel-section";
  div.dataset.file = section.file;
  carousel.appendChild(div);
});

function setActive(index) {
  const navButtons = document.querySelectorAll("nav button");
  navButtons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index); // Toggle active class
  });

  const carouselSections = document.querySelectorAll(".carousel-section");
  carouselSections.forEach((el, i) => {
    el.classList.toggle("active", i === index);
    if (i === index && !el.innerHTML.trim()) {
      loadSectionContent(el.dataset.file, el);
    }
  });

  // Add flicker effect
  const activeSection = carouselSections[index];
  activeSection.classList.add("flicker-effect");
  setTimeout(() => {
    activeSection.classList.remove("flicker-effect");
  }, 500);

  window.location.hash = sections[index].title;
}

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
    .finally((html) => {
      if (file.includes('legends.html')) {
        loadLegendDetailsJson().then(() => {
          bindLegendRowEvents(element);
        });
      }
    })
    .catch((error) => {
      console.error(`Error loading ${file}: ${error.message}`);
      element.innerHTML = `<p>Error loading content. Please try again later.</p>`;
    });
}

let legendDetailsData = {};

function loadLegendDetailsJson() {
  return fetch('./data/legends.json')
    .then(res => res.json())
    .then(json => { legendDetailsData = json; });
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

function bindLegendRowEvents(scope) {
  (scope || document).querySelectorAll('.legend-clickable').forEach(function(row) {
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

function handleHashChange() {
  const hash = window.location.hash.substring(1);
  const index = sections.findIndex((section) => section.title === hash);
  if (index !== -1) {
    setActive(index);
  } else {
    setActive(0);
  }
}

window.addEventListener("hashchange", handleHashChange);
handleHashChange();