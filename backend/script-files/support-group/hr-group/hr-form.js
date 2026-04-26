let db = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const submitMessageError = document.getElementById("submitMessageError");
const submitMessageSuccess = document.getElementById("submitMessageSuccess");

const employeeIdInput = document.getElementById("employeeIdInput");
const employeeIdError = document.getElementById("employeeIdError");
const submitButton = document.getElementById("submitButton");
const employeeName = document.getElementById("employeeName");
const detailsInput = document.getElementById("detailsInput");

const requestType = document.getElementById("requestType");
const hrForm = document.getElementById("hrForm");

/* These are for the HR requests output page */
const hrRequestsTableBody = document.getElementById("hrRequestsTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const refreshButton = document.getElementById("refreshButton");
const deleteModal = document.getElementById("deleteModal");
let currentDeletingHrRequestId = null;

if (submitButton) {
    submitButton.disabled = true;
}

openDatabase();

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

    request.onupgradeneeded = setupDatabase;

    request.onsuccess = function (event) {
        db = event.target.result;

        if (submitButton) {
            submitButton.disabled = false;
        }

        console.log("Database opened");

        // If this page is the HR requests output page, show the data
        if (hrRequestsTableBody) {
            showHrRequests();
        }
    };

    request.onerror = function () {
        showError("Database could not open.");
        showEmptyMessage("Database could not open.");
    };
}

function clearEmployeeName() {
    if (!employeeName) return;

    employeeName.value = "";
    employeeName.readOnly = true;
}

function validateId() {
    const employeeId = employeeIdInput.value.trim();

    if (employeeId === "") {
        employeeIdError.textContent = "";
        employeeIdInput.style.border = "";
        clearEmployeeName();
        return false;
    }

    if (!/^\d+$/.test(employeeId)) {
        employeeIdError.textContent = "ID must contain numbers only.";
        employeeIdInput.style.border = "2px solid red";
        clearEmployeeName();
        return false;
    }

    if (employeeId.length !== 8) {
        employeeIdError.textContent = "ID must be exactly 8 digits.";
        employeeIdInput.style.border = "2px solid red";
        clearEmployeeName();
        return false;
    }

    employeeIdError.textContent = "";
    employeeIdInput.style.border = "2px solid green";
    return true;
}

function validateRequestType() {
    const requestTypeInput = requestType.value.trim();

    if (requestTypeInput === "") {
        showError("Please select a request type.");
        return false;
    }

    return true;
}

function findEmployeeById(employeeId, callback) {
    const transaction = db.transaction("employees", "readonly");
    const store = transaction.objectStore("employees");
    const request = store.get(employeeId);

    request.onsuccess = () => {
        callback(request.result);
    };

    request.onerror = () => {
        callback(null);
    };
}

/* =========================
   Form page code
   ========================= */

if (employeeIdInput) {
    employeeIdInput.addEventListener("input", () => {
        if (!db) return;

        const isValid = validateId();

        if (!isValid) {
            return;
        }

        const employeeId = employeeIdInput.value.trim();

        findEmployeeById(employeeId, (employee) => {
            if (!employee) {
                employeeIdError.textContent = "Employee ID not found.";
                employeeIdInput.style.border = "2px solid red";
                clearEmployeeName();
                return;
            }

            employeeName.value = employee.name;
            employeeName.readOnly = true;
            employeeIdError.textContent = "";
            employeeIdInput.style.border = "2px solid green";
        });
    });
}

if (requestType) {
    requestType.addEventListener("change", validateRequestType);
}

function generateRandomHrRequestsId() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}


if (hrForm) {
    hrForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!db) {
            showError("Database is not ready.");
            return;
        }

        if (!validateId()) {
            showError("Employee ID must be exactly 8 digits.");
            return;
        }

        if (!validateRequestType()) {
            showError("Please select a request type.");
            return;
        }

        const employeeId = employeeIdInput.value.trim();
        const requestTypeInput = requestType.value.trim();
        const details = detailsInput.value.trim();

        const fieldsEmptyNotifications = {
            employeeId: employeeId,
            requestTypeInput: requestTypeInput,
            details: details
        };

        if (Object.values(fieldsEmptyNotifications).some(value => value === "")) {
            showError("Please fill in all fields.");
            return;
        }

        findEmployeeById(employeeId, (employee) => {
            if (!employee) {
                showError("Employee ID does not exist.");
                clearEmployeeName();
                return;
            }

            const requestId = generateRandomHrRequestsId();

            
            const hrRequestData = {
                hrID: requestId,
                employeeId: employeeId,
                name: employee.name,
                details: details,
                requestType: requestTypeInput
            };

            saveHrRequest(hrRequestData);
        });
    });
}

