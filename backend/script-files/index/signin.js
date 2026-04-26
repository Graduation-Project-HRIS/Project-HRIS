const formSignIn = document.getElementById("formSignIn");

const userIdInput = document.getElementById("userId");
const userPasswordInput = document.getElementById("userPassword");

const idError = document.getElementById("idError");
const passwordError = document.getElementById("passwordError");


const DB_NAME = "EmployeeDB";
const DB_VERSION = 1;

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

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

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




