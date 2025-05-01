// --- Carousel 3D Section ---
const carousel = document.getElementById("carousel3d");
if (carousel) {
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

  window.rotateCarousel = rotateCarousel;
}

// --- Accordion Section ---
const items = document.querySelectorAll('.accordion button');
function toggleAccordion() {
  const itemToggle = this.getAttribute('aria-expanded');

  for (let i = 0; i < items.length; i++) {
    items[i].setAttribute('aria-expanded', 'false');
  }

  if (itemToggle === 'false') {
    this.setAttribute('aria-expanded', 'true');
  }
}
items.forEach(item => item.addEventListener('click', toggleAccordion));

// --- River Chart (Height Only) ---
let riverChart;
const fetchDataButton = document.getElementById('fetchDataButton');
const riverSelect = document.getElementById('riverSelect');

if (fetchDataButton && riverSelect) {
  fetchDataButton.addEventListener('click', () => {
    const selectedSite = riverSelect.value;

    fetch(`https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${selectedSite}&period=P7D&siteStatus=active&parameterCd=00065`)
      .then(response => response.json())
      .then(data => {
        const timeSeries = data.value.timeSeries;
        if (!timeSeries || timeSeries.length === 0) {
          console.error('No data available for this site.');
          return;
        }

        const labels = timeSeries[0].values[0].value.map(entry => {
          const date = new Date(entry.dateTime);
          return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
        });

        const heightSeries = timeSeries.find(series => series.variable.variableCode[0].value === "00065");
        const heightData = heightSeries?.values[0].value.map(entry => parseFloat(entry.value)) || [];

        if (riverChart) {
          riverChart.destroy();
        }

        const ctx = document.getElementById('riverChart').getContext('2d');
        riverChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Height (ft)',
                data: heightData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                yAxisID: 'y',
              }
            ]
          },
          options: {
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            stacked: false,
            scales: {
              y: {
                type: 'linear',
                position: 'left',
                title: {
                  display: true,
                  text: 'Height (ft)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Date & Time'
                }
              }
            }
          }
        });
      })
      .catch(error => {
        console.error('Error fetching river data:', error);
      });
  });
}

// --- Calendar with Price Tracking ---
const calendarConfigs = [
  { id: 1, currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear(), selectedDates: [], pricePerDay: 67 },
  { id: 2, currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear(), selectedDates: [], pricePerDay: 45 }
];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

function updateHeader(config) {
  const span = document.getElementById(`month-year-${config.id}`);
  if (span) span.textContent = `${monthNames[config.currentMonth]} ${config.currentYear}`;
}

function updatePrice(config) {
  const total = config.selectedDates.length * config.pricePerDay;
  const display = document.getElementById(`price-display-${config.id}`);
  if (display) display.textContent = `Total Price: $${total}`;
}

function generateCalendar(config) {
  const container = document.getElementById(`calendar-${config.id}`);
  if (!container) return;
  container.innerHTML = '';

  const firstDay = new Date(config.currentYear, config.currentMonth, 1).getDay();
  const daysInMonth = new Date(config.currentYear, config.currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    container.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.textContent = day;
    const dateStr = `${config.currentYear}-${config.currentMonth + 1}-${day}`;

    if (config.selectedDates.includes(dateStr)) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => {
      if (config.selectedDates.includes(dateStr)) {
        config.selectedDates = config.selectedDates.filter(d => d !== dateStr);
        cell.classList.remove('selected');
      } else {
        config.selectedDates.push(dateStr);
        cell.classList.add('selected');
      }
      updatePrice(config);
    });

    container.appendChild(cell);
  }
}

function renderAllCalendars() {
  calendarConfigs.forEach(config => {
    updateHeader(config);
    generateCalendar(config);
  });
}

document.querySelectorAll('.nav-arrow').forEach(button => {
  button.addEventListener('click', (e) => {
    const id = +button.dataset.id;
    const config = calendarConfigs.find(c => c.id === id);
    if (!config) return;

    if (button.classList.contains('prev')) {
      config.currentMonth--;
      if (config.currentMonth < 0) {
        config.currentMonth = 11;
        config.currentYear--;
      }
    } else {
      config.currentMonth++;
      if (config.currentMonth > 11) {
        config.currentMonth = 0;
        config.currentYear++;
      }
    }
    updateHeader(config);
    generateCalendar(config);
  });
});

renderAllCalendars();

// --- Leaflet Interactive Map ---
const mapElement = document.getElementById('map');

if (mapElement) {
  const map = L.map('map').setView([35.995, -93.176], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const locations = [
    { name: "Ponca", coords: [36.046, -93.319] },
    { name: "Boxley", coords: [35.985, -93.298] },
    { name: "Carver", coords: [35.986, -93.104] },
    { name: "Pruitt", coords: [36.030, -93.184] }
  ];

  let markers = [];

  function handleMarkerClick(clickedMarker) {
    markers.forEach(marker => {
      marker.setOpacity(marker === clickedMarker ? 1 : 0.3);
    });
  }

  locations.forEach(location => {
    const marker = L.marker(location.coords)
      .addTo(map)
      .bindPopup(`${location.name} - Buffalo River Access`)
      .on('click', function () {
        handleMarkerClick(this);
      });

    markers.push(marker);
  });
}
