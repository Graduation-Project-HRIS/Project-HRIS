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
                    <td colspan="4" style="text-align:center; padding:18px; color:#4d5d7a">No employees found.</td>
                </tr>`;
            return;
        }

        employees.forEach((employee) => {
            const row = document.createElement("tr");
            row.innerHTML = `
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

function closeEditModal() {
    editModal.style.display = "none";
    currentEditingEmployeeId = null;
    document.getElementById("editForm").reset();
}

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
            showNotification(notificationError, "Email already exists.");
        } else {
            showNotification(notificationError, "Failed to update employee.");
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

function confirmDelete() {
    if (!db || !currentDeletingEmployeeId) return;

    const deleteTransaction = db.transaction(["employees"], "readwrite").objectStore("employees");
    const deleteRequest = deleteTransaction.delete(currentDeletingEmployeeId);

    deleteRequest.onsuccess = () => {
        showNotification(notificationSuccess, "Employee deleted successfully.");
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
