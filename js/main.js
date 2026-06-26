const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
const yearNode = document.querySelector("#year");

if ("serviceWorker" in navigator && !location.hostname.includes("localhost") && !location.hostname.includes("127.0.0.1")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.getAttribute("data-open") === "true";
    const nextState = String(!isOpen);

    nav.setAttribute("data-open", nextState);
    menuToggle.setAttribute("aria-expanded", nextState);
    menuToggle.textContent = isOpen ? "Menu" : "Cerrar";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.setAttribute("data-open", "false");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "Menu";
    });
  });
}
