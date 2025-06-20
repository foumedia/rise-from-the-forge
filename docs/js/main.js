

// NAVIGATION AND CAROUSEL SETUP
const sections = [
  { title: "INTRO", file: "./sections/intro.html" },
  { title: "PRIZES", file: "./sections/giveaways.html" },
  { title: "RULES", file: "./sections/rules.html" },
  { title: "LEGENDS", file: "./sections/legends.html" },
  { title: "CREWS", file: "./sections/crews.html" }, // <-- Added Crews section
  { title: "BOUNTIES", file: "./sections/bounties.html" },
  { title: "ASCENSION", file: "./sections/ascension.html" },
  { title: "HOMEBREW", file: "./sections/homebrew.html" }, // <-- Added Homebrew section
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

// END OF NAVIGATION AND CAROUSEL SETUP