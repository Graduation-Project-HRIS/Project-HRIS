let db = null;
let currentDeletingEmployeeId = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const searchBar = document.getElementById("searchBar");
const hrRequestsTableBody = document.getElementById("hrRequestsTableBody");
const refreshButton = document.getElementById("refreshButton");
const deleteModal = document.getElementById("deleteModal");

const notificationSuccess = document.getElementById("notificationSuccess");
const notificationError = document.getElementById("notificationError");

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

        showHrRequests();
    };
}

function showHrRequests() {
    if (!db) return;

    const transaction = db.transaction(["humanResourceRequests"], "readonly");
    const objectStore = transaction.objectStore("humanResourceRequests");
    const request = objectStore.getAll();

    request.onsuccess = () => {
        displayHrRequests(request.result);
    };

    request.onerror = () => {
        showNotification(notificationError, "Failed to load HR requests.");
    };
}

function displayHrRequests(hrRequests) {
    hrRequestsTableBody.innerHTML = "";

    if (hrRequests.length === 0) {
        hrRequestsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:18px; color:#4d5d7a;">
                    No HR requests found.
                </td>
            </tr>
        `;
        return;
    }

    hrRequests.forEach((hrRequest, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${hrRequest.employeeId || ""}</td>
            <td>${hrRequest.name || ""}</td>
            <td>${hrRequest.requestType || ""}</td>
            <td>${getRequestDetails(hrRequest)}</td>
            <td>${hrRequest.hrID || ""}</td>
            <td>
                <button type="button" class="btn-delete" onclick="openDeleteModal('${hrRequest.hrID}')">
                    Delete
                </button>
            </td>
        `;

        hrRequestsTableBody.appendChild(row);
    });
}

function getRequestDetails(hrRequest) {
    if (hrRequest.details) {
        return hrRequest.details;
    }

    if (hrRequest.oldValue && hrRequest.newValue) {
        return `${hrRequest.oldValue} → ${hrRequest.newValue}`;
    }

    if (hrRequest.newValue) {
        return hrRequest.newValue;
    }

    return "No details";
}

function searchEmployeesHrRequests() {
    if (!db) return;

    const searchValue = searchBar.value.trim().toLowerCase();

    const transaction = db.transaction(["humanResourceRequests"], "readonly");
    const objectStore = transaction.objectStore("humanResourceRequests");
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const hrRequests = request.result;

        if (searchValue === "") {
            displayHrRequests(hrRequests);
            return;
        }

        const filteredEmployeesHrRequests = hrRequests.filter((hrRequest) => {
            const employeeId = String(hrRequest.employeeId || "").toLowerCase();
            const name = String(hrRequest.name || "").toLowerCase();
            const requestId = String(hrRequest.hrID || "").toLowerCase();

            return (
                employeeId.includes(searchValue) ||
                name.includes(searchValue) ||
                requestId.includes(searchValue)
            );
        });

        displayHrRequests(filteredEmployeesHrRequests);
    };

    request.onerror = () => {
        showNotification(notificationError, "Search failed.");
    };
}

if (searchBar) {
    searchBar.addEventListener("input", searchEmployeesHrRequests);
}

if (refreshButton) {
    refreshButton.addEventListener("click", () => {
        if (searchBar) {
            searchBar.value = "";
        }

        showHrRequests();
    });
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

    const transaction = db.transaction(["humanResourceRequests"], "readwrite");
    const objectStore = transaction.objectStore("humanResourceRequests");
    const request = objectStore.delete(currentDeletingEmployeeId);

    request.onsuccess = () => {
        showNotification(notificationSuccess, "HR request deleted successfully.");
        closeDeleteModal();

        if (searchBar && searchBar.value.trim() !== "") {
            searchEmployeesHrRequests();
        } else {
            showHrRequests();
        }
    };

    request.onerror = () => {
        showNotification(notificationError, "Failed to delete HR request.");
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
        searchEmployeesHrRequests();
    } else {
        showHrRequests();
    }
});

openDatabase();