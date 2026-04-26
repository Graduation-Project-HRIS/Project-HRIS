let db = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const importJsonButton = document.getElementById("importJsonButton");
const refreshButton = document.getElementById("refreshButton");
const recordsMessage = document.getElementById("recordsMessage");

const employeeTableBody = document.getElementById("employeeTableBody");
const leaveTableBody = document.getElementById("leaveTableBody");
const hrTableBody = document.getElementById("hrTableBody");

openDatabase();

function setupDatabase(event) {
    const database = event.target.result;
    const transaction = event.target.transaction;

    let employeeStore;
    let leaveStore;
    let hrStore;

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
        showAllRecords();
    };

    request.onerror = function () {
        showMessage("Database could not open.", "red");
    };
}

if (importJsonButton) {
    importJsonButton.addEventListener("click", importJsonRecords);
}

if (refreshButton) {
    refreshButton.addEventListener("click", showAllRecords);
}

function importJsonRecords() {
    if (!db) {
        showMessage("Database is not ready.", "red");
        return;
    }

    fetch("/backend/script-files/db/json/records.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("JSON file was not found.");
            }

            return response.json();
        })
        .then(function (data) {
            const employees = data.employees || [];

            if (employees.length === 0) {
                showMessage("No employees found inside the JSON file.", "red");
                return;
            }

            saveJsonRecords(employees);
        })
        .catch(function (error) {
            console.error(error);
            showMessage("Could not read records.json.", "red");
        });
}

function saveJsonRecords(records) {
    const transaction = db.transaction(
        ["employees", "leaveRequests", "humanResourceRequests"],
        "readwrite"
    );

    const employeeStore = transaction.objectStore("employees");
    const leaveStore = transaction.objectStore("leaveRequests");
    const hrStore = transaction.objectStore("humanResourceRequests");

    records.forEach(function (record) {
        const employeeId = String(record.id);
        const phoneNumber = String(record.phoneNumber);

        const employeeData = {
            id: employeeId,
            name: record.name,
            email: record.email,
            gender: record.gender,
            nationality: record.nationality,
            phoneNumber: phoneNumber,
            department: record.department,
            role: record.role
        };

        employeeStore.put(employeeData);

        if (record.leaveType && record.leaveDate) {
            const startDate = formatDate(record.leaveDate.startDate);
            const endDate = formatDate(record.leaveDate.endDate);

            const leaveData = {
                leaveId: "L" + employeeId,
                employeeId: employeeId,
                name: record.name,
                leaveType: formatLeaveType(record.leaveType),
                startDate: startDate,
                endDate: endDate,
                leaveDate: startDate,
                details: "Imported from JSON file"
            };

            leaveStore.put(leaveData);
        }

        if (record.hrRequestType && record.hrRequestId) {
            const hrRequestData = {
                hrID: String(record.hrRequestId),
                employeeId: employeeId,
                name: record.name,
                requestType: record.hrRequestType,
                details: "Imported from JSON file"
            };

            hrStore.put(hrRequestData);
        }
    });

    transaction.oncomplete = function () {
        showMessage("JSON records imported successfully.", "green");
        showAllRecords();
    };

    transaction.onerror = function (event) {
        console.error(event.target.error);
        showMessage("Import failed. Check for duplicate email or phone number.", "red");
    };
}

function showAllRecords() {
    if (!db) return;

    showEmployees();
    showLeaveRequests();
    showHrRequests();
}

function showEmployees() {
    const transaction = db.transaction("employees", "readonly");
    const store = transaction.objectStore("employees");
    const request = store.getAll();

    request.onsuccess = function () {
        displayEmployees(request.result);
    };

    request.onerror = function () {
        showMessage("Could not load employees.", "red");
    };
}

function displayEmployees(employees) {
    employeeTableBody.innerHTML = "";

    if (employees.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;">No employees found.</td>
            </tr>
        `;
        return;
    }

    employees.forEach(function (employee, index) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.gender}</td>
            <td>${employee.nationality}</td>
            <td>${employee.phoneNumber}</td>
            <td>${employee.role}</td>
            <td>${employee.department}</td>
        `;

        employeeTableBody.appendChild(row);
    });
}

function showLeaveRequests() {
    const transaction = db.transaction("leaveRequests", "readonly");
    const store = transaction.objectStore("leaveRequests");
    const request = store.getAll();

    request.onsuccess = function () {
        displayLeaveRequests(request.result);
    };

    request.onerror = function () {
        showMessage("Could not load leave requests.", "red");
    };
}

function displayLeaveRequests(leaveRequests) {
    leaveTableBody.innerHTML = "";

    if (leaveRequests.length === 0) {
        leaveTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">No leave requests found.</td>
            </tr>
        `;
        return;
    }

    leaveRequests.forEach(function (leave, index) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${leave.leaveId}</td>
            <td>${leave.employeeId}</td>
            <td>${leave.name}</td>
            <td>${leave.leaveType}</td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td>${leave.details}</td>
        `;

        leaveTableBody.appendChild(row);
    });
}

function showHrRequests() {
    const transaction = db.transaction("humanResourceRequests", "readonly");
    const store = transaction.objectStore("humanResourceRequests");
    const request = store.getAll();

    request.onsuccess = function () {
        displayHrRequests(request.result);
    };

    request.onerror = function () {
        showMessage("Could not load HR requests.", "red");
    };
}

function displayHrRequests(hrRequests) {
    hrTableBody.innerHTML = "";

    if (hrRequests.length === 0) {
        hrTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">No HR requests found.</td>
            </tr>
        `;
        return;
    }

    hrRequests.forEach(function (hrRequest, index) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${hrRequest.hrID}</td>
            <td>${hrRequest.employeeId}</td>
            <td>${hrRequest.name}</td>
            <td>${hrRequest.requestType}</td>
            <td>${hrRequest.details}</td>
        `;

        hrTableBody.appendChild(row);
    });
}

function formatDate(dateValue) {
    const parts = dateValue.split("/");

    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    const year = parts[2];

    return year + "-" + month + "-" + day;
}

function formatLeaveType(leaveType) {
    return leaveType.toLowerCase().replaceAll(" ", "-");
}

function showMessage(message, color) {
    recordsMessage.textContent = message;
    recordsMessage.style.color = color;
}