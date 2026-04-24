// This variable will hold the opened IndexedDB database object after success.
let db = null;

// This stores the promise of opening the database,
// so we do not try to open it many times at once.
let dbReadyPromise = null;

// Database name in the browser storage.
const DB_NAME = "EmployeeDB";

// Database version.
// If you change this number later, onupgradeneeded will run again.
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


// Disable form buttons at first until database is ready.
setFormState(false);

// Start opening the database as soon as the page loads.
dbReadyPromise = openDatabase();

function setFormState(isReady) {
    // If database is ready, enable the Generate ID button.
    // If not ready, disable it.
    if (generateIdButton) generateIdButton.disabled = !isReady;

    // If database is ready, enable the Save button.
    // If not ready, disable it.
    if (saveButton) saveButton.disabled = !isReady;
}

function openDatabase() {
    // Return a Promise because opening IndexedDB is asynchronous.
    return new Promise((resolve, reject) => {
        // Open the database with the given name and version.
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // This runs if opening the database fails.
        request.onerror = (e) => {
            console.error("IndexedDB error:", e.target.error);
            showNotification(submitMessageError, "Failed to open database.");
            setFormState(false);
            reject(e.target.error);
        };

        // This runs if the database is blocked,
        // usually because another tab is still using an older version.
        request.onblocked = () => {
            showNotification(
                submitMessageError,
                "Database is blocked. Close other open tabs of this project, then refresh."
            );
            setFormState(false);
        };

        // This runs when the database is created for the first time
        // or when DB_VERSION changes.
        request.onupgradeneeded = (e) => {
            const database = e.target.result;

            // Create the employees object store only if it does not exist.
            if (!database.objectStoreNames.contains("employees")) {
                // Create store with "id" as the main key.
                const employeeStore = database.createObjectStore("employees", { keyPath: "id" });

                // Create index for employee name.
                employeeStore.createIndex("name", "name", { unique: false });

                // Create index for email and do not allow duplicates.
                employeeStore.createIndex("email", "email", { unique: true });

                // Create index for phone number and do not allow duplicates.
                employeeStore.createIndex("phoneNumber", "phoneNumber", { unique: true });
            }

            // Create the leaveRequests object store only if it does not exist.
            if (!database.objectStoreNames.contains("leaveRequests")) {
                // Create store with "leaveId" as the main key.
                const leaveStore = database.createObjectStore("leaveRequests", { keyPath: "leaveId" });

                // Create index for employee ID.
                leaveStore.createIndex("employeeId", "employeeId", { unique: false });

                // Create index for employee name.
                leaveStore.createIndex("name", "name", { unique: false });

                // Create index for leave type.
                leaveStore.createIndex("leaveType", "leaveType", { unique: false });

                // Create index for leave date.
                leaveStore.createIndex("leaveDate", "leaveDate", { unique: false });
            }
        };

        // This runs when the database opens successfully.
        request.onsuccess = (e) => {
            // Save the opened database into the global variable.
            db = e.target.result;

            // If another tab changes the database version,
            // close this connection and ask the user to refresh.
            db.onversionchange = () => {
                db.close();
                showNotification(
                    submitMessageError,
                    "Database version changed in another tab. Refresh this page."
                );
                setFormState(false);
            };

            // Enable the buttons because the database is now ready.
            setFormState(true);

            console.log("Database opened successfully.");

            // Resolve the promise with the database object.
            resolve(db);
        };
    });
}

async function ensureDatabase() {
    // If the database is already opened, return it immediately.
    if (db) return db;

    // If the opening process has not started, start it.
    if (!dbReadyPromise) dbReadyPromise = openDatabase();

    // Wait until the database is ready, then return it.
    return await dbReadyPromise;
}

