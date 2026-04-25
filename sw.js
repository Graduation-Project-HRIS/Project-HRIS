const CACHE_NAME = 'HRIS-cache-v2';

const FILES_TO_CACHE = [
    // Cache the root and main HTML files
    "/frontend/html-files/index/index.html",
    "/frontend/html-files/home-html/home.html",
    "/frontend/html-files/home-html/profile.html",
    "/frontend/html-files/support-groups/support-groups-index/support-groups-departments.html",
    "/frontend/html-files/support-groups/support-groups-departments/digital-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/hr-and-general-services-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/information-technology-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/legal-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/marketing-and-corporate-communications-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/operations-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-index/sales-revenue-generating-groups-departments.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/treasury-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/retail-banking-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/investment-banking-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/corporate-banking-group.html",
    "/frontend/html-files/executive-functions/executive-functions-index/executive-functions-departments.html",
    "/frontend/html-files/executive-functions/executive-functions-departments/CEO-office.html",
    "/frontend/html-files/executive-functions/executive-functions-departments/secretariat-of-board-of-directors.html",
    "/frontend/html-files/control-groups/control-groups-index/control-groups-departments.html",
    "/frontend/html-files/control-groups/control-groups-departments/compliance-group.html",
    "/frontend/html-files/control-groups/control-groups-departments/internal-audit-group.html",
    "/frontend/html-files/control-groups/control-groups-departments/risk-management-group.html",
    "/frontend/html-files/control-groups/control-groups-departments/shariah-department.html",
    "/frontend/html-files/manager/index/manager-index.html",
    "/frontend/html-files/manager/add-employess/employess-adding.html",
    "/frontend/html-files/manager/edit-employess/employess-edit.html",
    "/frontend/html-files/leave/leave-calendar.html",
    "/frontend/html-files/leave/leave-form.html",
    // Cache the main CSS files
    "/styles/css-files/index/signin.css",
    "/styles/css-files/home-css/home.css",
    "/styles/css-files/home-css/navber.css",
    "/styles/css-files/support-group/digital-group/digital.css",
    "/styles/css-files/support-group/hr-css/hr-form.css",
    "/styles/css-files/profile/profile.css",
    "/styles/css-files/manager/employee-form.css",
    "/styles/css-files/manager/employee-list.css",
    "/styles/css-files/profile/leave-request.css",
    "/styles/css-files/profile/leave-calendar.css",
    // Cache the main JS files
    "/backend/script-files/db/add/add-employess.js",
    "/backend/script-files/db/default/default-employess.js",
    "/backend/script-files/db/edit/edit-employess.js",
    "/backend/script-files/home-js/home.js",
    "/backend/script-files/index/signin.js",
    "/sw.js",
    "/register-unregister-check.js",
    "/backend/script-files/support-group/digital-group/digital.js",
    "/backend/script-files/support-group/hr-group/hr-form.js",
    "/backend/script-files/profile/leave/leave-request.js",
    "/backend/script-files/profile/leave/leave-calendar.js",
    "/backend/script-files/auth/role-ui.js",
    // Cache the images files
    "/images/index-signin/hide-password.png",
    "/images/index-signin/show-password.png",
    "/images/navbar/profile-icons.png"
];

// install: save important files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Assets cached.");
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(err => console.log("Could not cache:.", err))
    );
    self.skipWaiting();
});

// Activate: remove old caches
/*
    This means:
    service worker activates
    old caches are cleaned
    new service worker takes control of current open pages immediately
*/
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim(); // Take control of all current pages now.
});

// fetch: try cache first, then network
self.addEventListener('fetch', (event) => { //handles every request
    event.respondWith(
        caches.match(event.request) //check if requested file is in cache
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .catch(() => {
                        if (event.request.mode === "navigate") {
                            return caches.match("/frontend/html-files/index/index.html");
                        }
                    })
            })
    )
});




