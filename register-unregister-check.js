const CURRENT_EMPLOYEE_ID_KEY = "currentEmployeeId";
const LOGIN_PAGE = "/frontend/html-files/index/index.html";

function clearStoredAuth() {
    sessionStorage.removeItem(CURRENT_EMPLOYEE_ID_KEY);
    localStorage.removeItem(CURRENT_EMPLOYEE_ID_KEY);
}

function setupLogoutLinks() {
    const logoutLinks = document.querySelectorAll(`a[href="${LOGIN_PAGE}"]`);

    logoutLinks.forEach((link) => {
        link.addEventListener("click", clearStoredAuth);
    });
}

window.addEventListener("load", () => {
    setupLogoutLinks();

    if (!("serviceWorker" in navigator)) {
        return;
    }

    if (window.location.protocol === "file:") {
        console.warn("Service workers require localhost or HTTPS. Open this project through a local web server.");
        return;
    }

    navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
            console.log("Service Worker registered:", registration.scope);
        })
        .catch((error) => {
            console.log("Service Worker registration failed:", error);
        });
});
