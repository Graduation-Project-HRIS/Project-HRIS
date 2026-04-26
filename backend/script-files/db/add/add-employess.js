let db = null;
let dbReadyPromise = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const form = document.getElementById("employeeForm");
const employeeIdGenerator = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeEmailInput = document.getElementById("employeeEmail");
const submitMessage = document.getElementById("submitMessage");
const submitMessageError = document.getElementById("submitMessageError");
const generateIdButton = document.getElementById("generateId");
const saveButton = document.getElementById("saveButton");
const radioInputMale = document.getElementById("radioInputMale");
const radioInputFemale = document.getElementById("radioInputFemale");
const employeeInputNationality = document.getElementById("employeeInputNationality");
const employeeInputPhoneNumber = document.getElementById("employeeInputPhoneNumber");
const roleOfUser = document.getElementById("roleOfUser");
const departments = document.getElementById("departments");

setFormState(false);

dbReadyPromise = openDatabase();

/* Enables or disables the form buttons based on database readiness. */
function setFormState(isReady) {
    if (generateIdButton) generateIdButton.disabled = !isReady;
    if (saveButton) saveButton.disabled = !isReady;
}

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




/* Opens the IndexedDB database and creates the needed object stores. */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (e) => {
            console.error("IndexedDB error:", e.target.error);
            showNotification(submitMessageError, "Failed to open database.");
            setFormState(false);
            reject(e.target.error);
        };

        request.onblocked = () => {
            showNotification(
                submitMessageError,
                "Database is blocked. Close other open tabs of this project, then refresh."
            );
            setFormState(false);
        };

        request.onupgradeneeded = setupDatabase;

        request.onsuccess = (e) => {
            db = e.target.result;

            db.onversionchange = () => {
                db.close();
                showNotification(
                    submitMessageError,
                    "Database version changed in another tab. Refresh this page."
                );
                setFormState(false);
            };

            Promise.resolve(
                typeof window.seedDefaultEmployees === "function"
                    ? window.seedDefaultEmployees(db)
                    : undefined
            )
                .catch((error) => {
                    console.error("Default employee seed failed:", error);
                })
                .finally(() => {
                    setFormState(true);

                    console.log("Database opened successfully.");

                    resolve(db);
                });
        };
    });
}

/* Makes sure the database is open before using it. */
async function ensureDatabase() {
    if (db) return db;

    if (!dbReadyPromise) dbReadyPromise = openDatabase();

    return await dbReadyPromise;
}

/* Generates a random 8-digit employee ID. */
function generateEmployeeID() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

/* Generates a unique employee ID that does not already exist in IndexedDB. */
async function generateUniqueEmployeeID() {
    const database = await ensureDatabase();

    return new Promise((resolve, reject) => {
        function tryID() {
            const newId = generateEmployeeID();

            const transaction = database.transaction(["employees"], "readonly");
            const objectStore = transaction.objectStore("employees");
            const getRequest = objectStore.get(newId);

            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    tryID();
                } else {
                    resolve(newId);
                }
            };

            getRequest.onerror = () => {
                reject(new Error("Failed to generate unique ID."));
            };
        }

        tryID();
    });
}

if (generateIdButton) {
    generateIdButton.addEventListener("click", async () => {
        try {
            const newId = await generateUniqueEmployeeID();

            employeeIdGenerator.value = newId;
            employeeIdGenerator.readOnly = true;
            employeeIdGenerator.style.cursor = "not-allowed";
        } catch (error) {
            console.error(error);
            showNotification(submitMessageError, error.message || "Failed to generate employee ID.");
        }
    });
}

if (employeeNameInput) {
    employeeNameInput.addEventListener("input", () => {
        employeeNameInput.value = employeeNameInput.value.replace(/[^A-Za-z\s]/g, "");
    });
}

