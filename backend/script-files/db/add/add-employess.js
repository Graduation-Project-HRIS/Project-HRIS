let db = null;
let dbReadyPromise = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 1;

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


setFormState(false);
dbReadyPromise = openDatabase();

function setFormState(isReady) {
    if (generateIdButton) generateIdButton.disabled = !isReady;
    if (saveButton) saveButton.disabled = !isReady;
}

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

        request.onupgradeneeded = (e) => {
            const database = e.target.result;

            if (!database.objectStoreNames.contains("employees")) {
                const employeeStore = database.createObjectStore("employees", { keyPath: "id" });
                employeeStore.createIndex("name", "name", { unique: false });
                employeeStore.createIndex("email", "email", { unique: true });
                employeeStore.createIndex("phoneNumber", "phoneNumber", { unique: true });
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
                    submitMessageError,
                    "Database version changed in another tab. Refresh this page."
                );
                setFormState(false);
            };

            setFormState(true);
            console.log("Database opened successfully.");
            resolve(db);
        };
    });
}

async function ensureDatabase() {
    if (db) return db;
    if (!dbReadyPromise) dbReadyPromise = openDatabase();
    return await dbReadyPromise;
}

function generateEmployeeID() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

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

    function validateEmployeeID() {
        const value = employeeIdGenerator.value.trim();
        if (value === "") {
            showNotification(submitMessageError, "Please generate an employee ID.")
            return false;
        }
        return true;
    }

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

    function validateGender() {
        if (!radioInputMale.checked && !radioInputFemale.checked) {
            showNotification(submitMessageError, "Please select a gender.");
            return false;
        }

        return true;
    }

    function validateAllFields() {
        return (
            validateEmployeeID() &&
            validateName() &&
            validateNationality() &&
            validateEmail() &&
            validatePhoneNumber() &&
            validateGender()
        );
    }

    employeeNameInput.addEventListener("input", validateName);
    employeeInputNationality.addEventListener("input", validateNationality);
    employeeEmailInput.addEventListener("input", validateEmail);
    employeeInputPhoneNumber.addEventListener("input", validatePhoneNumber);
    radioInputMale.addEventListener("change", validateGender);
    radioInputFemale.addEventListener("change", validateGender);

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

function showNotification(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}