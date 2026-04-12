
const formSignIn = document.getElementById("formSignIn");

const userIdInput = document.getElementById("userId");
const userPasswordInput = document.getElementById("userPassword");

const idError = document.getElementById("idError");
const passwordError = document.getElementById("passwordError");

const togglePasswordButton = document.getElementById("togglePassword");
const showPasswordIcon = document.getElementById("showPasswordIcon");
const hidePasswordIcon = document.getElementById("hidePasswordIcon");

const idPattern = /^\d{8}$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\/[\];'`~+=]).{6}$/;


togglePasswordButton.addEventListener("click", () => {
    if (userPasswordInput.type === "password") {
        userPasswordInput.type = "text";
        hidePasswordIcon.style.display = "none";
        showPasswordIcon.style.display = "block";
    } else {
        userPasswordInput.type = "password";
        showPasswordIcon.style.display = "none";
        hidePasswordIcon.style.display = "block";
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
    else if (/[^0-9]/.test(rawUserId)) {
        idError.textContent = "ID must contain only numbers, not characters.";
        userIdInput.style.border = "3.5px solid red";
        return false;
    }
    else if (rawUserId.length < 8) {
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
    else if (/[0-9]/.test(userPassword)) {
        passwordError.textContent = "Password must include character not  numbers.";
        userPasswordInput.style.border = "3.5px solid red";
        return false;
    }
    else if (userPassword.length < 2) {
        passwordError.textContent = "Password must 6 characters, 1 uppercase, 1 special character";
        return false;
    }
    else if (!/[A-Z]/.test(userPassword)) {
        passwordError.textContent = "Password must include at least one uppercase letter.";
        return false;
    }
    else if (!/[!@#$%^&*(),.?":{}|<>_\-\\/[\];'`~+=]/.test(userPassword)) {
        passwordError.textContent = "Password must include at least one special character.";
        return false;
    }
    else if (userPassword.length !== 6) {
        passwordError.textContent = "Password must be exactly 6 characters.";
        return false;
    }
    passwordError.textContent = "";
    userPasswordInput.style.border = "3.5px solid green";
    return true;
}

userPasswordInput.addEventListener('input', validatePassword);

formSignIn.addEventListener("submit", (e) => {
    e.preventDefault();
    const isValidId = validateId();
    const isValidPassword = validatePassword();

    if (isValidId && isValidPassword) {
        window.location.href = "/frontend/html-files/home-html/home.html";
    }
})