function saveHrRequest(hrRequestData) {
    const transaction = db.transaction("humanResourceRequests", "readwrite");
    const store = transaction.objectStore("humanResourceRequests");
    const request = store.add(hrRequestData);

    request.onsuccess = () => {
        showSuccess("HR request saved successfully.");

        hrForm.reset();
        clearEmployeeName();
        employeeIdInput.style.border = "";
        employeeIdError.textContent = "";
    };

    request.onerror = () => {
        showError("Failed to save HR request.");
    };
}

/* =========================
   HR requests output page code
   ========================= */

function showHrRequests() {
    if (!hrRequestsTableBody) return;

    hrRequestsTableBody.innerHTML = "";

    if (!db.objectStoreNames.contains("humanResourceRequests")) {
        showEmptyMessage("HR requests store does not exist.");
        return;
    }

    const transaction = db.transaction("humanResourceRequests", "readonly");
    const store = transaction.objectStore("humanResourceRequests");
    const request = store.getAll();

    request.onsuccess = function () {
        const hrRequests = request.result;

        if (hrRequests.length === 0) {
            showEmptyMessage("No HR requests found.");
            return;
        }

        if (emptyMessage) {
            emptyMessage.classList.remove("show");
        }

        hrRequests.forEach((hrRequest, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${hrRequest.employeeId}</td>
                <td>${hrRequest.name}</td>
                <td>${hrRequest.requestType}</td>
                <td>${hrRequest.details}</td>
                <td>${hrRequest.hrID}</td>
                <td>
                    <button type="button" class="btn-delete" onclick="openDeleteModal('${hrRequest.hrID}')">
                        Delete
                    </button>
                </td>
            `;

            hrRequestsTableBody.appendChild(row);
        });
    };

    request.onerror = function () {
        showEmptyMessage("Could not load HR requests.");
    };
}

function openDeleteModal(requestId) {
    currentDeletingHrRequestId = requestId;

    if (deleteModal) {
        deleteModal.style.display = "block";
    }
}

function closeDeleteModal() {
    currentDeletingHrRequestId = null;

    if (deleteModal) {
        deleteModal.style.display = "none";
    }
}

function confirmDelete() {
    if (!db) return;

    if (!currentDeletingHrRequestId) return;

    const transaction = db.transaction("humanResourceRequests", "readwrite");
    const store = transaction.objectStore("humanResourceRequests");
    const request = store.delete(currentDeletingHrRequestId);

    request.onsuccess = function () {
        closeDeleteModal();
        showHrRequests();
    };

    request.onerror = function () {
        closeDeleteModal();
        showEmptyMessage("Could not delete HR request.");
    };
}



if (refreshButton) {
    refreshButton.addEventListener("click", function () {
        if (!db) return;
        showHrRequests();
    });
}

function showEmptyMessage(message) {
    if (!emptyMessage) return;

    emptyMessage.textContent = message;
    emptyMessage.classList.add("show");
}

/* =========================
   Notifications
   ========================= */

function showSuccess(message) {
    if (!submitMessageSuccess || !submitMessageError) return;

    submitMessageSuccess.textContent = message;
    submitMessageSuccess.classList.add("show");

    submitMessageError.textContent = "";
    submitMessageError.classList.remove("show");

    setTimeout(function () {
        submitMessageSuccess.classList.remove("show");
    }, 3000);
}

function showError(message) {
    if (!submitMessageError || !submitMessageSuccess) return;

    submitMessageError.textContent = message;
    submitMessageError.classList.add("show");

    submitMessageSuccess.textContent = "";
    submitMessageSuccess.classList.remove("show");

    setTimeout(function () {
        submitMessageError.classList.remove("show");
    }, 4000);
}