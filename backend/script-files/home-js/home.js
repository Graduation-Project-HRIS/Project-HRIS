
document.addEventListener("DOMContentLoaded", function () {
    trackPageHistory();
    setupBackButton();
});

function getCurrentLocation() {
    return window.location.origin + window.location.pathname + window.location.search + window.location.hash;
}

function trackPageHistory() {
    const current = getCurrentLocation();
    const history = JSON.parse(sessionStorage.getItem("pageHistory") || "[]");

    if (!history.length || history[history.length - 1] !== current) {
        history.push(current);
        if (history.length > 50) history.shift();
        sessionStorage.setItem("pageHistory", JSON.stringify(history));
    }
}

function setupBackButton() {
    const backButton = document.getElementById("backButton");
    if (!backButton) return;

    backButton.addEventListener("click", function () {
        const history = JSON.parse(sessionStorage.getItem("pageHistory") || "[]");

        if (history.length <= 1) {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            alert("No previous page found.");
            return;
        }

        history.pop(); // remove current
        const previous = history.pop(); // get previous

        if (!previous) {
            alert("No previous page found.");
            return;
        }

        history.push(previous);
        sessionStorage.setItem("pageHistory", JSON.stringify(history));

        window.location.href = previous;
    });
}

