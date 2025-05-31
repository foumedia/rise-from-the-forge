const sections = [
  { title: "INTRO", file: "./sections/intro.html" },
  { title: "LEGENDS", file: "./sections/legends.html" },
  { title: "RULES", file: "./sections/rules.html" },
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
    .catch((error) => {
      console.error(`Error loading ${file}: ${error.message}`);
      element.innerHTML = `<p>Error loading content. Please try again later.</p>`;
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
