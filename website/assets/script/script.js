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

document.addEventListener('DOMContentLoaded', () => {
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedDates = new Set();

  const monthYearElement = document.getElementById('month-year');
  const calendarElement = document.getElementById('calendar');
  const priceDisplay = document.getElementById('price-display');

  function updateCalendarHeader() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  function handleDateClick(event) {
    const dayCell = event.target;
    const day = dayCell.dataset.day;
    const key = `${currentYear}-${currentMonth}-${day}`;

    if (dayCell.classList.contains('past')) return;

    if (dayCell.classList.contains('selected')) {
      dayCell.classList.remove('selected');
      selectedDates.delete(key);
    } else {
      dayCell.classList.add('selected');
      selectedDates.add(key);
    }

    updatePrice();
  }

  function updatePrice() {
    const totalPrice = selectedDates.size * 67;
    priceDisplay.textContent = `Total Price: $${totalPrice}`;
  }

  function generateCalendar() {
    calendarElement.innerHTML = '';

    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
      const header = document.createElement('div');
      header.classList.add('header');
      header.textContent = day;
      calendarElement.appendChild(header);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      calendarElement.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.textContent = day;
      dayCell.dataset.day = day;

      const cellDate = new Date(currentYear, currentMonth, day);
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (cellDate < todayDate) {
        dayCell.classList.add('past');
        dayCell.textContent = `${day} ❌`;
      }

      const key = `${currentYear}-${currentMonth}-${day}`;
      if (selectedDates.has(key)) {
        dayCell.classList.add('selected');
      }

      dayCell.addEventListener('click', handleDateClick);
      calendarElement.appendChild(dayCell);
    }

    updateCalendarHeader();
  }

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar();
  });

  generateCalendar();
});