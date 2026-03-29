const employeeIdInput = document.getElementById("employee-id");
const employeeIdError = document.getElementById("employee-id-error");

const hrForm = document.getElementById("hr-form");

function validateId() {
    let rawUserId = employeeIdInput.value.trim();

    // Limit to 8 characters
    rawUserId = rawUserId.slice(0, 8);
    employeeIdInput.value = rawUserId;

    if (rawUserId === "") {
        employeeIdError.textContent = "";
        employeeIdInput.style.border = "";
        return false;
    } else if (/[^0-9]/.test(rawUserId)) {
        employeeIdError.textContent = "ID must contain only numbers.";
        employeeIdInput.style.border = "2px solid red";
        return false;
    } else if (rawUserId.length !== 8) {
        employeeIdError.textContent = "ID must be exactly 8 digits.";
        employeeIdInput.style.border = "2px solid red";
        return false;
    }

    employeeIdError.textContent = "";
    employeeIdInput.style.border = "2px solid green";
    return true;
}

employeeIdInput.addEventListener("input", validateId);

hrForm.addEventListener("submit", function (e) {
    if (!validateId()) {
        e.preventDefault();
        // Error is already shown
    } else {
        window.location.href = "/frontend/html-files/home-html/home.html";
    }
});

