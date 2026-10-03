
////////////// export Expenses To CSV  ////////////////////

function exportExpensesToCSV() {
    const selectedCategory = document.getElementById("categoryFilter")?.value.trim();

    const listToExport = (selectedCategory && selectedCategory !== "all")
        ? filterExpenses
        : currentExpenses;

    if (!listToExport || listToExport.length === 0) {
        showAlert("No expenses available to export.", "danger");
        return;
    }

    const headers = ["Title", "Amount", "Category", "Date"];

    const rows = listToExport.map(exp => {
        const title = `"${exp.title.replace(/"/g, '""')}"`;
        const amount = Number(exp.amount).toFixed(2);
        const category = `"${exp.category}"`;
        const date = `"${exp.date}"`;

        return [title, amount, category, date].join(",");
    });


    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0, 10)}.csv`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

document.getElementById("exportCsvBtn")?.addEventListener("click", exportExpensesToCSV);


////////////// Delete all Expenses  ////////////////////

async function deleteAll() {
    const selectedCategory = document.getElementById("categoryFilter").value.trim();

    showSpinner(true);
    hideAlert();

    try {
        if (selectedCategory != "all") {
            await deleteExpenseByCategory(selectedCategory);
        }
        else { await deleteAllExpense(); }
        await refresh();
        showAlert("Expenses deleted successfully!", "success");
    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }
}
document.getElementById("deleteAll")?.addEventListener("click", deleteAll);



////////////// theme  ////////////////////

function setTheme(theme) {

    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('preferredTheme', theme);

    const navbar = document.getElementById('mainNavbar');
    const toggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    if (theme === 'dark') {
        if (navbar) {
            navbar.classList.remove('bg-dark', 'text-white');
            navbar.classList.add('bg-light', 'text-dark');
            navbar.setAttribute('data-bs-theme', 'light');
        }
        if (toggleBtn) {
            toggleBtn.classList.remove('btn-outline-light');
            toggleBtn.classList.add('btn-outline-dark');
        }
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light Mode';

    } else {
        if (navbar) {
            navbar.classList.remove('bg-light', 'text-dark');
            navbar.classList.add('bg-dark', 'text-white');
            navbar.setAttribute('data-bs-theme', 'dark');
        }
        if (toggleBtn) {
            toggleBtn.classList.remove('btn-outline-dark');
            toggleBtn.classList.add('btn-outline-light');
        }
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark Mode';
    }
}


function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('preferredTheme') || 'light';
    setTheme(savedTheme);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
});



////////////// chart  ////////////////////
let myChart = null;

function getCategoryColor(category) {
    switch (category?.toLowerCase()) {
        case 'food':
            return '#198754';
        case 'transport':
            return '#0d6efd';
        case 'bills':
            return '#ffc107';
        case 'entertainment':
            return '#0dcaf0';
        default:
            return '#6c757d';
    }
}

function renderChart(expenses) {
    const chartCard = document.getElementById('chartCard');
    const ctx = document.getElementById('expensesChart')?.getContext('2d');

    if (!expenses || expenses.length === 0) {
        if (chartCard) chartCard.classList.add('d-none');
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
        return;
    }

    if (chartCard) chartCard.classList.remove('d-none');

    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        const amount = Number(exp.amount) || 0;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const dynamicColors = labels.map(label => getCategoryColor(label));

    if (myChart) {
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = data;
        myChart.data.datasets[0].backgroundColor = dynamicColors; 
        myChart.update();
    } else if (ctx) {
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: dynamicColors, 
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.raw || 0;
                                return ` ${context.label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}