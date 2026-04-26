let db = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const form = document.getElementById("leaveForm");

const submitMessageSuccess = document.getElementById("submitMessageSuccess");
const submitMessageError = document.getElementById("submitMessageError");

const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const leaveTypeInput = document.getElementById("leaveType");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const detailsInput = document.getElementById("details");

const employeeIdError = document.getElementById("employeeIdError");
const dateRangeError = document.getElementById("dateRangeError");
const submitButton = document.getElementById("submitButton");

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

    if (!employeeStore.indexNames.contains("department")) {
        employeeStore.createIndex("department", "department", { unique: false });
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
    };

    request.onerror = function () {
        showError("Database could not open.");
    };
}

function clearEmployeeName() {
    employeeNameInput.value = "";
    employeeNameInput.readOnly = true;
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

function validateDateRange() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (startDate === "" || endDate === "") {
        dateRangeError.textContent = "";
        return false;
    }

    if (endDate < startDate) {
        dateRangeError.textContent = "End date must be after start date.";
        return false;
    }

    dateRangeError.textContent = "";
    return true;
}

function findEmployeeById(employeeId, callback) {
    const transaction = db.transaction("employees", "readonly");
    const store = transaction.objectStore("employees");
    const request = store.get(employeeId);

    request.onsuccess = function () {
        callback(request.result);
    };

    request.onerror = function () {
        callback(null);
    };
}

employeeIdInput.addEventListener("input", function () {
    if (!db) return;

    const isValid = validateId();

    if (!isValid) {
        return;
    }

    const employeeId = employeeIdInput.value.trim();

    findEmployeeById(employeeId, function (employee) {
        if (!employee) {
            employeeIdError.textContent = "Employee ID not found.";
            employeeIdInput.style.border = "2px solid red";
            clearEmployeeName();
            return;
        }

        employeeNameInput.value = employee.name;
        employeeNameInput.readOnly = true;
        employeeIdError.textContent = "";
        employeeIdInput.style.border = "2px solid green";
    });
});

startDateInput.addEventListener("change", validateDateRange);
endDateInput.addEventListener("change", validateDateRange);

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!db) {
        showError("Database is not ready.");
        return;
    }

    if (!validateId()) {
        showError("Employee ID must be exactly 8 digits.");
        return;
    }

    if (!validateDateRange()) {
        showError("Please choose a valid date range.");
        return;
    }

    const employeeId = employeeIdInput.value.trim();
    const leaveType = leaveTypeInput.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const details = detailsInput.value.trim();

    if (leaveType === "" || startDate === "" || endDate === "" || details === "") {
        showError("Please fill in all fields.");
        return;
    }

    findEmployeeById(employeeId, function (employee) {
        if (!employee) {
            showError("Employee ID does not exist.");
            clearEmployeeName();
            return;
        }

        const leaveData = {
            leaveId: "L" + Date.now(),
            employeeId: employeeId,
            name: employee.name,
            leaveType: leaveType,
            startDate: startDate,
            endDate: endDate,
            leaveDate: startDate,
            details: details
        };

        saveLeaveRequest(leaveData);
    });
});

function saveLeaveRequest(leaveData) {
    const transaction = db.transaction("leaveRequests", "readwrite");
    const store = transaction.objectStore("leaveRequests");
    const request = store.add(leaveData);

    request.onsuccess = function () {
        showSuccess("Leave request saved successfully.");

        form.reset();
        clearEmployeeName();
        employeeIdInput.style.border = "";
        employeeIdError.textContent = "";
        dateRangeError.textContent = "";

        setTimeout(function () {
            window.location.href = "/frontend/html-files/leave/leave-calendar.html";
        }, 1000);
    };

    request.onerror = function () {
        showError("Failed to save leave request.");
    };
}

function showSuccess(message) {
    submitMessageSuccess.textContent = message;
    submitMessageSuccess.classList.add("show");

    submitMessageError.textContent = "";
    submitMessageError.classList.remove("show");

    setTimeout(function () {
        submitMessageSuccess.classList.remove("show");
    }, 3000);
}

function showError(message) {
    submitMessageError.textContent = message;
    submitMessageError.classList.add("show");

    submitMessageSuccess.textContent = "";
    submitMessageSuccess.classList.remove("show");

    setTimeout(function () {
        submitMessageError.classList.remove("show");
    }, 4000);
}