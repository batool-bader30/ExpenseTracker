
const API_URL = "http://localhost:3000/api/expenses";


//////////////////////  get data  ////////////////////////////////
async function getExpenses() {
    try {
        const response = await fetch(API_URL);

        const result = await response.json();
        if (response.status == 200) { return result; }
        else {
            throw new Error(result.error || "Failed to fetch expenses from server");
        }



    } catch (error) {
        console.error("Error in Get Expenses:", error.message);
        throw error.message;
    }
}

//////////////////////  get data By ID  ////////////////////////////////
async function getExpensesById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        const result = await response.json();
        if (response.status == 200) { return result; }
        else {
            throw new Error(result.error || "Failed to fetch expenses from server");
        }


    } catch (error) {
        console.error("Error in Get Expenses:", error.message);
        throw error.message;
    }
}

//////////////////////  get data By Category ////////////////////////////////

async function getExpensesByCategory(category) {
    try {
        const response = await fetch(`${API_URL}/category/${category}`);

        const result = await response.json();
        if (response.status == 200) { return result; }
        else {
            throw new Error(result.error || "Failed to fetch expenses from server");
        }



    } catch (error) {
        console.error("Error in Get Expenses:", error.message);
        throw error.message;
    }
}


//////////////////////  add data  ////////////////////////////////

async function addExpenses(data) {
    try {
        const response = await fetch(API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
        const result = await response.json();

        if (response.status == 201) { return result; }
        else { throw new Error(result.error); }


    } catch (error) {
        console.error("Error in Add Expenses:", error.message);
        throw error;
    }
}

//////////////////////  UPDATE data  ////////////////////////////////


async function updateExpense(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
        const result = await response.json();

        if (response.status == 200) { return result; }
        else { throw new Error(result.error); }


    } catch (error) {
        console.error("Error in Update Expenses:", error.message);
        throw error;
    }
}

//////////////////////  delete data  ////////////////////////////////

async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",

        });
        const result = await response.json();

        if (response.status == 200) { return result; }
        else { throw new Error(result.error); }


    } catch (error) {
        console.error("Error in Delete Expenses:", error.message);
        throw error;
    }
}
