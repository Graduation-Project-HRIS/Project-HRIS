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

const request = indexedDB.open("EmployeeDB", 1);

request.onerror = (e) => {
    console.error("IndexedDB error:", e);
};

request.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};

request.onsuccess = (e) => {
    db = e.target.result;
};

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
            showNotification(submitMessageError, "Error: Could not add employee. ID or Email may already exist.");
        };
    });
}

function showNotification(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 2000);
}
