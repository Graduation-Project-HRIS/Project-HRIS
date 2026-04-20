let db = null;
let dbReadyPromise = null;
let currentEditingEmployeeId = null;
let currentDeletingEmployeeId = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 2;

const employeeTableBody = document.getElementById("employeeTableBody");
const notificationSuccess = document.getElementById("notificationSuccess");
const notificationError = document.getElementById("notificationError");
const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");

dbReadyPromise = openDatabase();

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (e) => {
            console.error("IndexedDB error:", e.target.error);
            showNotification(notificationError, "Failed to open database.");
            reject(e.target.error);
        };

        request.onblocked = () => {
            showNotification(
                notificationError,
                "Database is blocked. Close other tabs of this project, then refresh."
            );
        };

        request.onupgradeneeded = (e) => {
            const database = e.target.result;

            if (!database.objectStoreNames.contains("employees")) {
                const employeeStore = database.createObjectStore("employees", { keyPath: "id" });
                employeeStore.createIndex("name", "name", { unique: false });
                employeeStore.createIndex("email", "email", { unique: true });
            }

            if (!database.objectStoreNames.contains("leaveRequests")) {
                const leaveStore = database.createObjectStore("leaveRequests", { keyPath: "leaveId" });
                leaveStore.createIndex("employeeId", "employeeId", { unique: false });
                leaveStore.createIndex("name", "name", { unique: false });
                leaveStore.createIndex("leaveType", "leaveType", { unique: false });
                leaveStore.createIndex("leaveDate", "leaveDate", { unique: false });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;

            db.onversionchange = () => {
                db.close();
                showNotification(
                    notificationError,
                    "Database version changed in another tab. Refresh this page."
                );
            };

            console.log("Edit page database opened successfully.");
            showEmployees();
            resolve(db);
        };
    });
}

async function ensureDatabase() {
    if (db) return db;
    if (!dbReadyPromise) dbReadyPromise = openDatabase();
    return await dbReadyPromise;
}

async function showEmployees() {
    try {
        const database = await ensureDatabase();

        if (!employeeTableBody) return;

        employeeTableBody.innerHTML = "";

        const transaction = database.transaction(["employees"], "readonly");
        const objectStore = transaction.objectStore("employees");
        const getAllRequest = objectStore.getAll();

        getAllRequest.onsuccess = () => {
            const employees = getAllRequest.result || [];

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

        getAllRequest.onerror = (e) => {
            console.error("Failed to load employees:", e.target.error);
            showNotification(notificationError, "Failed to load employees.");
        };
    } catch (error) {
        console.error(error);
        showNotification(notificationError, "Database is not ready. Refresh the page.");
    }
}

async function editEmployee(id) {
    try {
        const database = await ensureDatabase();

        const transaction = database.transaction(["employees"], "readonly");
        const objectStore = transaction.objectStore("employees");
        const getRequest = objectStore.get(id);

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
    } catch (error) {
        console.error(error);
        showNotification(notificationError, "Database is not ready.");
    }
}

function closeEditModal() {
    editModal.style.display = "none";
    currentEditingEmployeeId = null;
    document.getElementById("editForm").reset();
}

async function saveEdit() {
    try {
        const database = await ensureDatabase();

        if (!currentEditingEmployeeId) return;

        const newName = document.getElementById("editEmployeeName").value.trim();
        const newEmail = document.getElementById("editEmployeeEmail").value.trim().toLowerCase();

        if (!newName || !newEmail) {
            showNotification(notificationError, "Please fill in all fields.");
            return;
        }

        const updatedEmployee = {
            id: currentEditingEmployeeId,
            name: newName.replace(/[^A-Za-z\s]/g, ""),
            email: newEmail
        };

        const transaction = database.transaction(["employees"], "readwrite");
        const objectStore = transaction.objectStore("employees");
        const updateRequest = objectStore.put(updatedEmployee);

        updateRequest.onsuccess = () => {
            showNotification(notificationSuccess, "Employee updated successfully.");
            closeEditModal();
            showEmployees();
        };

        updateRequest.onerror = (e) => {
            if (e.target.error && e.target.error.name === "ConstraintError") {
                showNotification(notificationError, "Email already exists.");
            } else {
                showNotification(notificationError, "Failed to update employee.");
            }
        };
    } catch (error) {
        console.error(error);
        showNotification(notificationError, "Database is not ready.");
    }
}

function openDeleteModal(id) {
    currentDeletingEmployeeId = id;
    deleteModal.style.display = "block";
}

function closeDeleteModal() {
    deleteModal.style.display = "none";
    currentDeletingEmployeeId = null;
}

async function confirmDelete() {
    try {
        const database = await ensureDatabase();

        if (!currentDeletingEmployeeId) return;

        const transaction = database.transaction(["employees"], "readwrite");
        const objectStore = transaction.objectStore("employees");
        const deleteRequest = objectStore.delete(currentDeletingEmployeeId);

        deleteRequest.onsuccess = () => {
            showNotification(notificationSuccess, "Employee deleted successfully.");
            closeDeleteModal();
            showEmployees();
        };

        deleteRequest.onerror = () => {
            showNotification(notificationError, "Failed to delete employee.");
        };
    } catch (error) {
        console.error(error);
        showNotification(notificationError, "Database is not ready.");
    }
}

function showNotification(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 3000);
}