/**
 * ABTalks Calendar Module
 * Enhanced calendar with date/month tooltip on hover/click
 */

const Calendar = {
    monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],

    showTooltip(cell, persistent = false) {
        const tooltip = document.getElementById('calendarTooltip');
        const dateStr = cell.dataset.date;
        const dayNum = cell.dataset.day;
        if (!dateStr) return;

        const date = new Date(dateStr);
        const formatted = `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

        let status = 'Upcoming';
        if (cell.classList.contains('completed')) status = 'Completed ✓';
        else if (cell.classList.contains('current')) status = 'Current Day →';
        else if (cell.classList.contains('missed')) status = 'Missed ✗';

        document.getElementById('tooltipDate').textContent = `Day ${dayNum} — ${formatted}`;
        document.getElementById('tooltipStatus').textContent = status;

        tooltip.classList.add('visible');

        if (persistent) {
            // For click, hide after 2 seconds
            if (this.clickTimeout) clearTimeout(this.clickTimeout);
            this.clickTimeout = setTimeout(() => this.hideTooltip(), 2000);
        }
    },

    hideTooltip() {
        const tooltip = document.getElementById('calendarTooltip');
        tooltip.classList.remove('visible');
    }
};
