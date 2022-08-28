// elements
const asterisk = document.getElementById("asterisk");
const text = document.getElementById("text");
const resetButton = document.querySelector(".reset-button");
const spaceTemp = document.createElement("span");
spaceTemp.innerHTML = " ";
spaceTemp.classList.add("space");
let spans;

// constants
const STEP = 2; // amount moved by controls
const SPEED = 0.5; // amount moved by falling
const DELAY = 50; // interval of falling
const EM = parseFloat(getComputedStyle(document.body).fontSize);
const ASTERISK_SIZE = parseFloat(getComputedStyle(asterisk).fontSize)
const ASTERISK_WIDTH = ASTERISK_SIZE * 0.5;
const SCROLL = 15; // amount that the window scrolls by
const RIVER_GROWTH = 0.1; // amount that the river grows by
const FADE = 0.01; // amount that the asterisk 

// river
let riverWidth = 1;

// touch
let startX = 0;
let dist = 0;

// get paragraph texts before chopping it up
let paraTexts = [];
for (let p of text.getElementsByTagName("p")) {
  paraTexts.push(p.innerText);
}

function init() {
  // initial position
  asterisk.style.left = window.innerWidth * 0.5 + "px";
  asterisk.style.top = 12 * EM + "px";
  asterisk.style.opacity = 1;

  // break up text
  let ps = [];
  for (let paraText of paraTexts) {
    let p = document.createElement("p");
    for (let word of paraText.split(" ")) {
      let span = document.createElement("span");
      span.innerText = word;
      span.classList.add("word");
      p.appendChild(span);
      p.appendChild(spaceTemp.cloneNode(true));
    }
    ps.push(p.outerHTML);
  }
  text.innerHTML = ps.join("");
  spans = text.getElementsByTagName("span");

  // remove event listeners
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("touchstart", handleTouchStart);
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);

  // add event listeners
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("touchstart", handleTouchStart, {passive: false});
  document.addEventListener("touchmove", handleTouchMove, {passive: false});
  document.addEventListener("touchend", handleTouchEnd, {passive: false});
}
init();

// controls
function handleKeyDown(e) {

  if (e.key == "ArrowLeft" || e.key == "ArrowRight") {

    e.preventDefault();

    // https://www.fwait.com/how-to-move-an-object-with-arrow-keys-in-javascript/
    let targetLeft = parseInt(asterisk.style.left);
    let targetTop = parseInt(asterisk.style.top);
    
    if (e.key == "ArrowLeft") {
      if (targetLeft < text.offsetLeft) return false;
      targetLeft -= STEP;
    } else if (e.key == "ArrowRight") {
      if (targetLeft + ASTERISK_WIDTH > text.offsetLeft + text.offsetWidth) return false;
      targetLeft += STEP;
    }

    let targetSpan = getTargetSpan(targetLeft, targetTop, e.key);
    // can't fall if there's a word in the way
    if (!targetSpan) {
      // free to move
      moveTo(targetLeft, targetTop);
    } else if (targetSpan.classList.contains("space")) {
      // free to move and also insert space
      moveTo(targetLeft, targetTop);
      targetSpan.parentNode.insertBefore(spaceTemp.cloneNode(true), targetSpan);
    }

  }
}

// http://www.javascriptkit.com/javatutors/touchevents.shtml
function handleTouchStart(e) {
  e.preventDefault();
  let touchObj = e.changedTouches[0];
  startX = parseInt(touchObj.clientX);
}

function handleTouchMove(e) {
  e.preventDefault();
  let touchObj = e.changedTouches[0];
  dist = parseInt(touchObj.clientX) - startX;
  startX = parseInt(touchObj.clientX);

  let targetLeft = parseInt(asterisk.style.left);
  let targetTop = parseInt(asterisk.style.top);

  let key;
  if (dist < 0) {
    key = "ArrowLeft";
  } else if (dist > 0) {
    key = "ArrowRight";
  } else {
    return false;
  }

  if (key == "ArrowLeft") {
    if (targetLeft < text.offsetLeft) return false;
    targetLeft -= STEP;
  } else if (key == "ArrowRight") {
    if (targetLeft + ASTERISK_WIDTH > text.offsetLeft + text.offsetWidth) return false;
    targetLeft += STEP;
  }

  let targetSpan = getTargetSpan(targetLeft, targetTop, key);
  // can't fall if there's a word in the way
  if (!targetSpan) {
    // free to move
    moveTo(targetLeft, targetTop);
  } else if (targetSpan.classList.contains("space")) {
    // free to move and also insert space
    moveTo(targetLeft, targetTop);
    targetSpan.parentNode.insertBefore(spaceTemp.cloneNode(true), targetSpan);
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
}

function getTargetSpan(targetLeft, targetTop, key) {
  // don't run into words
  for (let span of spans) {
    let spanLeft = span.offsetLeft;
    let spanTop = span.offsetTop;
    let spanWidth = span.offsetWidth;
    if (spanTop <= targetTop && spanTop + STEP >= targetTop) {
      switch (key) {
        case "ArrowLeft":
          if (spanLeft <= targetLeft && spanLeft + spanWidth >= targetLeft &&
              spanTop <= targetTop && spanTop + STEP >= targetTop) {
            return span;
          }
          break;
        case "ArrowRight":
          if (spanLeft <= targetLeft + ASTERISK_WIDTH &&
              spanLeft + spanWidth >= targetLeft + ASTERISK_WIDTH) {
            return span;
          }
          break;
        case "ArrowDown":
          if (spanLeft - 3 <= targetLeft &&
              spanLeft + spanWidth + 3 >= targetLeft + ASTERISK_WIDTH) {
            return span;
          }
          break;
      }
    }
  }
  return null;
}

function moveTo(targetLeft, targetTop) {
  asterisk.style.left = targetLeft + "px";
  asterisk.style.top = targetTop + "px";
  // asterisk.style.left = targetLeft + "em";
  // asterisk.style.top = targetTop + "em";
}

function fall() {

  let targetLeft = asterisk.offsetLeft;
  let targetTop = asterisk.offsetTop + SPEED;

  if (targetTop >= text.offsetTop + text.offsetHeight) {
    let opacity = parseFloat(getComputedStyle(asterisk).opacity);
    opacity -= FADE;
    asterisk.style.opacity = opacity;
    moveTo(targetLeft, targetTop)
    return;
  }

  let targetSpan = getTargetSpan(targetLeft, targetTop, "ArrowDown");
  if (!targetSpan) {
    moveTo(targetLeft, targetTop);
  } else if (targetSpan.classList.contains("space")) {
    moveTo(targetLeft, targetTop);
    for (let i = 0; i < Math.floor(riverWidth); i++) {
      targetSpan.parentNode.insertBefore(spaceTemp.cloneNode(true), targetSpan);
    }
    window.scrollBy(0, SCROLL);
    riverWidth += RIVER_GROWTH;
  }

}
const interval = setInterval(fall, DELAY);

// reset button
resetButton.addEventListener("click", () => {
  init();
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  })
})