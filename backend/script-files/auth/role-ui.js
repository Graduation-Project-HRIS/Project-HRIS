const AUTH_DB_NAME = "EmployeeDB";
const AUTH_DB_VERSION = 1;

const LOGIN_PAGE = "/frontend/html-files/index/index.html";
const HOME_PAGE = "/frontend/html-files/home-html/home.html";

function openAuthDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(AUTH_DB_NAME, AUTH_DB_VERSION);

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
            resolve(e.target.result);
        };

        request.onerror = (e) => {
            reject(e.target.error);
        };
    });
}

async function getCurrentUser() {
    const currentEmployeeId = sessionStorage.getItem("currentEmployeeId");

    if (!currentEmployeeId) {
        return null;
    }

    const database = await openAuthDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(["employees"], "readonly");
        const objectStore = transaction.objectStore("employees");
        const getRequest = objectStore.get(currentEmployeeId);

        getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
            reject(getRequest.error);
        };
    });
}

function applyRoleBasedUI(currentUser) {
    const roleElements = document.querySelectorAll("[data-roles]");
    const userRole = String(currentUser.role || "").trim().toLowerCase();

    roleElements.forEach((element) => {
        const allowedRoles = element.dataset.roles
            .split(",")
            .map(role => role.trim().toLowerCase());

        if (allowedRoles.includes(userRole)) {
            element.hidden = false;
            element.style.display = "";
        } else {
            element.hidden = true;
            element.style.display = "none";
        }
    });
}

function protectPage(currentUser) {
    const body = document.body;

    const isProtectedPage = body.dataset.protectedPage === "true";
    const allowedRolesText = body.dataset.allowedRoles;

    if (!isProtectedPage || !allowedRolesText) {
        return;
    }

    const allowedRoles = allowedRolesText
        .split(",")
        .map(role => role.trim().toLowerCase());

    const userRole = String(currentUser.role || "").trim().toLowerCase();

    if (!allowedRoles.includes(userRole)) {
        window.location.href = HOME_PAGE;
    }
}

function formatValue(value) {
    if (!value) return "Not available";

    return String(value)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, firstLetter => firstLetter.toUpperCase());
}

function fillProfileData(currentUser) {
    const profileWelcome = document.getElementById("profileWelcome");
    const profileName = document.getElementById("profileName");
    const profileId = document.getElementById("profileId");
    const profileRole = document.getElementById("profileRole");
    const profileDepartment = document.getElementById("profileDepartment");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhoneNumber = document.getElementById("profilePhoneNumber");

    if (profileWelcome) profileWelcome.textContent = `Welcome ${currentUser.name || ""}`;
    if (profileName) profileName.textContent = currentUser.name || "Not available";
    if (profileId) profileId.textContent = currentUser.id || "Not available";
    if (profileRole) profileRole.textContent = formatValue(currentUser.role);
    if (profileDepartment) profileDepartment.textContent = formatValue(currentUser.department);
    if (profileEmail) profileEmail.textContent = currentUser.email || "Not available";
    if (profilePhoneNumber) profilePhoneNumber.textContent = currentUser.phoneNumber || "Not available";
}

async function initRoleBasedUI() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            window.location.href = LOGIN_PAGE;
            return;
        }

        applyRoleBasedUI(currentUser);
        protectPage(currentUser);
        fillProfileData(currentUser);

        console.log("Logged in user:", currentUser);
    } catch (error) {
        console.error("Role UI error:", error);
        window.location.href = LOGIN_PAGE;
    }
}

document.addEventListener("DOMContentLoaded", initRoleBasedUI);