let db = null;
let currentEditingEmployeeId = null;
let currentDeletingEmployeeId = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const employeeTableBody = document.getElementById("employeeTableBody");
const notificationSuccess = document.getElementById("notificationSuccess");
const notificationError = document.getElementById("notificationError");
const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");
const searchBar = document.getElementById("searchBar");

const editEmployeeId = document.getElementById("editEmployeeId");
const editEmployeeName = document.getElementById("editEmployeeName");
const editEmployeeEmail = document.getElementById("editEmployeeEmail");
const editEmployeeGenderMale = document.getElementById("editEmployeeGenderMale");
const editEmployeeGenderFemale = document.getElementById("editEmployeeGenderFemale");
const editEmployeeNationality = document.getElementById("editEmployeeNationality");
const editEmployeePhoneNumber = document.getElementById("editEmployeePhoneNumber");
const editEmployeeRole = document.getElementById("editEmployeeRole");
const editEmployeeDepartment = document.getElementById("editEmployeeDepartment");



function setupDatabase(event) {
    const database = event.target.result;
    const transaction = event.target.transaction;

    let employeeStore;
    let leaveStore;
    let hrStore;

    // =========================
    // employees store
    // =========================
    if (!database.objectStoreNames.contains("employees")) {
        employeeStore = database.createObjectStore("employees", {
            keyPath: "id"
        });
    } else {
        employeeStore = transaction.objectStore("employees");
    }

    if (!employeeStore.indexNames.contains("name")) {
        employeeStore.createIndex("name", "name", { unique: false });
    }

    if (!employeeStore.indexNames.contains("email")) {
        employeeStore.createIndex("email", "email", { unique: true });
    }

    if (!employeeStore.indexNames.contains("phoneNumber")) {
        employeeStore.createIndex("phoneNumber", "phoneNumber", { unique: true });
    }

    // =========================
    // leaveRequests store
    // =========================
    if (!database.objectStoreNames.contains("leaveRequests")) {
        leaveStore = database.createObjectStore("leaveRequests", {
            keyPath: "leaveId"
        });
    } else {
        leaveStore = transaction.objectStore("leaveRequests");
    }

    if (!leaveStore.indexNames.contains("employeeId")) {
        leaveStore.createIndex("employeeId", "employeeId", { unique: false });
    }

    if (!leaveStore.indexNames.contains("name")) {
        leaveStore.createIndex("name", "name", { unique: false });
    }

    if (!leaveStore.indexNames.contains("leaveType")) {
        leaveStore.createIndex("leaveType", "leaveType", { unique: false });
    }

    if (!leaveStore.indexNames.contains("leaveDate")) {
        leaveStore.createIndex("leaveDate", "leaveDate", { unique: false });
    }

    if (!leaveStore.indexNames.contains("startDate")) {
        leaveStore.createIndex("startDate", "startDate", { unique: false });
    }

    if (!leaveStore.indexNames.contains("endDate")) {
        leaveStore.createIndex("endDate", "endDate", { unique: false });
    }

    // =========================
    // humanResourceRequests store
    // =========================
    if (!database.objectStoreNames.contains("humanResourceRequests")) {
        hrStore = database.createObjectStore("humanResourceRequests", {
            keyPath: "hrID"
        });
    } else {
        hrStore = transaction.objectStore("humanResourceRequests");
    }

    if (!hrStore.indexNames.contains("employeeId")) {
        hrStore.createIndex("employeeId", "employeeId", { unique: false });
    }

    if (!hrStore.indexNames.contains("name")) {
        hrStore.createIndex("name", "name", { unique: false });
    }

    if (!hrStore.indexNames.contains("requestType")) {
        hrStore.createIndex("requestType", "requestType", { unique: false });
    }
}




function openDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
        showNotification(notificationError, "Failed to open database.");
    };

    request.onblocked = () => {
        showNotification(notificationError, "Close other tabs, then refresh.");
    };

    request.onupgradeneeded = setupDatabase;

    request.onsuccess = (e) => {
        db = e.target.result;

        db.onversionchange = () => {
            db.close();
            showNotification(notificationError, "Database changed. Refresh the page.");
        };

        if (typeof window.seedDefaultEmployees === "function") {
            window.seedDefaultEmployees(db);
        }

        showEmployees();
    };
}

/* Shows all employees inside the table */
function showEmployees() {
    if (!db) return;

    const transaction = db.transaction(["employees"], "readonly");
    const objectStore = transaction.objectStore("employees");
    const request = objectStore.getAll();

    request.onsuccess = () => {
        displayEmployees(request.result);
    };

    request.onerror = () => {
        showNotification(notificationError, "Failed to load employees.");
    };
}

