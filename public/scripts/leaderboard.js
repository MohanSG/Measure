console.log("JS loaded");

const fills = document.querySelectorAll(".bar-fill");

fills.forEach((fill, i) => {
  setTimeout(() => {
    fill.style.transform = "scaleY(1)";
  }, i * 150);
});