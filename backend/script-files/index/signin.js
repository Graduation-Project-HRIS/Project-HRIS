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


function validateId() {
    let rawUserId = userIdInput.value.trim();

    if (!idPattern.test(rawUserId)) {
        idError.textContent = "ID must contain only numbers.";
        userIdInput.style.border = "3.5px solid red";
        return false;
    }
    if (rawUserId.length !== 8) {
        idError.textContent = "ID must be exactly 8 numbers.";
        userIdInput.style.border = "3.5px solid red";
        return false;
    }
    userIdInput.value = rawUserId.slice(0, 8);
    idError.textContent = "";
    userIdInput.style.border = "3.5px solid green";
    return true;
}

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


function validatePassword() {
    let userPassword = userPasswordInput.value;

    userPassword = userPassword.slice(0, 6);
    userPasswordInput.value = userPassword;

    // if (!passwordPattern.test(userPassword)) {
    //     passwordError.textContent = "Password must contain characters not nu";
    //     userPasswordInput.style.border = "3.5px solid red";
    //     return false;
    // }

    if (userPassword.length < 6) {
        passwordError.textContent = "Password must 6 characters, 1 uppercase, 1 special character";
        return false;
    }
    if (!/[A-Z]/.test(userPassword)) {
        passwordError.textContent = "Password must include at least one uppercase letter.";
        return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\/[\];'`~+=]/.test(userPassword)) {
        passwordError.textContent = "Password must include at least one special character.";
        return false;
    }
    passwordError.textContent = "";
    userPasswordInput.style.border = "3.5px solid green";
    return true;
}

userIdInput.addEventListener('input', validateId);
userPasswordInput.addEventListener('input', validatePassword);

formSignIn.addEventListener("submit", (e) => {
    e.preventDefault();
    const isValidId = validateId();
    const isValidPassword = validatePassword();

    if (isValidId && isValidPassword) {
        window.location.href = "../../../frontend/html-files/home.html";
    }
})
