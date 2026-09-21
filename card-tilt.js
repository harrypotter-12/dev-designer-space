(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !fine) return;

  var max = 8;

  document.querySelectorAll(".tilt-card").forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      var rect = card.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width;
      var py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
      card.classList.add("is-tilting");
    });

    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
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
