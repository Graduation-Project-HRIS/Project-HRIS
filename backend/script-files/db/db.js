// =============================================
// Database Initialization
// =============================================

let db;

// Get HTML elements
const form = document.getElementById("employeeForm");
const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeEmailInput = document.getElementById("employeeEmail");
const employeeTableBody = document.getElementById("employeeTableBody");
const saveButton = document.getElementById("saveButton");
const editButton = document.getElementById("editButton");
const submitMessage = document.getElementById("submitMessage");
const submitMessageError = document.getElementById("submitMessageError");
const updateEmployee = document.getElementById("updateEmployee");

// =============================================
// Open / Create IndexedDB Database
// =============================================

const request = indexedDB.open("EmployeeDB", 1);

// Handle database open errors
request.onerror = (e) => {
    console.error("An error occurred with IndexedDB:", e);
};

// Runs only when the DB is created or upgraded — sets up the object store and indexes
request.onupgradeneeded = (e) => {
    db = e.target.result;

    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};

// Runs when the DB opens successfully — load the employee list
request.onsuccess = (e) => {
    db = e.target.result;
    showEmployees();
};

// =============================================
// Add New Employee
// =============================================

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const employeeData = {
        id: employeeIdInput.value.trim(),
        name: employeeNameInput.value.trim(),
        email: employeeEmailInput.value.trim()
    };
    const transaction = db.transaction(["employees"], "readwrite");
    const objectStore = transaction.objectStore("employees");
    const addRequest = objectStore.add(employeeData);

    addRequest.onsuccess = () => {
        showNotification(submitMessage, "Employee added successfully!");
        form.reset();
        showEmployees();
    };

    addRequest.onerror = () => {
        showNotification(submitMessageError, "Error: Could not add employee. ID or Email may already exist.");
    };
});

// =============================================
// Display All Employees
// =============================================

function showEmployees() {
    employeeTableBody.innerHTML = "";

    const objectStore = db.transaction(["employees"], "readonly").objectStore("employees");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
        getAllRequest.result.forEach((employee) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>
                    <button class="action-btn" onclick="editEmployee('${employee.id}')">Edit</button>
                    <button class="action-btn" onclick="deleteEmployee('${employee.id}')">Delete</button>
                </td>
            `;

            employeeTableBody.appendChild(row);
        });
    };
}

// =============================================
// Edit Employee — Populate Form with Data
// =============================================

function editEmployee(id) {
    const objectStore = db.transaction(["employees"], "readonly").objectStore("employees");
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = () => {
        const employee = getRequest.result;
        if (!employee) return;

        // Populate form fields
        employeeIdInput.value = employee.id;
        employeeNameInput.value = employee.name;
        employeeEmailInput.value = employee.email;

        // Switch to edit mode
        employeeIdInput.disabled = true;
        saveButton.style.display = "none";
        editButton.style.display = "inline-block";
    };
}

// =============================================
// Update Existing Employee
// =============================================

editButton.addEventListener("click", () => {
    const employeeData = {
        id: employeeIdInput.value.trim(),
        name: employeeNameInput.value.trim(),
        email: employeeEmailInput.value.trim()
    };

    const objectStore = db.transaction(["employees"], "readwrite").objectStore("employees");
    const updateRequest = objectStore.put(employeeData);

    updateRequest.onsuccess = () => {
        showNotification(updateEmployee, "Employee updated successfully!");
        resetForm();
        showEmployees();
    };

    updateRequest.onerror = () => {
        showNotification(submitMessageError, "Error: Could not update employee.");
    };
});

// =============================================
// Delete Employee
// =============================================

function deleteEmployee(id) {
    const objectStore = db.transaction(["employees"], "readwrite").objectStore("employees");
    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = () => {
        showEmployees();
    };


    deleteRequest.onerror = () => {
        showNotification(submitMessageError, "Error: Could not delete employee.");
    };
}

// =============================================
// Utility Functions
// =============================================

// Reset form back to "Add" mode after editing
function resetForm() {
    form.reset();
    employeeIdInput.disabled = false;
    saveButton.style.display = "inline-block";
    editButton.style.display = "none";
}

// Show a temporary toast notification and auto-hide after 2 seconds
function showNotification(element, message) {
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 2000);
}