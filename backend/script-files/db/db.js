let db;
// Get HTML elements
const form = document.getElementById("employeeForm");
const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeEmailInput = document.getElementById("employeeEmail");
const employeeTableBody = document.getElementById("employeeTableBody");
const message = document.getElementById("message");
const saveButton = document.getElementById("saveButton");
const editButton = document.getElementById("editButton");
const submitMessage = document.getElementById("submitMessage");
const submitMessageError = document.getElementById("submitMessageError");
const updateEmployee = document.getElementById("updateEmployee");


// Open or create database
const request = indexedDB.open("EmployeeDB", 1);
// Create object store and indexes
request.onupgradeneeded = function (event) {
    db = event.target.result;

    const objectStore = db.createObjectStore("employees", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};
// Handle database open success
request.onsuccess = function (event) {
    db = event.target.result;
    showEmployees();
};
// Handle database open error
request.onerror = function () {
    message.textContent = "Database error.";
};

// Save new employee
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const employeesData = ({
        id: employeeIdInput.value.trim(),
        name: employeeNameInput.value.trim(),
        email: employeeEmailInput.value.trim()
    });

    const transaction = db.transaction(["employees"], "readwrite");
    const objectStore = transaction.objectStore("employees");
    const addRequest = objectStore.add(employeesData);
    addRequest.onsuccess = () => {
        submitMessage.textContent = "Employee has been added successfully!";
        submitMessage.classList.add("show");
        setTimeout(() => {
            submitMessage.classList.remove("show");
        }, 2000);
        form.reset();
        showEmployees();
    };

    addRequest.onerror = function () {
        submitMessageError.textContent = "Error when adding employee.";
        submitMessageError.classList.add("show");
        setTimeout(() => {
            submitMessageError.classList.remove("show");
        }, 2000);
    };


});

// Show all employees
function showEmployees() {
    employeeTableBody.innerHTML = "";

    const transaction = db.transaction(["employees"], "readonly");
    const objectStore = transaction.objectStore("employees");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = function () {
        const employees = getAllRequest.result;

        employees.forEach(function (employee) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>
                    <button class="action-btn"  onclick="editEmployee('${employee.id}')">Edit</button>
                    <button class="action-btn"  onclick="deleteEmployee('${employee.id}')">Delete</button>
                </td>
            `;

            employeeTableBody.appendChild(row);
        });
    };
}

// Edit employee: get one employee and put values in form
function editEmployee(id) {
    const transaction = db.transaction(["employees"], "readonly");
    const objectStore = transaction.objectStore("employees");
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = function () {
        const employee = getRequest.result;

        if (!employee) {
            message.textContent = "Employee not found.";
            return;
        }

        employeeIdInput.value = employee.id;
        employeeNameInput.value = employee.name;
        employeeEmailInput.value = employee.email;

        employeeIdInput.disabled = true;
        saveButton.style.display = "none";
        editButton.style.display = "inline-block";

    };
}

// Update employee
editButton.addEventListener("click", function () {
    const employee = {
        id: employeeIdInput.value.trim(),
        name: employeeNameInput.value.trim(),
        email: employeeEmailInput.value.trim()
    };

    const transaction = db.transaction(["employees"], "readwrite");
    const objectStore = transaction.objectStore("employees");
    const updateRequest = objectStore.put(employee);

    updateRequest.onsuccess = function () {
        updateEmployee.textContent = "Updated employee successfully!";
        updateEmployee.classList.add("show");
        setTimeout(function () {
            updateEmployee.classList.remove("show");
        }, 2000);
        resetForm();
        showEmployees();
    };

    updateRequest.onerror = function () {
        submitMessageError.textContent = "Error when editing employee.";
        submitMessageError.classList.add("show");
        setTimeout(() => {
            submitMessageError.classList.remove("show");
        }, 2000);
    };
});

// Delete employee
function deleteEmployee(id) {
    const transaction = db.transaction(["employees"], "readwrite");
    const objectStore = transaction.objectStore("employees");
    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = function () {
        showEmployees();
    };

    deleteRequest.onerror = function () {
    };
}

// Reset form after update
function resetForm() {
    form.reset();
    employeeIdInput.disabled = false;
    saveButton.style.display = "inline-block";
    editButton.style.display = "none";
    submitMessage.textContent = "";

}