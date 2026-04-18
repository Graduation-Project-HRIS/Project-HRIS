// =============================================
// Database Initialization
// =============================================
// import defaultEmployeesIfEmpty from "./default/default-employess.js"

let db;

const form = document.getElementById("employeeForm");
const employeeIdGenerator = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeEmailInput = document.getElementById("employeeEmail");
const submitMessage = document.getElementById("submitMessage");
const submitMessageError = document.getElementById("submitMessageError");
const generateIdButton = document.getElementById("generateId");

const request = indexedDB.open("EmployeeDB", 1);

// Handle database open errors
request.onerror = (e) => {
    console.error("IndexedDB error:", e);
};

// Runs only when the DB is created or upgraded
request.onupgradeneeded = (e) => {
    db = e.target.result;

    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};

// Runs when the DB opens successfully
request.onsuccess = (e) => {
    db = e.target.result;
    // defaultEmployeesIfEmpty();
};

// =============================================
// Generate Employee ID
// =============================================
// Generate a random 8-digit ID
function generateEmployeeID() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

generateIdButton.addEventListener("click", () => {
    employeeIdGenerator.value = generateEmployeeID();
    employeeIdGenerator.readOnly = true;
    employeeIdGenerator.style.cursor = "not-allowed";
});

// Generate a unique Employee ID by checking against existing IDs in the database
// function generateUniqueEmployeeID(callback) {
//     if (!db) {
//         showNotification(submitMessageError, "Database is not ready.");
//         return;
//     }

//     function tryID() {
//         const newId = generate8DigitID();
//         const transaction = db.transaction(["employees"], "readonly").objectStore("employees");
//         const getRequest = objectStore.get(newId);

//         getRequest.onsuccess = () => {
//             if (getRequest.result) {
//                 tryID();
//             } else {
//                 callback(newId);
//             }
//         };

//         getRequest.onerror = () => {
//             showNotification(submitMessageError, "Failed to generate unique ID.");
//         };
//     }

//     tryID();
// }

// Event listener for Generate ID button
// generateIdButton.addEventListener("click", () => {
//     generateUniqueEmployeeID((newId) => {
//         employeeIdGenerator.value = newId;
//         employeeIdGenerator.readOnly = true;
//         employeeIdGenerator.style.cursor = "not-allowed";
//     });
// });

// =============================================
// Name Input Validation
// Prevent numbers and symbols while typing
// =============================================

employeeNameInput.addEventListener("input", () => {
    employeeNameInput.value = employeeNameInput.value.replace(/[^A-Za-z\s]/g, "");
});

// =============================================
// Form Submit
// =============================================

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!db) {
            showNotification(submitMessageError, "Error: Database is not ready.");
            return;
        }

        const employeeData = {
            id: employeeIdGenerator.value.trim(),
            name: employeeNameInput.value.trim(),
            email: employeeEmailInput.value.trim()
        };

        if (!employeeData.id || !employeeData.name || !employeeData.email) {
            showNotification(submitMessageError, "Error: Please fill in all fields.");
            return;
        }

        const transaction = db.transaction(["employees"], "readwrite");
        const objectStore = transaction.objectStore("employees");
        const addRequest = objectStore.add(employeeData);

        addRequest.onsuccess = () => {
            showNotification(submitMessage, "Employee added successfully!");
            form.reset();
        };

        addRequest.onerror = (event) => {
            const error = event.target.error;
            showNotification(
                submitMessageError,
                "Could not add Employee. " + (error ? error.message : "Unknown error.")
            );
        };
    });
}

// =============================================
// Notification Function
// =============================================

function showNotification(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}