/* Displays employees in the table */
function displayEmployees(employees) {
    employeeTableBody.innerHTML = "";

    if (employees.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding:18px; color:#4d5d7a;">
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
            <td>${employee.gender}</td>
            <td>${employee.nationality}</td>
            <td>${employee.phoneNumber}</td>
            <td>${employee.role || "No Role"}</td>
            <td>${employee.department || "No Department"}</td>
            <td>
                <button type="button" class="action-btn" onclick="editEmployee('${employee.id}')">Edit</button>
                <button type="button" class="action-btn btn-danger" onclick="openDeleteModal('${employee.id}')">Delete</button>
            </td>
        `;

        employeeTableBody.appendChild(row);
    });
}

/* Searches only by employee ID and phone number */
function searchEmployees() {
    if (!db) return;

    const searchValue = searchBar.value.trim().toLowerCase();
    const phoneSearchValue = searchValue.replace("+965", "").replace(/\D/g, "");

    const transaction = db.transaction(["employees"], "readonly");
    const objectStore = transaction.objectStore("employees");
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const employees = request.result;

        if (searchValue === "") {
            displayEmployees(employees);
            return;
        }

        const filteredEmployees = employees.filter((employee) => {
            const id = String(employee.id || "").toLowerCase();

            const phoneNumber = String(employee.phoneNumber || "")
                .replace("+965", "")
                .replace(/\D/g, "");

            return (
                id.includes(searchValue) ||
                (phoneSearchValue !== "" && phoneNumber.includes(phoneSearchValue))
            );
        });

        displayEmployees(filteredEmployees);
    };

    request.onerror = () => {
        showNotification(notificationError, "Search failed.");
    };
}

if (searchBar) {
    searchBar.addEventListener("input", searchEmployees);
}

/* Opens the edit modal and fills it with employee data */
function editEmployee(id) {
    if (!db) return;

    const transaction = db.transaction(["employees"], "readonly");
    const objectStore = transaction.objectStore("employees");
    const request = objectStore.get(id);

    request.onsuccess = () => {
        const employee = request.result;

        if (!employee) {
            showNotification(notificationError, "Employee not found.");
            return;
        }

        currentEditingEmployeeId = employee.id;

        editEmployeeId.value = employee.id;
        editEmployeeName.value = employee.name;
        editEmployeeEmail.value = employee.email;
        editEmployeeNationality.value = employee.nationality;
        editEmployeePhoneNumber.value = employee.phoneNumber;
        editEmployeeRole.value = employee.role || "";
        editEmployeeDepartment.value = employee.department || "";

        editEmployeeGenderMale.checked = employee.gender === editEmployeeGenderMale.value;
        editEmployeeGenderFemale.checked = employee.gender === editEmployeeGenderFemale.value;

        editModal.style.display = "block";
    };

    request.onerror = () => {
        showNotification(notificationError, "Failed to load employee details.");
    };
}

function closeEditModal() {
    editModal.style.display = "none";
    currentEditingEmployeeId = null;
    document.getElementById("editForm").reset();
}

/*
    Used async because this function takes time to get the data and want to make sure that
    all the data is stored in the {database}
*/
function saveEdit() {
    if (!db) return;

    if (!currentEditingEmployeeId) return;

    const newName = editEmployeeName.value.trim();
    const newEmail = editEmployeeEmail.value.trim().toLowerCase();
    const newNationality = editEmployeeNationality.value.trim();
    const newPhoneNumber = editEmployeePhoneNumber.value.trim();
    const newGender = editEmployeeGenderMale.checked
        ? editEmployeeGenderMale.value
        : editEmployeeGenderFemale.checked
            ? editEmployeeGenderFemale.value
            : "";
    const newRole = editEmployeeRole.value;
    const newDepartment = editEmployeeDepartment.value;

    if (
        newName === "" ||
        newEmail === "" ||
        newNationality === "" ||
        newPhoneNumber === "" ||
        newGender === "" ||
        newRole === "" ||
        newDepartment === ""
    ) {
        showNotification(notificationError, "Please fill in all fields.");
        return;
    }

    if (!/^[A-Za-z\s]+$/.test(newName)) {
        showNotification(notificationError, "Name must contain letters only.");
        return;
    }

    if (!/^[A-Za-z\s]+$/.test(newNationality)) {
        showNotification(notificationError, "Nationality must contain letters only.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        showNotification(notificationError, "Please enter a valid email.");
        return;
    }

    if (!/^\d{8}$/.test(newPhoneNumber)) {
        showNotification(notificationError, "Number must be exactly 8 digits.");
        return;
    }

    const updatedEmployee = {
        id: currentEditingEmployeeId,
        name: newName,
        email: newEmail,
        gender: newGender,
        nationality: newNationality,
        phoneNumber: newPhoneNumber,
        role: newRole,
        department: newDepartment,
    };

    const transaction = db.transaction(["employees"], "readwrite");
    const objectStore = transaction.objectStore("employees");
    const request = objectStore.put(updatedEmployee);

    request.onsuccess = () => {
        showNotification(notificationSuccess, "Employee updated successfully.");
        closeEditModal();

        if (searchBar.value.trim() !== "") {
            searchEmployees();
        } else {
            showEmployees();
        }
    };

    request.onerror = (e) => {
        if (e.target.error && e.target.error.name === "ConstraintError") { // Wrote this if condition because the email is unique:true
            showNotification(notificationError, "Email or phone number already exists.");
        } else {
            showNotification(notificationError, "Failed to update employee.");
        }
    };
}

function openDeleteModal(id) {
    currentDeletingEmployeeId = id;
    deleteModal.style.display = "block";
}

function closeDeleteModal() {
    deleteModal.style.display = "none";
    currentDeletingEmployeeId = null;
}

function confirmDelete() {
    if (!db) return;

    if (!currentDeletingEmployeeId) return;

    const transaction = db.transaction(["employees"], "readwrite");
    const objectStore = transaction.objectStore("employees");
    const request = objectStore.delete(currentDeletingEmployeeId);

    request.onsuccess = () => {
        showNotification(notificationSuccess, "Employee deleted successfully.");
        closeDeleteModal();

        if (searchBar.value.trim() !== "") {
            searchEmployees();
        } else {
            showEmployees();
        }
    };

    request.onerror = () => {
        showNotification(notificationError, "Failed to delete employee.");
    };
}

function showNotification(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}

window.addEventListener("focus", () => {
    if (searchBar && searchBar.value.trim() !== "") {
        searchEmployees();
    } else {
        showEmployees();
    }
});

openDatabase();