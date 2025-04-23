const carousel = document.getElementById("carousel3d");
const images = carousel.getElementsByTagName("img");
const angle = 360 / images.length;
let currAngle = 0;


Array.from(images).forEach((img, i) => {
  const rotateY = angle * i;
  img.style.transform = `rotateY(${rotateY}deg) translateZ(300px)`;
});

function rotateCarousel(direction) {
  currAngle += angle * direction;
  carousel.style.transform = `rotateY(${currAngle}deg)`;
}