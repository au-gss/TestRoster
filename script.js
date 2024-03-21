// Declare roster variable
let roster;

// Function to parse CSV data and filter by month
function parseCSV(csv) {
    const lines = csv.split('\n').slice(1); // Exclude header line
    const roster = {};
    lines.forEach(line => {
        const [day, engineer] = line.split(',');
        const month = day.substring(5, 7); // Extract month from date
        if (!roster[month]) {
            roster[month] = [];
        }
        roster[month].push({ day, engineer });
    });
    return roster;
}

// Function to update calendar based on selected month
function updateCalendar(month) {
    const selectedMonth = month.toString().padStart(2, '0');
    const selectedData = roster[selectedMonth];
    const daysInMonth = new Date(2024, month, 0).getDate();
    const firstDayOfMonth = new Date(2024, month - 1, 1).getDay(); // 0-indexed
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = ''; // Clear previous calendar data

    // Render weekdays
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const calendarEntry = document.createElement('div');
        calendarEntry.textContent = day;
        calendarEntry.classList.add('calendar-day');
        calendarDiv.appendChild(calendarEntry);
    });

    // Render days of the month
    let dayCount = 1;
    for (let i = 0; i < 42; i++) { // 6 rows, 7 days each
        const calendarEntry = document.createElement('div');
        if (i < firstDayOfMonth || dayCount > daysInMonth) {
            // Empty cells before the first day and after the last day
            calendarEntry.textContent = '';
        } else {
            calendarEntry.textContent = dayCount;
            const dayData = selectedData.find(entry => entry.day.endsWith(`-${dayCount.toString().padStart(2, '0')}`));
            if (dayData) {
                const engineerName = document.createElement('div');
                engineerName.classList.add('engineer-name');
                engineerName.textContent = dayData.engineer;
                calendarEntry.appendChild(engineerName);
            }
            dayCount++;
        }
        calendarEntry.classList.add('calendar-day');
        calendarDiv.appendChild(calendarEntry);
    }
}

// Load CSV file asynchronously
fetch('roster.csv')
    .then(response => response.text())
    .then(csvData => {
        roster = parseCSV(csvData);

        // Initial calendar update
        updateCalendar(1); // Default to January

        // Event listener for month selection change
        document.getElementById('month-select').addEventListener('change', function() {
            const selectedMonth = parseInt(this.value);
            updateCalendar(selectedMonth);
        });
    })
    .catch(error => {
        console.error('Error fetching CSV file:', error);
    });
