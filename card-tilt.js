(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !fine) return;

  function bind(el, max, rxName, ryName) {
    el.addEventListener("pointermove", function (event) {
      var rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (event.clientX - rect.left) / rect.width;
      var py = (event.clientY - rect.top) / rect.height;
      el.style.setProperty(ryName, ((px - 0.5) * max * 2).toFixed(2) + "deg");
      el.style.setProperty(rxName, ((0.5 - py) * max * 2).toFixed(2) + "deg");
      el.classList.add("is-tilting");
    });

    el.addEventListener("pointerleave", function () {
      el.classList.remove("is-tilting");
      el.style.removeProperty(rxName);
      el.style.removeProperty(ryName);
    });
  }

  document.querySelectorAll(".tilt-card").forEach(function (card) {
    bind(card, 8, "--rx", "--ry");
  });

  document.querySelectorAll(".timeline-card, .stat-item, .transmission-console, .establish-contact").forEach(function (panel) {
    panel.classList.add("depth-panel");
    bind(panel, 5, "--px", "--py");
  });

  var header = document.getElementById("body-header");
  var stage = header && header.querySelector(".header-content");
  if (!header || !stage) return;

  header.addEventListener("pointermove", function (event) {
    var rect = header.getBoundingClientRect();
    var px = (event.clientX - rect.left) / rect.width - 0.5;
    var py = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty("--hx", (5 + py * -8).toFixed(2) + "deg");
    stage.style.setProperty("--hy", (px * 10).toFixed(2) + "deg");
  });

  header.addEventListener("pointerleave", function () {
    stage.style.removeProperty("--hx");
    stage.style.removeProperty("--hy");
  });
})();
