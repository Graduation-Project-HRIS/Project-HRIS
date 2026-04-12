// =============================================
// Database Initialization
// =============================================

let db;

const form = document.getElementById("employeeForm");
const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeEmailInput = document.getElementById("employeeEmail");
const submitMessage = document.getElementById("submitMessage");
const submitMessageError = document.getElementById("submitMessageError");
const saveButton = document.getElementById("saveButton");

const request = indexedDB.open("EmployeeDB", 1);
// Handle database open errors
request.onerror = (e) => {
    console.error("IndexedDB error:", e);
};
// Runs only when the DB is created or upgraded — sets up the object store and indexes
request.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};
// Runs when the DB opens successfully — load the employee list
request.onsuccess = (e) => {
    db = e.target.result;
};
// Generate a random Employee ID in the format of 8 digits "ID XXXXXXXX"
function getEmployeeID() {
    return "ID:" + " " + Math.floor(10000000 + Math.random() * 90000000).toString();
}
employeeIdInput.value = getEmployeeID();


// before submit, validate the employee ID input
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!db) {
            showNotification(submitMessageError, "Error: Database is not ready.");
            return;
        }

        const employeeData = {
            id: employeeIdInput.value.trim(),
            name: employeeNameInput.value.trim(),
            email: employeeEmailInput.value.trim()
        };

        const transaction = db.transaction(["employees"], "readwrite");
        const objectStore = transaction.objectStore("employees");
        const addRequest = objectStore.add(employeeData);

        addRequest.onsuccess = () => {
            showNotification(submitMessage, "Employee added successfully!");
            form.reset();
        };

        addRequest.onerror = () => {
            showNotification(submitMessageError, "Error: Could not add Employee. ID or Email may already exist.");
        };
    });
}

// function to display success or error messages
function showNotification(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 2000);
}