function generateEmployeeID() {
    // Generate a random 8-digit number and convert it to string.
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function generateUniqueEmployeeID() {
    // Make sure database is ready first.
    const database = await ensureDatabase();

    // Return a Promise because checking IndexedDB is asynchronous.
    return new Promise((resolve, reject) => {
        function tryID() {
            // Generate a random ID candidate.
            const newId = generateEmployeeID();

            // Open a readonly transaction on employees store.
            const transaction = database.transaction(["employees"], "readonly");
            const objectStore = transaction.objectStore("employees");

            // Check if this ID already exists.
            const getRequest = objectStore.get(newId);

            getRequest.onsuccess = () => {
                // If the ID already exists, try again.
                if (getRequest.result) {
                    tryID();
                } else {
                    // If it does not exist, return this unique ID.
                    resolve(newId);
                }
            };

            getRequest.onerror = () => {
                reject(new Error("Failed to generate unique ID."));
            };
        }

        // Start the first ID attempt.
        tryID();
    });
}

if (generateIdButton) {
    // When the Generate ID button is clicked:
    generateIdButton.addEventListener("click", async () => {
        try {
            // Generate a unique employee ID.
            const newId = await generateUniqueEmployeeID();

            // Put the generated ID into the input field.
            employeeIdGenerator.value = newId;

            // Make the field read-only so the user cannot change it manually.
            employeeIdGenerator.readOnly = true;

            // Change the cursor style to show it is not editable.
            employeeIdGenerator.style.cursor = "not-allowed";
        } catch (error) {
            console.error(error);
            showNotification(submitMessageError, error.message || "Failed to generate employee ID.");
        }
    });
}

if (employeeNameInput) {
    // While typing in the name input,
    // remove anything that is not a letter or space.
    employeeNameInput.addEventListener("input", () => {
        employeeNameInput.value = employeeNameInput.value.replace(/[^A-Za-z\s]/g, "");
    });
}

if (form) {
    function validateEmployeeID() {
        // Get the employee ID value without extra spaces.
        const value = employeeIdGenerator.value.trim();

        // If empty, show error.
        if (value === "") {
            showNotification(submitMessageError, "Please generate an employee ID.")
            return false;
        }

        // If valid, return true.
        return true;
    }

    function validateName() {
        // Get the name value without extra spaces.
        const value = employeeNameInput.value.trim();

        // Check if the name is empty.
        if (value === "") {
            showNotification(submitMessageError, "Name is required.");
            return false;
        }

        // Check if the name contains only letters and spaces.
        if (!/^[A-Za-z\s]+$/.test(value)) {
            showNotification(submitMessageError, "Name must contain letters only.");
            return false;
        }

        return true;
    }

    function validateNationality() {
        // Get nationality value without extra spaces.
        const value = employeeInputNationality.value.trim();

        // Check if nationality is empty.
        if (value === "") {
            showNotification(submitMessageError, "Nationality is required.");
            return false;
        }

        // Check if nationality contains only letters and spaces.
        if (!/^[A-Za-z\s]+$/.test(value)) {
            showNotification(submitMessageError, "Nationality must contain letters only.");
            return false;
        }

        return true;
    }

    function validateEmail() {
        // Get email value, trim spaces, and convert to lowercase.
        const value = employeeEmailInput.value.trim().toLowerCase();

        // Check if email is empty.
        if (value === "") {
            showNotification(submitMessageError, "Email is required.");
            return false;
        }

        // Check basic email format.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showNotification(submitMessageError, "Please enter a valid email format.");
            return false;
        }

        return true;
    }

    function validatePhoneNumber() {
        // Get phone number value without extra spaces.
        const value = employeeInputPhoneNumber.value.trim();

        // Check if phone number is empty.
        if (value === "") {
            showNotification(submitMessageError, "Number is required.");
            return false;
        }

        // Check if phone number is exactly 8 digits.
        if (!/^\d{8}$/.test(value)) {
            showNotification(submitMessageError, "Number must be exactly 8 digits.");
            return false;
        }

        return true;
    }

    function validateGender() {
        // Check that at least one gender radio button is selected.
        if (!radioInputMale.checked && !radioInputFemale.checked) {
            showNotification(submitMessageError, "Please select a gender.");
            return false;
        }

        return true;
    }

    function validateAllFields() {
        // Run all validation functions.
        // If all return true, the form is valid.
        return (
            validateEmployeeID() &&
            validateName() &&
            validateNationality() &&
            validateEmail() &&
            validatePhoneNumber() &&
            validateGender()
        );
    }

    // Run validation while the user types or changes input.
    employeeNameInput.addEventListener("input", validateName);
    employeeInputNationality.addEventListener("input", validateNationality);
    employeeEmailInput.addEventListener("input", validateEmail);
    employeeInputPhoneNumber.addEventListener("input", validatePhoneNumber);
    radioInputMale.addEventListener("change", validateGender);
    radioInputFemale.addEventListener("change", validateGender);

    // When the form is submitted:
    form.addEventListener("submit", async (e) => {
        // Prevent page reload.
        e.preventDefault();

        // Stop here if any field is invalid.
        if (!validateAllFields()) {
            return;
        }

        try {
            // Make sure the database is ready.
            const database = await ensureDatabase();

            // Get the selected gender value.
            const gender = radioInputMale.checked
                ? radioInputMale.value
                : radioInputFemale.checked
                    ? radioInputFemale.value
                    : "";

            // Build the employee object to store in IndexedDB.
            const employeeData = {
                id: employeeIdGenerator.value.trim(),
                name: employeeNameInput.value.trim(),
                email: employeeEmailInput.value.trim().toLowerCase(),
                gender: gender,
                nationality: employeeInputNationality.value.trim(),
                phoneNumber: employeeInputPhoneNumber.value.trim(),
            };

            // Open a readwrite transaction because we are adding data.
            const transaction = database.transaction(["employees"], "readwrite");
            const objectStore = transaction.objectStore("employees");

            // Add the employee object into the store.
            const addRequest = objectStore.add(employeeData);

            addRequest.onsuccess = () => {
                // Show success message.
                showNotification(submitMessage, "Employee added successfully!");

                // Clear the form fields.
                form.reset();

                // Keep employee ID field read-only after reset.
                employeeIdGenerator.readOnly = true;

                // Keep the disabled-style cursor.
                employeeIdGenerator.style.cursor = "not-allowed";
            };

            addRequest.onerror = (event) => {
                const error = event.target.error;

                // If email or phone number already exists,
                // unique index will cause a ConstraintError.
                if (error && error.name === "ConstraintError") {
                    showNotification(submitMessageError, "Email or phone number already exists.");
                    return;
                }

                // Show any other IndexedDB add error.
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
    // If the notification element does not exist, stop.
    if (!element) return;

    // Put the message text inside the notification box.
    element.textContent = message;

    // Add the "show" class so it becomes visible.
    element.classList.add("show");

    // After 3 seconds, hide the notification again.
    setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}