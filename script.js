// constants
const spaceTemp = document.createElement("span");
spaceTemp.innerHTML = " ";
spaceTemp.classList.add("space");
const step = 2;
const stepFall = 0.5;
const delay = 50;
const em = parseFloat(getComputedStyle(document.body).fontSize);
const youWidth = em * 0.5 * 0.8;

// elements
const you = document.getElementById("you");
const text = document.getElementById("text");

// initial position
you.style.left = window.innerWidth * 0.5 + "px";
you.style.top = 9 * em + "px";

// break up text
let ps = [];
for (let para of text.getElementsByTagName("p")) {
  let p = document.createElement("p");
  for (let word of para.innerText.split(" ")) {
    let span = document.createElement("span");
    span.innerText = word;
    span.classList.add("word");
    p.appendChild(span);
    p.appendChild(spaceTemp.cloneNode(true));
  }
  ps.push(p.outerHTML);
}
text.innerHTML = ps.join("");
let spans = text.getElementsByTagName("span");

// controls
const handleKeyDown = (e) => {

  if (e.key == "ArrowUp" || e.key == "ArrowDown") {
    e.preventDefault();
  }

  if (e.key == "ArrowLeft" || e.key == "ArrowRight") {

    e.preventDefault();

    // https://www.fwait.com/how-to-move-an-object-with-arrow-keys-in-javascript/
    let targetLeft = parseInt(you.style.left);
    let targetTop = parseInt(you.style.top);
    
    if (e.key == "ArrowLeft") {
      if (targetLeft < text.offsetLeft) return false;
      targetLeft -= step;
    } else if (e.key == "ArrowRight") {
      if (targetLeft + youWidth > text.offsetLeft + text.offsetWidth) return false;
      targetLeft += step;
    }

    let targetSpan = getTargetSpan(targetLeft, targetTop, e.key);
    if (!targetSpan) {
      moveTo(targetLeft, targetTop);
    } else if (targetSpan.classList.contains("space")) {
      moveTo(targetLeft, targetTop);
      targetSpan.parentNode.insertBefore(spaceTemp.cloneNode(true), targetSpan);
    }

  }
};
document.addEventListener("keydown", handleKeyDown);

function getTargetSpan(targetLeft, targetTop, key) {
  // don't run into words
  for (let span of spans) {
    let spanLeft = span.offsetLeft;
    let spanTop = span.offsetTop;
    let spanWidth = span.offsetWidth;
    if (spanTop <= targetTop && spanTop + step >= targetTop) {
      switch (key) {
        case "ArrowLeft":
          if (spanLeft <= targetLeft && spanLeft + spanWidth >= targetLeft &&
              spanTop <= targetTop && spanTop + step >= targetTop) {
            return span;
          }
          break;
        case "ArrowRight":
          if (spanLeft <= targetLeft + youWidth &&
              spanLeft + spanWidth >= targetLeft + youWidth) {
            return span;
          }
          break;
        case "ArrowDown":
          if (spanLeft - 3 <= targetLeft &&
              spanLeft + spanWidth + 3 >= targetLeft + youWidth) {
            return span;
          }
          break;
      }
    }
  }
  return null;
}

function moveTo(targetLeft, targetTop) {
  you.style.left = targetLeft + "px";
  you.style.top = targetTop + "px";
}

const fall = () => {

  let targetLeft = you.offsetLeft;
  let targetTop = you.offsetTop + stepFall;

  if (targetTop >= text.offsetTop + text.offsetHeight) {
    clearInterval(interval);
    document.removeEventListener("keydown", handleKeyDown);
    window.scrollTo({
      top: document.body.scrollHeight,
      left: 0,
      behavior: "smooth"
    })
    return;
  }

  let targetSpan = getTargetSpan(targetLeft, targetTop, "ArrowDown");
  if (!targetSpan) {
    moveTo(targetLeft, targetTop);
  } else if (targetSpan.classList.contains("space")) {
    moveTo(targetLeft, targetTop);
    targetSpan.parentNode.insertBefore(spaceTemp.cloneNode(true), targetSpan);
    window.scrollBy(0, 2);
  }

};
const interval = setInterval(fall, delay);