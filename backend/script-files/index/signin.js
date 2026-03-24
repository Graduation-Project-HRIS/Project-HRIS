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
/* 

So this part means:
the hidden image (icon) is always shown
the show image (icon) is hidden 
user type the function works one the hidden image (icon) like a click 
user click the hidden image (icon) , the text shows and the hidden image (icon ) changes to the show image (icon)   


*/
function togglePasswordVisibility() {
    if (userPasswordInput.type === "password"){
        hidePasswordIcon.style.display = "block";
        userPasswordInput.type = "text";
    } else {
    }
}

togglePasswordButton.addEventListener("click", togglePasswordVisibility);

function validatePassword() {
    let userPassword = userPasswordInput.value;

    userPassword = userPassword.slice(0, 6);
    userPasswordInput.value = userPassword;

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
