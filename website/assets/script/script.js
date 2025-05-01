// --- Carousel 3D Section (leave as-is) ---
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

// --- Accordion Section (leave as-is) ---
const items = document.querySelectorAll('.accordion button');

function toggleAccordion() {
  const itemToggle = this.getAttribute('aria-expanded');

  for (let i = 0; i < items.length; i++) {
    items[i].setAttribute('aria-expanded', 'false');
  }

  if (itemToggle == 'false') {
    this.setAttribute('aria-expanded', 'true');
  }
}

items.forEach((item) => item.addEventListener('click', toggleAccordion));

// --- River Chart Section ---
let riverChart; 

const fetchDataButton = document.getElementById('fetchDataButton');
const riverSelect = document.getElementById('riverSelect');

if (fetchDataButton) {
  fetchDataButton.addEventListener('click', () => {
    const selectedSite = riverSelect.value;

    fetch(`https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${selectedSite}&period=P7D&siteStatus=active&parameterCd=00065,00010`)
      .then(response => response.json())
      .then(data => {
        const timeSeries = data.value.timeSeries;

        if (!timeSeries || timeSeries.length === 0) {
          console.error('No data available for this site.');
          return;
        }

        // Extract timestamps
        const labels = timeSeries[0].values[0].value.map(entry => {
          const date = new Date(entry.dateTime);
          return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
        });

        // Extract height (00065) and temperature (00010)
        const heightSeries = timeSeries.find(series => series.variable.variableCode[0].value === "00065");
        const tempSeries = timeSeries.find(series => series.variable.variableCode[0].value === "00010");

        const heightData = heightSeries?.values[0].value.map(entry => parseFloat(entry.value)) || [];
        const tempData = tempSeries?.values[0].value.map(entry => parseFloat(entry.value)) || [];

        console.log('Height Data:', heightData);
        console.log('Temperature Data:', tempData);

        // Destroy previous chart if exists
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
              },
              {
                label: 'Temperature (°C)',
                data: tempData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                yAxisID: 'y1',
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
              y1: {
                type: 'linear',
                position: 'right',
                title: {
                  display: true,
                  text: 'Temperature (°C)'
                },
                grid: {
                  drawOnChartArea: false, // Only draw grid for y axis
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
//Calendar Section//

// ===== CALENDAR WITH PRICE TRACKING =====
const calendarConfigs = [
  {
    id: 1,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDates: [],
    pricePerDay: 67
  },
  {
    id: 2,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDates: [],
    pricePerDay: 45
  }
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function updateHeader(config) {
  const span = document.getElementById(`month-year-${config.id}`);
  span.textContent = `${monthNames[config.currentMonth]} ${config.currentYear}`;
}

function updatePrice(config) {
  const total = config.selectedDates.length * config.pricePerDay;
  document.getElementById(`price-display-${config.id}`).textContent = `Total Price: $${total}`;
}

function generateCalendar(config) {
  const container = document.getElementById(`calendar-${config.id}`);
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

  