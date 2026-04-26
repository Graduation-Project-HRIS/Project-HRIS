const formSignIn = document.getElementById("formSignIn");

const userIdInput = document.getElementById("userId");
const userPasswordInput = document.getElementById("userPassword");

const idError = document.getElementById("idError");
const passwordError = document.getElementById("passwordError");


const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const togglePasswordButton = document.getElementById("togglePassword");
const passwordToggleText = document.getElementById("passwordToggleText");

togglePasswordButton.addEventListener("click", () => {
    const passwordIsHidden = userPasswordInput.type === "password";

    if (passwordIsHidden) {
        userPasswordInput.type = "text";
        passwordToggleText.textContent = "Hide";
        togglePasswordButton.setAttribute("aria-label", "Hide password");
    } else {
        userPasswordInput.type = "password";
        passwordToggleText.textContent = "Show";
        togglePasswordButton.setAttribute("aria-label", "Show password");
    }
});

function validateId() {
    let rawUserId = userIdInput.value.trim();

    rawUserId = rawUserId.slice(0, 8);
    userIdInput.value = rawUserId;

    if (rawUserId === "") {
        idError.textContent = "";
        userIdInput.style.border = "";
        return false;
    }

    if (/[^0-9]/.test(rawUserId)) {
        idError.textContent = "ID must contain only numbers.";
        userIdInput.style.border = "3.5px solid red";
        return false;
    }

    if (rawUserId.length !== 8) {
        idError.textContent = "ID must be exactly 8 numbers.";
        userIdInput.style.border = "3.5px solid red";
        return false;
    }

    idError.textContent = "";
    userIdInput.style.border = "3.5px solid green";
    return true;
}

userIdInput.addEventListener("input", validateId);

function validatePassword() {
    let userPassword = userPasswordInput.value;

    userPassword = userPassword.slice(0, 6);
    userPasswordInput.value = userPassword;

    if (userPassword === "") {
        passwordError.textContent = "";
        userPasswordInput.style.border = "";
        return false;
    }

    if (/[0-9]/.test(userPassword)) {
        passwordError.textContent = "Password must include characters, not numbers.";
        userPasswordInput.style.border = "3.5px solid red";
        return false;
    }

    if (userPassword.length !== 6) {
        passwordError.textContent = "Password must be exactly 6 characters.";
        userPasswordInput.style.border = "3.5px solid red";
        return false;
    }

    if (!/[A-Z]/.test(userPassword)) {
        passwordError.textContent = "Password must include at least one uppercase letter.";
        userPasswordInput.style.border = "3.5px solid red";
        return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\/[\];'`~+=]/.test(userPassword)) {
        passwordError.textContent = "Password must include at least one special character.";
        userPasswordInput.style.border = "3.5px solid red";
        return false;
    }

    passwordError.textContent = "";
    userPasswordInput.style.border = "3.5px solid green";
    return true;
}

userPasswordInput.addEventListener("input", validatePassword);

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
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = setupDatabase;

        request.onsuccess = (e) => {
            const database = e.target.result;

            Promise.resolve(
                typeof window.seedDefaultEmployees === "function"
                    ? window.seedDefaultEmployees(database)
                    : undefined
            )
                .catch((error) => {
                    console.error("Default employee seed failed:", error);
                })
                .finally(() => {
                    resolve(database);
                });
        };

        request.onerror = (e) => {
            reject(e.target.error);
        };
    });
}

async function findEmployeeById(employeeId) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(["employees"], "readonly");
        const objectStore = transaction.objectStore("employees");
        const getRequest = objectStore.get(employeeId);

        getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
            reject(getRequest.error);
        };
    });
}


formSignIn.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isValidId = validateId();
    const isValidPassword = validatePassword();

    if (!isValidId || !isValidPassword) {
        return;
    }

    try {
        const employeeId = userIdInput.value.trim();
        const employee = await findEmployeeById(employeeId);

        if (!employee) {
            idError.textContent = "Employee ID does not exist please contact HR department .";
            userIdInput.style.border = "3.5px solid red";
            return;
        }

        if (!employee.role) {
            idError.textContent = "This employee does not have a role.";
            userIdInput.style.border = "3.5px solid red";
            return;
        }
        sessionStorage.setItem("currentEmployeeId", String(employee.id));
        localStorage.setItem("currentEmployeeId", String(employee.id));

        console.log("Saved currentEmployeeId:", employee.id);
        window.location.href = "/frontend/html-files/home-html/home.html";
    } catch (error) {
        console.error(error);
        idError.textContent = "Database error. Try again.";
        userIdInput.style.border = "3.5px solid red";
    }
});




