const CACHE_NAME = 'HRIS-cache-v1';

const FILES_TO_CACHE = [
    // Cached HTML files
    "/frontend/html-files/control-groups/control-groups-departments/compliance-group.html",
    "/frontend/html-files/control-groups/control-groups-departments/internal-audit-group.html",
    "/frontend/html-files/control-groups/control-groups-departments/risk-management-group.html",
    "/frontend/html-files/control-groups/control-groups-departments/shariah-department.html",
    "/frontend/html-files/control-groups/control-groups-index/control-groups-departments.html",
    "/frontend/html-files/executive-functions/executive-functions-departments/CEO-office.html",
    "/frontend/html-files/executive-functions/executive-functions-departments/secretariat-of-board-of-directors.html",
    "/frontend/html-files/executive-functions/executive-functions-index/executive-functions-departments.html",
    "/frontend/html-files/home-html/home.html",
    "/frontend/html-files/home-html/profile.html",
    "/frontend/html-files/index/index.html",
    "/frontend/html-files/leave/leave-calendar.html",
    "/frontend/html-files/leave/leave-form.html",
    "/frontend/html-files/manager/add-employess/employess-adding.html",
    "/frontend/html-files/manager/edit-employess/employess-edit.html",
    "/frontend/html-files/manager/index/manager-index.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/corporate-banking-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/investment-banking-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/retail-banking-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-departments/treasury-group.html",
    "/frontend/html-files/sales-revenue-generating-groups/sales-revenue-generating-groups-index/sales-revenue-generating-groups-departments.html",
    "/frontend/html-files/support-groups/support-groups-departments/digital-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/hr-and-general-services-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/information-technology-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/legal-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/marketing-and-corporate-communications-group.html",
    "/frontend/html-files/support-groups/support-groups-departments/operations-group.html",
    "/frontend/html-files/support-groups/support-groups-index/support-groups-departments.html",
    "/frontend/html-files/manager/hr-request/hr-requests.html",
    "/frontend/html-files/manager/records/db-records.html",

    // Cached JS files
    "/backend/script-files/auth/role-ui.js",
    "/backend/script-files/db/add/add-employess.js",
    "/backend/script-files/db/edit/edit-employess.js",
    "/backend/script-files/home-js/home.js",
    "/backend/script-files/index/signin.js",
    "/backend/script-files/profile/leave/leave-calendar.js",
    "/backend/script-files/profile/leave/leave-request.js",
    "/backend/script-files/support-group/digital-group/digital.js",
    "/backend/script-files/support-group/hr-group/hr-form.js",
    "/register-unregister-check.js",
    "/backend/script-files/db/records/db-records.js",
    "/backend/script-files/db/records/fetch-data.js",

    // Cached CSS files
    "/styles/css-files/home-css/home.css",
    "/styles/css-files/home-css/navber.css",
    "/styles/css-files/index/signin.css",
    "/styles/css-files/manager/employee-form.css",
    "/styles/css-files/manager/employee-list.css",
    "/styles/css-files/profile/leave-calendar.css",
    "/styles/css-files/profile/leave-request.css",
    "/styles/css-files/profile/profile.css",
    "/styles/css-files/support-group/digital-group/digital.css",
    "/styles/css-files/support-group/hr-css/hr-form.css",
    "/styles/css-files/manager/hr-requests.css",

    // Cached Image files
    "/images/index-signin/hide-password.png",
    "/images/index-signin/show-password.png",
    "/images/navbar/profile-icons.png",

    // Cached JSON file
    "/backend/script-files/db/json/records.json"
];

// install: save important files
self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);

        for (const file of FILES_TO_CACHE) {
            try {
                const response = await fetch(file);

                if (!response.ok) {
                    console.error("NOT FOUND:", file, response.status);
                    continue;
                }

                await cache.put(file, response.clone());
                console.log("CACHED:", file);
            } catch (error) {
                console.error("FAILED TO CACHE:", file, error);
            }
        }

        await self.skipWaiting();
    })());
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
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }

                        return Promise.resolve();
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// fetch: try cache first, then network
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const url = new URL(event.request.url);

        let cachedResponse = await cache.match(event.request);

        if (!cachedResponse) {
            cachedResponse = await cache.match(url.pathname);
        }

        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            return await fetch(event.request);
        } catch (error) {
            if (event.request.mode === "navigate") {
                const fallbackPage = await cache.match("/frontend/html-files/index/index.html");

                if (fallbackPage) {
                    return fallbackPage;
                }

                return new Response("<h1>Offline page not found in cache.</h1>", {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html"
                    }
                });
            }

            return new Response("Offline and file not cached.", {
                status: 504,
                statusText: "Offline"
            });
        }
    })());
});



