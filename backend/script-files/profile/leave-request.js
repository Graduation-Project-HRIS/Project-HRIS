const employeeIdInput = document.getElementById("employee-id");
const employeeIdError = document.getElementById("employee-id-error");
const submitMessage = document.getElementById("submit-message");

const leaveForm = document.getElementById("leave-form");

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

leaveForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateId()) {
        submitMessage.classList.remove("show");
        return;
        // Error is already shown
    } else {
        submitMessage.textContent = "Request submitted successfully!";
        submitMessage.classList.add("show");

    }
    setTimeout(function () {
        window.location.href = "/frontend/html-files/home-html/profile.html";
        submitMessage.classList.remove("show");
    }, 1000);
});