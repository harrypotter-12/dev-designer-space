/* Pages come from images/book/pages.json.
   Drop a picture in images/book/ and add its file name to that list,
   for example ["sketch.png"]. An empty list keeps the blank pages. */
(function () {
  var BLANK = "The drawings go here.";
  var book = document.getElementById("book");
  var leftPage = document.getElementById("left-page");
  var under = document.getElementById("book-under");
  var leaf = document.getElementById("book-leaf");
  var front = leaf ? leaf.querySelector(".front") : null;
  var back = leaf ? leaf.querySelector(".back") : null;
  var prev = document.getElementById("book-prev");
  var next = document.getElementById("book-next");
  var count = document.getElementById("book-count");
  if (!book || !under || !leaf || !front || !back || !prev || !next) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sheets = [];
  var index = 0;
  var busy = false;
  var swipe = false;
  var startX = null;

  function safeName(name) {
    if (typeof name !== "string") return null;
    var trimmed = name.trim();
    if (!trimmed || trimmed.indexOf("..") !== -1 || /[\\/]/.test(trimmed)) return null;
    if (!/^[A-Za-z0-9][A-Za-z0-9 ._-]*\.(png|jpe?g|gif|webp|svg)$/i.test(trimmed)) return null;
    return trimmed;
  }

  function blankSheets() {
    return [
      { title: "Drawing book", text: BLANK, cover: true },
      { text: BLANK },
      { text: BLANK },
      { text: BLANK },
      { text: BLANK },
      { text: BLANK }
    ];
  }

  function fill(node, sheet) {
    node.classList.toggle("is-cover", !!(sheet && sheet.cover));
    node.replaceChildren();
    if (!sheet) return;
    if (sheet.image) {
      var img = document.createElement("img");
      img.alt = "Drawing";
      img.src = sheet.image;
      img.addEventListener("error", function () {
        var note = document.createElement("p");
        note.className = "page-copy";
        note.textContent = BLANK;
        img.replaceWith(note);
      });
      node.appendChild(img);
      return;
    }
    var stack = document.createElement("div");
    stack.className = "page-stack";
    if (sheet.title) {
      var title = document.createElement("h2");
      title.className = "page-title";
      title.textContent = sheet.title;
      stack.appendChild(title);
    }
    var copy = document.createElement("p");
    copy.className = "page-copy";
    copy.textContent = sheet.text || BLANK;
    stack.appendChild(copy);
    node.appendChild(stack);
  }

  function render() {
    var closed = index === 0;
    book.classList.toggle("is-closed", closed);
    fill(under, sheets[index]);
    fill(front, sheets[index]);
    fill(back, sheets[Math.min(sheets.length - 1, index + 1)]);
    if (leftPage) {
      if (closed) leftPage.replaceChildren();
      else fill(leftPage, sheets[index - 1]);
    }
    prev.disabled = index === 0;
    next.disabled = index >= sheets.length - 1;
    if (count) {
      count.textContent = closed
        ? "Cover"
        : "Page " + index + " of " + (sheets.length - 1);
    }
    leaf.style.transition = "none";
    leaf.style.transform = "rotateY(0deg)";
  }

  function finish(nextIndex) {
    index = nextIndex;
    busy = false;
    render();
  }

  function turn(dir) {
    if (busy) return;
    var nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= sheets.length) return;
    if (reduce) {
      finish(nextIndex);
      return;
    }
    busy = true;
    if (dir > 0 && index === 0) book.classList.remove("is-closed");
    var from = dir > 0 ? sheets[index] : sheets[nextIndex];
    var onto = dir > 0 ? sheets[nextIndex] : sheets[index];
    fill(front, from);
    fill(back, onto);
    fill(under, sheets[nextIndex]);
    if (leftPage && dir > 0 && index > 0) fill(leftPage, sheets[index - 1]);
    leaf.style.transition = "none";
    leaf.style.transform = dir > 0 ? "rotateY(0deg)" : "rotateY(-180deg)";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        leaf.style.transition = "transform 0.7s ease";
        leaf.style.transform = dir > 0 ? "rotateY(-180deg)" : "rotateY(0deg)";
      });
    });
    function done(event) {
      if (event.propertyName !== "transform") return;
      leaf.removeEventListener("transitionend", done);
      finish(nextIndex);
    }
    leaf.addEventListener("transitionend", done);
  }

  prev.addEventListener("click", function () { turn(-1); });
  next.addEventListener("click", function () { turn(1); });

  book.addEventListener("pointerdown", function (event) {
    startX = event.clientX;
    swipe = false;
  });
  book.addEventListener("pointerup", function (event) {
    if (startX == null) return;
    var dx = event.clientX - startX;
    startX = null;
    if (dx <= -36) {
      swipe = true;
      turn(1);
    } else if (dx >= 36) {
      swipe = true;
      turn(-1);
    }
  });
  book.addEventListener("click", function (event) {
    if (swipe) {
      swipe = false;
      return;
    }
    var rect = book.getBoundingClientRect();
    var x = event.clientX - rect.left;
    if (x > rect.width * 0.62) turn(1);
    else if (x < rect.width * 0.38) turn(-1);
  });

  document.addEventListener("keydown", function (event) {
    var tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "ArrowRight") turn(1);
    if (event.key === "ArrowLeft") turn(-1);
  });

  function setup(list) {
    var source = Array.isArray(list) ? list : (list && list.pages) || [];
    var names = source.map(safeName).filter(Boolean);
    if (!names.length) {
      sheets = blankSheets();
    } else {
      sheets = [{ title: "Drawing book", text: BLANK, cover: true }].concat(names.map(function (name) {
        return { image: "images/book/" + encodeURIComponent(name) };
      }));
    }
    index = 0;
    render();
  }

  fetch("images/book/pages.json", { cache: "no-store" })
    .then(function (response) { return response.ok ? response.json() : []; })
    .then(setup)
    .catch(function () { setup([]); });
})();
