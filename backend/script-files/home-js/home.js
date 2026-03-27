
document.addEventListener("DOMContentLoaded", function () {
    trackPreviousPage();
    pageLocation();
    setupBackButton();
});

function trackPreviousPage() {
    const currentPage = window.location.pathname;

    const lastPage = sessionStorage.getItem("currentPage");
    if (lastPage && lastPage !== currentPage) {
        sessionStorage.setItem("previousPage", lastPage);
    }

    sessionStorage.setItem("currentPage", currentPage);
}

function pageLocation() {
    const locationBox = document.getElementById("page-location");
    if (!locationBox) return;

    let fileName = window.location.pathname.split("/").pop();

    if (!fileName) {
        fileName = "home.html";
    }

    let pageName = fileName.replace(".html", "");
    pageName = pageName.replace(/[-_]/g, " ");
    pageName = pageName.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });

    locationBox.textContent = "Current Page: " + pageName;
}

function setupBackButton() {
    const backButton = document.getElementById("backButton");
    if (!backButton) return;

    const currentPage = window.location.pathname.split("/").pop().toLowerCase();

    if (currentPage === "home.html" || currentPage === "index.html" || currentPage === "") {
        backButton.style.display = "none";
        return;
    }

    backButton.addEventListener("click", function () {
        const previousPage = sessionStorage.getItem("previousPage");

        if (!previousPage) {
            alert("No previous page found.");
            return;
        }

        const previousFile = previousPage.split("/").pop().toLowerCase();

        if (previousFile === "home.html" || previousFile === "index.html") {
            alert("You cannot go back to the Home page using this button.");
            return;
        }

        window.location.href = previousPage;
    });
}
