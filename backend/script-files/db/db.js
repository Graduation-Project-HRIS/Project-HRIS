// =============================================
// Database Initialization
// =============================================

let db;

const form = document.getElementById("employeeForm");
const employeeIdGenerator = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeEmailInput = document.getElementById("employeeEmail");
const submitMessage = document.getElementById("submitMessage");
const submitMessageError = document.getElementById("submitMessageError");
const generateIdButton = document.getElementById("generateId");

const request = indexedDB.open("EmployeeDB", 1);

// Handle database open errors
request.onerror = (e) => {
    console.error("IndexedDB error:", e);
};

// Runs only when the DB is created or upgraded
request.onupgradeneeded = (e) => {
    db = e.target.result;

    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};

// Runs when the DB opens successfully
request.onsuccess = (e) => {
    db = e.target.result;
};

// =============================================
// Generate Employee ID
// =============================================
// Generate a random 8-digit ID
function generateEmployeeID() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}
// Generate a unique Employee ID by checking against existing IDs in the database
function generateUniqueEmployeeID(callback) {
    if (!db) {
        showNotification(submitMessageError, "Database is not ready.");
        return;
    }

    function tryID() {
        const newId = generate8DigitID();
        const transaction = db.transaction(["employees"], "readonly").objectStore("employees");
        const getRequest = objectStore.get(newId);

        getRequest.onsuccess = () => {
            if (getRequest.result) {
                tryID();
            } else {
                callback(newId);
            }
        };

        getRequest.onerror = () => {
            showNotification(submitMessageError, "Failed to generate unique ID.");
        };
    }

    tryID();
}

// Event listener for Generate ID button
generateIdButton.addEventListener("click", () => {
    generateUniqueEmployeeID((newId) => {
        employeeIdGenerator.value = newId;
        employeeIdGenerator.readOnly = true;
        employeeIdGenerator.style.cursor = "not-allowed";
    });
});

// =============================================
// Name Input Validation
// Prevent numbers and symbols while typing
// =============================================

employeeNameInput.addEventListener("input", () => {
    employeeNameInput.value = employeeNameInput.value.replace(/[^A-Za-z\s]/g, "");
});

// =============================================
// Form Submit
// =============================================

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!db) {
            showNotification(submitMessageError, "Error: Database is not ready.");
            return;
        }

        const employeeData = {
            id: employeeIdGenerator.value.trim(),
            name: employeeNameInput.value.trim(),
            email: employeeEmailInput.value.trim()
        };

        if (!employeeData.id || !employeeData.name || !employeeData.email) {
            showNotification(submitMessageError, "Error: Please fill in all fields.");
            return;
        }

        const transaction = db.transaction(["employees"], "readwrite");
        const objectStore = transaction.objectStore("employees");
        const addRequest = objectStore.add(employeeData);

        addRequest.onsuccess = () => {
            showNotification(submitMessage, "Employee added successfully!");
            form.reset();
        };

        addRequest.onerror = (event) => {
            const error = event.target.error;
            showNotification(
                submitMessageError,
                "Could not add Employee. " + (error ? error.message : "Unknown error.")
            );
        };
    });
}

// =============================================
// Notification Function
// =============================================

function showNotification(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}






// =============================================
// Database Initialization for employee list and edit/delete
// =============================================

let db;
let currentEditingEmployeeId = null;
let currentDeletingEmployeeId = null;

const employeeTableBody = document.getElementById("employeeTableBody");
const notificationSuccess = document.getElementById("notificationSuccess");
const notificationError = document.getElementById("notificationError");
const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");

const request = indexedDB.open("EmployeeDB", 1);

request.onerror = (e) => {
    console.error("IndexedDB error:", e);
    showNotification(notificationError, "Database error occurred.");
};

request.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};

request.onsuccess = (e) => {
    db = e.target.result;
    showEmployees();
};

// =============================================
// Display Employees List
// =============================================

function showEmployees() {
    if (!employeeTableBody || !db) return;

    employeeTableBody.innerHTML = "";

    const objectStore = db.transaction(["employees"], "readonly").objectStore("employees");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
        const employees = getAllRequest.result;

        if (employees.length === 0) {
            employeeTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:18px; color:#4d5d7a;">
                        No employees found.
                    </td>
                </tr>
            `;
            return;
        }

        employees.forEach((employee, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>
                    <button type="button" class="action-btn" onclick="editEmployee('${employee.id}')">Edit</button>
                    <button type="button" class="action-btn btn-danger" onclick="openDeleteModal('${employee.id}')">Delete</button>
                </td>
            `;
            employeeTableBody.appendChild(row);
        });
    };

    getAllRequest.onerror = () => {
        console.error("Unable to load employees.");
        showNotification(notificationError, "Failed to load employees.");
    };
}

// =============================================
// Edit Employee Modal
// =============================================

function editEmployee(id) {
    if (!db) return;

    const transaction = db.transaction(["employees"], "readonly").objectStore("employees");
    const getRequest = transaction.get(id);

    getRequest.onsuccess = () => {
        const employee = getRequest.result;
        if (!employee) {
            showNotification(notificationError, "Employee not found.");
            return;
        }

        currentEditingEmployeeId = employee.id;
        document.getElementById("editEmployeeId").value = employee.id;
        document.getElementById("editEmployeeName").value = employee.name;
        document.getElementById("editEmployeeEmail").value = employee.email;

        editModal.style.display = "block";
    };

    getRequest.onerror = () => {
        showNotification(notificationError, "Failed to load employee details.");
    };
}
// Close Edit Modal and Reset Form
function closeEditModal() {
    editModal.style.display = "none";
    currentEditingEmployeeId = null;
    document.getElementById("editForm").reset();
}
// Save Edited Employee Details
function saveEdit() {
    if (!db || !currentEditingEmployeeId) return;

    const newName = document.getElementById("editEmployeeName").value.trim();
    const newEmail = document.getElementById("editEmployeeEmail").value.trim();

    if (!newName || !newEmail) {
        showNotification(notificationError, "Please fill in all fields.");
        return;
    }

    const updatedEmployee = {
        id: currentEditingEmployeeId,
        name: newName,
        email: newEmail
    };

    const updateTransaction = db.transaction(["employees"], "readwrite").objectStore("employees");
    const updateRequest = updateTransaction.put(updatedEmployee);

    updateRequest.onsuccess = () => {
        showNotification(notificationSuccess, "Employee updated successfully.");
        closeEditModal();
        showEmployees();
    };

    updateRequest.onerror = (e) => {
        if (e.target.error.name === "ConstraintError") {
            showNotification(notificationError, "Email Already Exists.");
        } else {
            showNotification(notificationError, "Failed to Update Employee.");
        }
    };
}

// =============================================
// Delete Employee Modal
// =============================================

function openDeleteModal(id) {
    currentDeletingEmployeeId = id;
    deleteModal.style.display = "block";
}

function closeDeleteModal() {
    deleteModal.style.display = "none";
    currentDeletingEmployeeId = null;
}
// Confirm Deletion of Employee
function confirmDelete() {
    if (!db || !currentDeletingEmployeeId) return;

    const deleteTransaction = db.transaction(["employees"], "readwrite").objectStore("employees");
    const deleteRequest = deleteTransaction.delete(currentDeletingEmployeeId);

    deleteRequest.onsuccess = () => {
        showNotification(notificationSuccess, "Employee Deleted Successfully.");
        closeDeleteModal();
        showEmployees();
    };

    deleteRequest.onerror = () => {
        showNotification(notificationError, "Failed to delete employee.");
    };
}

// =============================================
// Notification Toast
// =============================================

function showNotification(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 3000);
}