if (form) {
    /* Validates that an employee ID has been generated. */
    function validateEmployeeID() {
        const value = employeeIdGenerator.value.trim();

        if (value === "") {
            showNotification(submitMessageError, "Please generate an employee ID.");
            return false;
        }

        return true;
    }

    /* Validates that the employee name is filled and contains letters only. */
    function validateName() {
        const value = employeeNameInput.value.trim();

        if (value === "") {
            showNotification(submitMessageError, "Name is required.");
            return false;
        }

        if (!/^[A-Za-z\s]+$/.test(value)) {
            showNotification(submitMessageError, "Name must contain letters only.");
            return false;
        }

        return true;
    }

    /* Validates that nationality is filled and contains letters only. */
    function validateNationality() {
        const value = employeeInputNationality.value.trim();

        if (value === "") {
            showNotification(submitMessageError, "Nationality is required.");
            return false;
        }

        if (!/^[A-Za-z\s]+$/.test(value)) {
            showNotification(submitMessageError, "Nationality must contain letters only.");
            return false;
        }

        return true;
    }

    /* Validates that the email is filled and has a valid format. */
    function validateEmail() {
        const value = employeeEmailInput.value.trim().toLowerCase();

        if (value === "") {
            showNotification(submitMessageError, "Email is required.");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showNotification(submitMessageError, "Please enter a valid email format.");
            return false;
        }

        return true;
    }

    /* Validates that the phone number is exactly 8 digits. */
    function validatePhoneNumber() {
        const value = employeeInputPhoneNumber.value.trim();

        if (value === "") {
            showNotification(submitMessageError, "Number is required.");
            return false;
        }

        if (!/^\d{8}$/.test(value)) {
            showNotification(submitMessageError, "Number must be exactly 8 digits.");
            return false;
        }

        return true;
    }

    /* Validates that one gender option is selected. */
    function validateGender() {
        if (!radioInputMale.checked && !radioInputFemale.checked) {
            showNotification(submitMessageError, "Please select a gender.");
            return false;
        }

        return true;
    }

    function validateRole() {
        const value = roleOfUser.value;

        if (value === "") {
            showNotification(submitMessageError, "Please select a role.");
            return false;
        }

        return true;
    }

    function validateDepartment() {
        const value = departments.value;
        if (value === "") {
            showNotification(submitMessageError, "Please select a department.");
            return false;

        }
        return true;
    }


    /* Runs all form validation functions before saving. */
    function validateAllFields() {
        return (
            validateEmployeeID() &&
            validateName() &&
            validateNationality() &&
            validateEmail() &&
            validatePhoneNumber() &&
            validateGender() &&
            validateRole() &&
            validateDepartment()
        );
    }

    employeeNameInput.addEventListener("input", validateName);
    employeeInputNationality.addEventListener("input", validateNationality);
    employeeEmailInput.addEventListener("input", validateEmail);
    employeeInputPhoneNumber.addEventListener("input", validatePhoneNumber);
    radioInputMale.addEventListener("change", validateGender);
    radioInputFemale.addEventListener("change", validateGender);
    roleOfUser.addEventListener("change", validateRole);
    departments.addEventListener("change", validateDepartment);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validateAllFields()) {
            return;
        }

        try {
            const database = await ensureDatabase();

            const gender = radioInputMale.checked
                ? radioInputMale.value
                : radioInputFemale.checked
                    ? radioInputFemale.value
                    : "";

            const employeeData = {
                id: employeeIdGenerator.value.trim(),
                name: employeeNameInput.value.trim(),
                email: employeeEmailInput.value.trim().toLowerCase(),
                gender: gender,
                nationality: employeeInputNationality.value.trim(),
                phoneNumber: employeeInputPhoneNumber.value.trim(),
                role: roleOfUser.value,
                department: departments.value,
            };

            const transaction = database.transaction(["employees"], "readwrite");
            const objectStore = transaction.objectStore("employees");
            const addRequest = objectStore.add(employeeData);

            addRequest.onsuccess = () => {
                showNotification(submitMessage, "Employee added successfully!");

                form.reset();

                employeeIdGenerator.readOnly = true;
                employeeIdGenerator.style.cursor = "not-allowed";
            };

            addRequest.onerror = (event) => {
                const error = event.target.error;

                if (error && error.name === "ConstraintError") {
                    showNotification(submitMessageError, "Email or phone number already exists.");
                    return;
                }

                showNotification(
                    submitMessageError,
                    "Could not add employee. " + (error ? error.message : "Unknown error.")
                );
            };
        } catch (error) {
            console.error(error);
            showNotification(
                submitMessageError,
                "Database is not ready. Close other tabs and refresh."
            );
        }
    });
}

/* Shows a temporary notification message on the page. */
function showNotification(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}
