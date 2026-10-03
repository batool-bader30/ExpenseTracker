////////////////  showSpinner  ////////////////////
function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) {
        if (show) {
            spinner.classList.remove("d-none");
        } else {
            spinner.classList.add("d-none");
        }
    }
}

////////////////// alert manage //////////////

function showAlert(message, type = "danger") {
    const alertBox = document.getElementById("errorAlert");
    const alertMessage = document.getElementById("alertMessage");

    if (alertBox && alertMessage) {
        if (!message || message.includes("Failed to fetch") || message.includes("NetworkError")) {
            alertMessage.textContent = "Unable to connect to the server. Please check if the server is running.";
        } else {
            alertMessage.textContent = message;
        }

        alertBox.classList.remove("alert-danger", "alert-success");

        alertBox.classList.add(`alert-${type}`);
        alertBox.classList.remove("d-none");
    }
}

////////////////// hide alert ///////////////

function hideAlert() {
    const alertBox = document.getElementById("errorAlert");
    if (alertBox) {
        alertBox.classList.add("d-none");
    }
}


////////////////// refresh  ///////////////////

let currentExpenses = [];
async function refresh() {
    document.getElementById("categoryFilter").value = "all";
    showSpinner(true);
    hideAlert();

    try {

        currentExpenses = await getExpenses();

        renderTable(currentExpenses);


        renderSummary(currentExpenses);
        renderChart(currentExpenses);

    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }
}

////////////////// filter  ///////////////////

let filterExpenses = [];
async function filter() {
    const selectedCategory = document.getElementById("categoryFilter").value.trim();

    showSpinner(true);
    hideAlert();

    try {
        if (selectedCategory != "all") {
            filterExpenses = await getExpensesByCategory(selectedCategory);
            renderTable(filterExpenses);
        }
        else {
            filterExpenses = [];
            renderTable(currentExpenses);
        }

    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }
}

document.getElementById("categoryFilter")?.addEventListener("change", filter);


////////////////// render table  ///////////////////

function renderTable(list) {
    const tbody = document.getElementById("expensesTableBody")
    tbody.innerHTML = '';

    list.forEach(element => {
        const formattedAmount = Number(element.amount).toFixed(2);

        const tr = document.createElement("tr")
        tr.innerHTML = `
        <td>${element.title}</td>
        <td><div class="text-end">${formattedAmount}</div></td>
        <td><div class="badge ${getCategoryBadgeClass(element.category)} text-white text-wrap">
        ${element.category}
          </div></td>
        <td>${element.date}</td>
        <td><div class="m-1 d-flex gap-1 justify-content-end">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" onclick= "updateModal('${element.id}')" data-bs-target="#update">Edit</button>
        <button type="button" class="btn btn-sm btn-outline-danger id="delete" onclick="handleDelete('${element.id}')">Delete</button></div></td>

        `
        tbody.appendChild(tr);
    });

}

function getCategoryBadgeClass(category) {
    switch (category?.toLowerCase()) {
        case 'food':
            return 'text-bg-success';
        case 'transport':
            return 'text-bg-primary';
        case 'bills':
            return 'text-bg-warning';
        case 'entertainment':
            return 'text-bg-info';
        default:
            return 'text-bg-secondary';
    }
}
////////////////// render summary  ///////////////////

function renderSummary(list) {
    const totalAmount = document.getElementById("totalAmount")
    const numberOfExpenses = document.getElementById("numberOfExpenses")
    const highestExpenseAmount = document.getElementById("highestExpenseAmount")
    const highestExpenseTitle = document.getElementById("highestExpenseTitle")

    if (!list || list.length === 0) {
        totalAmount.textContent = "0.00";
        numberOfExpenses.textContent = "0";
        highestExpenseAmount.textContent = "0.00";
        highestExpenseTitle.textContent = "-";
        return;
    }

    const total = list.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    totalAmount.textContent = total.toFixed(2);

    numberOfExpenses.textContent = list.length;

    const highestItem = list.reduce((max, item) => {
        return Number(item.amount) > Number(max.amount) ? item : max;
    }, list[0]);

    highestExpenseAmount.textContent = Number(highestItem.amount).toFixed(2);
    highestExpenseTitle.textContent = highestItem.title;


}


////////////////// delete expenses  ///////////////////

async function handleDelete(expenseId) {
    showSpinner(true);
    hideAlert();
    try {
        const result = await deleteExpense(expenseId);
        refresh();
    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }

}
////////////////// add expense  ///////////////////


