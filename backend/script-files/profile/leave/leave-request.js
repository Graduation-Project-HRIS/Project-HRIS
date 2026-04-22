let db = null;
let dbReadyPromise = null;
let lookupTimeout = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 1;

const form = document.getElementById("leaveForm");
const submitMessage = document.getElementById("submitMessage");
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

setFormState(false);
dbReadyPromise = openDatabase();

function setFormState(isReady) {
    if (submitButton) {
        submitButton.disabled = !isReady;
    }
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (e) => {
            console.error("IndexedDB error:", e.target.error);
            showError("Failed to open database.");
            setFormState(false);
            reject(e.target.error);
        };

        request.onblocked = () => {
            showError("Database is blocked. Close other project tabs, then refresh.");
            setFormState(false);
        };

        request.onupgradeneeded = (e) => {
            const database = e.target.result;

            if (!database.objectStoreNames.contains("employees")) {
                const employeeStore = database.createObjectStore("employees", { keyPath: "id" });
                employeeStore.createIndex("name", "name", { unique: false });
                employeeStore.createIndex("email", "email", { unique: true });
            }
            if (db.objectStoreNames.contains("leaveRequests")) {
                db.deleteObjectStore("leaveRequests");
            }
            if (!database.objectStoreNames.contains("leaveRequests")) {
                const leaveStore = database.createObjectStore("leaveRequests", { keyPath: "leaveId" });
                leaveStore.createIndex("employeeId", "employeeId", { unique: false });
                leaveStore.createIndex("name", "name", { unique: false });
                leaveStore.createIndex("leaveType", "leaveType", { unique: false });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;

            db.onversionchange = () => {
                db.close();
                showError("Database version changed in another tab. Refresh this page.");
                setFormState(false);
            };

            console.log("Leave form database opened successfully.");
            setFormState(true);
            resolve(db);
        };
    });
}

async function ensureDatabase() {
    if (db) return db;
    if (!dbReadyPromise) dbReadyPromise = openDatabase();
    return await dbReadyPromise;
}

function clearEmployeeName() {
    employeeNameInput.value = "";
    employeeNameInput.readOnly = true;
}

function validateId() {
    let rawUserId = employeeIdInput.value.trim();

    rawUserId = rawUserId.slice(0, 8);
    employeeIdInput.value = rawUserId;

    if (rawUserId === "") {
        employeeIdError.textContent = "";
        employeeIdInput.style.border = "";
        clearEmployeeName();
        return false;
    }

    if (/[^0-9]/.test(rawUserId)) {
        employeeIdError.textContent = "ID must contain only numbers.";
        employeeIdInput.style.border = "2px solid red";
        clearEmployeeName();
        return false;
    }

    if (rawUserId.length !== 8) {
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

    if (!startDate || !endDate) {
        dateRangeError.textContent = "";
        return false;
    }

    if (endDate < startDate) {
        dateRangeError.textContent = "End date must be the same as or after start date.";
        return false;
    }

    dateRangeError.textContent = "";
    return true;
}

async function loadEmployeeById() {
    try {
        const database = await ensureDatabase();
        const employeeId = employeeIdInput.value.trim();

        if (!/^\d{8}$/.test(employeeId)) {
            clearEmployeeName();
            return;
        }

        const transaction = database.transaction(["employees"], "readonly");
        const objectStore = transaction.objectStore("employees");
        const getRequest = objectStore.get(employeeId);

        getRequest.onsuccess = () => {
            const employee = getRequest.result;

            if (!employee) {
                clearEmployeeName();
                employeeIdError.textContent = "Employee ID not found.";
                employeeIdInput.style.border = "2px solid red";
                return;
            }

            employeeNameInput.value = employee.name;
            employeeNameInput.readOnly = true;
            employeeIdError.textContent = "";
            employeeIdInput.style.border = "2px solid green";
        };

        getRequest.onerror = (e) => {
            console.error("Employee lookup error:", e.target.error);
            clearEmployeeName();
            showError("Failed to load employee data.");
        };
    } catch (error) {
        console.error(error);
        clearEmployeeName();
        showError("Database is not ready.");
    }
}

employeeIdInput.addEventListener("input", () => {
    const isValid = validateId();

    clearTimeout(lookupTimeout);

    if (!isValid) return;

    lookupTimeout = setTimeout(() => {
        loadEmployeeById();
    }, 150);
});

employeeIdInput.addEventListener("blur", () => {
    if (validateId()) {
        loadEmployeeById();
    }
});

startDateInput.addEventListener("change", validateDateRange);
endDateInput.addEventListener("change", validateDateRange);

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
    });
}

function generateLeaveId() {
    return "L" + Date.now() + Math.floor(Math.random() * 1000);
}

if (submitButton) {
    submitButton.addEventListener("click", async () => {
        try {
            const database = await ensureDatabase();

            if (!validateId()) {
                showError("Employee ID must be exactly 8 digits.");
                return;
            }

            if (!validateDateRange()) {
                showError("Please choose a valid date range.");
                return;
            }

            const employeeId = employeeIdInput.value.trim();
            const employeeName = employeeNameInput.value.trim();
            const leaveType = leaveTypeInput.value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const details = detailsInput.value.trim();

            if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !details) {
                showError("Please fill in all fields.");
                return;
            }

            const employeeTx = database.transaction(["employees"], "readonly");
            const employeeStore = employeeTx.objectStore("employees");
            const employeeRequest = employeeStore.get(employeeId);

            employeeRequest.onsuccess = () => {
                const employee = employeeRequest.result;

                if (!employee) {
                    clearEmployeeName();
                    showError("Employee ID does not exist in employees database.");
                    return;
                }

                const leaveData = {
                    leaveId: generateLeaveId(),
                    employeeId: employeeId,
                    name: employee.name,
                    leaveType: leaveType,
                    startDate: startDate,
                    endDate: endDate,
                    leaveDate: startDate,
                    details: details
                };

                const leaveTx = database.transaction(["leaveRequests"], "readwrite");
                const leaveStore = leaveTx.objectStore("leaveRequests");
                const addRequest = leaveStore.add(leaveData);

                addRequest.onsuccess = () => {
                    console.log("Leave request saved:", leaveData);
                    showSuccess("Leave request saved successfully.");

                    form.reset();
                    employeeIdError.textContent = "";
                    employeeIdInput.style.border = "";
                    dateRangeError.textContent = "";
                    clearEmployeeName();

                    setTimeout(() => {
                        window.location.href = "/frontend/html-files/leave/leave-calendar.html";
                    }, 1000);
                };

                addRequest.onerror = (event) => {
                    console.error("Error adding leave request:", event.target.error);
                    showError("Failed to save leave request.");
                };
            };

            employeeRequest.onerror = (event) => {
                console.error("Employee verify error:", event.target.error);
                showError("Failed to verify employee.");
            };
        } catch (error) {
            console.error(error);
            showError("Database is not ready.");
        }
    });
}

function showSuccess(message) {
    if (!submitMessage) return;

    submitMessage.textContent = message;
    submitMessage.classList.add("show");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (submitMessageError) {
        submitMessageError.classList.remove("show");
        submitMessageError.textContent = "";
    }

    setTimeout(() => {
        submitMessage.classList.remove("show");
    }, 3000);
}

function showError(message) {
    if (!submitMessageError) return;

    submitMessageError.textContent = message;
    submitMessageError.classList.add("show");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (submitMessage) {
        submitMessage.classList.remove("show");
        submitMessage.textContent = "";
    }

    setTimeout(() => {
        submitMessageError.classList.remove("show");
    }, 4000);
}