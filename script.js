document.addEventListener('DOMContentLoaded', () => {
    // Dynamically populate the month dropdown
    const monthSelector = document.getElementById('monthSelector');
    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = new Date(2022, i, 1).toLocaleString('en-US', { month: 'long' });
        monthSelector.add(option);
    }

    // Add event listener for month selection
    monthSelector.addEventListener('change', updateCalendar);
});

async function generateCalendar(referenceMonth = 0) {
    const today = new Date();
    const selectedMonth = referenceMonth;
    const firstDay = new Date(today.getFullYear(), selectedMonth, 1);
    const lastDay = new Date(today.getFullYear(), selectedMonth + 1, 0);

    const calendar = document.getElementById('calendar');
    const calendarBody = document.getElementById('calendar-body');

    // Clear existing calendar
    calendar.querySelector('th').textContent = '';
    calendarBody.innerHTML = '';

    let html = '';
    let day = 1;

    for (let i = 0; i < 6; i++) {
        html += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay.getDay()) {
                html += `<td></td>`;
            } else if (day > lastDay.getDate()) {
                html += `<td></td>`;
            } else {
                const currentDate = new Date(today.getFullYear(), selectedMonth, day);
                const weekNumber = getISOWeekNumber(currentDate);
                const engineerName = await getEngineerForWeek(weekNumber);
                html += `<td>${day}<br>${engineerName}</td>`;
                day++;
            }
        }
        html += '</tr>';
    }

    calendar.querySelector('th').textContent = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    calendarBody.innerHTML = html;
}

document.addEventListener('mouseover', (event) => {
    const hoveredElement = event.target;

    if (hoveredElement.tagName === 'TD' && hoveredElement.textContent.trim() !== '') {
        const engineerName = hoveredElement.textContent.trim();
        highlightEngineerInstances(engineerName);
    }
});

function highlightEngineerInstances(engineerName) {
    const allEngineerCells = document.querySelectorAll('td');

    allEngineerCells.forEach((cell) => {
        const cellEngineerName = cell.textContent.trim();
        if (cellEngineerName === engineerName) {
            // Add highlighted class to individual cell
            cell.classList.add('highlighted');
        } else {
            // Remove highlighted class from individual cell
            cell.classList.remove('highlighted');
        }
    });
}

function updateCalendar() {
    const monthSelector = document.getElementById('monthSelector');
    const referenceMonth = parseInt(monthSelector.value);
    generateCalendar(referenceMonth);
}

function getISOWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7); // Revert to the original adjustment
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function getEngineerForWeek(weekNumber) {
    const csvData = await fetch('roster.csv')
        .then(response => response.text());

    const parsedData = Papa.parse(csvData, { header: true }).data;
    const engineer = parsedData.find(entry => parseInt(entry.Week) === weekNumber);

    return engineer ? engineer.Engineer : '';
}