async function handleAddExpense(event) {
    if (event) event.preventDefault();

    const titleInput = document.getElementById("title");
    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");
    const dateInput = document.getElementById("date");

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim();
    const date = dateInput.value.trim();


    let isValid = true;

    if (!title) {
        titleInput.classList.add("is-invalid");
        isValid = false;
    }

    if (isNaN(amount) || amount <= 0) {
        amountInput.classList.add("is-invalid");
        isValid = false;
    }

    if (!category) {
        categoryInput.classList.add("is-invalid");
        isValid = false;
    }

    if (!date) {
        dateInput.classList.add("is-invalid");
        isValid = false;
    }

    if (!isValid) return;

    const newExpense = { title, amount, category, date };
    showSpinner(true);
    hideAlert();
    try {
        const result = await addExpenses(newExpense);

        document.getElementById("expenseForm").reset();
        resetValidation();

        refresh();
        showAlert("Expense added successfully!", "success");
    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }
}
function resetValidation() {
    const inputs = document.querySelectorAll("#expenseForm .form-control, #expenseForm .form-select");
    inputs.forEach(input => input.classList.remove("is-invalid"));
}

const expenseForm = document.getElementById("expenseForm");
if (expenseForm) {
    expenseForm.addEventListener("submit", handleAddExpense);
}

////////////////// update expense  ///////////////////
////////////////// update modal  ///////////////////

async function updateModal(id) {
    const item = await getExpensesById(id)
    if (!item) return;

    const mbody = document.getElementById("modal-body");

    mbody.innerHTML = `
      <form id="updateExpenseForm" novalidate>
        <input type="hidden" id="updateId" value="${item.id}">
        <div class="row">
          <!-- Title -->
          <div class="mb-3 col-12">
            <label for="updateTitle" class="form-label">Title</label>
            <input type="text" class="form-control" id="updateTitle" value="${item.title}" required>
            <div class="invalid-feedback">Title is required.</div>
          </div>

          <!-- Amount -->
          <div class="mb-3 col-12 col-md-6">
            <label for="updateAmount" class="form-label">Amount</label>
            <input type="number" step="0.01" class="form-control" id="updateAmount" value="${item.amount}" required>
            <div class="invalid-feedback">Enter an amount greater than 0.</div>
          </div>

          <!-- Category -->
          <div class="mb-3 col-12 col-md-6">
            <label for="updateCategory" class="form-label">Category</label>
            <select id="updateCategory" class="form-select" required>
             <option value="">Choose...</option>
              <option value="Food" ${item.category === 'Food' ? 'selected' : ''}>Food</option>
              <option value="Transport" ${item.category === 'Transport' ? 'selected' : ''}>Transport</option>
              <option value="Bills" ${item.category === 'Bills' ? 'selected' : ''}>Bills</option>
              <option value="Entertainment" ${item.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
              <option value="Other" ${item.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
            <div class="invalid-feedback">Choose a Category.</div>
          </div>

          <!-- Date -->
          <div class="mb-3 col-12">
            <label for="updateDate" class="form-label">Date</label>
            <input type="date" class="form-control" id="updateDate" value="${item.date}" required>
            <div class="invalid-feedback">Date is required.</div>
          </div>
        </div>

        <div class="text-end mt-3">
<button type="button" class="btn btn-primary" onclick="handleUpdateExpense(event, '${item.id}')">Save Changes</button> </div>   `;

}

////////////////// update  ///////////////////

async function handleUpdateExpense(event, id) {
    if (event) event.preventDefault();

    const titleInput = document.getElementById("updateTitle");
    const amountInput = document.getElementById("updateAmount");
    const categoryInput = document.getElementById("updateCategory");
    const dateInput = document.getElementById("updateDate");

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim();
    const date = dateInput.value.trim();


    let isValid = true;

    if (!title) {
        titleInput.classList.add("is-invalid");
        isValid = false;
    }

    if (isNaN(amount) || amount <= 0) {
        amountInput.classList.add("is-invalid");
        isValid = false;
    }

    if (!category) {
        categoryInput.classList.add("is-invalid");
        isValid = false;
    }

    if (!date) {
        dateInput.classList.add("is-invalid");
        isValid = false;
    }

    if (!isValid) return;

    const newExpense = { title, amount, category, date };
    showSpinner(true);
    hideAlert();
    try {
        const result = await updateExpense(id, newExpense);

        const modalElement = document.getElementById("update");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        refresh();
        showAlert("Expense updated successfully!", "success");
    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    refresh();
});
