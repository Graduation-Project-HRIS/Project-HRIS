// let db = null;
// let currentDate = new Date();

// const DB_NAME = "EmployeeDB";
// const DB_VERSION = 1;

// const monthTitle = document.getElementById("monthTitle");
// const calendarDays = document.getElementById("calendarDays");
// const prevMonthButton = document.getElementById("prevMonth");
// const nextMonthButton = document.getElementById("nextMonth");

// openDatabase();

// function ensureIndex(objectStore, name, keyPath, options) {
//     if (!objectStore.indexNames.contains(name)) {
//         objectStore.createIndex(name, keyPath, options);
//     }
// }

// function openDatabase() {
//     const request = indexedDB.open(DB_NAME, DB_VERSION);

//     request.onupgradeneeded = (e) => {
//         const database = e.target.result;
//         const upgradeTransaction = e.target.transaction;
//         let employeeStore;
//         let leaveStore;

//         if (database.objectStoreNames.contains("employees")) {
//             employeeStore = upgradeTransaction.objectStore("employees");
//         } else {
//             employeeStore = database.createObjectStore("employees", { keyPath: "id" });
//         }

//         ensureIndex(employeeStore, "name", "name", { unique: false });
//         ensureIndex(employeeStore, "email", "email", { unique: true });
//         ensureIndex(employeeStore, "phoneNumber", "phoneNumber", { unique: true });

//         if (database.objectStoreNames.contains("leaveRequests")) {
//             leaveStore = upgradeTransaction.objectStore("leaveRequests");
//         } else {
//             leaveStore = database.createObjectStore("leaveRequests", { keyPath: "leaveId" });
//         }

//         ensureIndex(leaveStore, "employeeId", "employeeId", { unique: false });
//         ensureIndex(leaveStore, "name", "name", { unique: false });
//         ensureIndex(leaveStore, "leaveType", "leaveType", { unique: false });
//         ensureIndex(leaveStore, "leaveDate", "leaveDate", { unique: false });
//         ensureIndex(leaveStore, "startDate", "startDate", { unique: false });
//         ensureIndex(leaveStore, "endDate", "endDate", { unique: false });
//     };

//     request.onsuccess = (e) => {
//         db = e.target.result;

//         Promise.resolve(
//             typeof window.seedDefaultEmployees === "function"
//                 ? window.seedDefaultEmployees(db)
//                 : undefined
//         )
//             .catch((error) => {
//                 console.error("Default employee seed failed:", error);
//             })
//             .finally(() => {
//                 renderCalendar();
//             });
//     };

//     request.onerror = (event) => {
//         console.error("Database error:", event.target.error);
//     };
// }

// if (prevMonthButton) {
//     prevMonthButton.addEventListener("click", () => {
//         currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
//         renderCalendar();
//     });
// }

// if (nextMonthButton) {
//     nextMonthButton.addEventListener("click", () => {
//         currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
//         renderCalendar();
//     });
// }

// function getAllLeaveRequests(callback) {
//     if (!db) return;

//     const transaction = db.transaction(["leaveRequests"], "readonly");
//     const objectStore = transaction.objectStore("leaveRequests");
//     const getAllRequest = objectStore.getAll();

//     getAllRequest.onsuccess = () => {
//         callback(getAllRequest.result || []);
//     };

//     getAllRequest.onerror = (event) => {
//         console.error("Error reading leave requests:", event.target.error);
//         callback([]);
//     };
// }

// function isDateInRange(dateToCheck, startDate, endDate) {
//     return dateToCheck >= startDate && dateToCheck <= endDate;
// }

// function renderCalendar() {
//     if (!db || !calendarDays || !monthTitle) return;

//     getAllLeaveRequests((leaveRequests) => {
//         const year = currentDate.getFullYear();
//         const month = currentDate.getMonth();

//         const firstDayIndex = new Date(year, month, 1).getDay();
//         const daysInMonth = new Date(year, month + 1, 0).getDate();

//         const monthNames = [
//             "January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];

//         monthTitle.textContent = `${monthNames[month]} ${year}`;
//         calendarDays.innerHTML = "";

//         for (let i = 0; i < firstDayIndex; i++) {
//             const emptyCell = document.createElement("div");
//             emptyCell.className = "empty";
//             calendarDays.appendChild(emptyCell);
//         }

//         for (let day = 1; day <= daysInMonth; day++) {
//             const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//             const dayCell = document.createElement("div");
//             dayCell.className = "day";

//             const dayNumber = document.createElement("div");
//             dayNumber.className = "day-number";
//             dayNumber.textContent = day;
//             dayCell.appendChild(dayNumber);

//             const leavesOnThisDay = leaveRequests.filter((item) => {
//                 if (item.startDate && item.endDate) {
//                     return isDateInRange(fullDate, item.startDate, item.endDate);
//                 }

//                 if (item.leaveDate) {
//                     return item.leaveDate === fullDate;
//                 }

//                 return false;
//             });

//             leavesOnThisDay.forEach((item) => {
//                 const leaveItem = document.createElement("div");
//                 leaveItem.className = "leave-item";
//                 leaveItem.textContent = `${item.name} - ${formatLeaveType(item.leaveType)}`;
//                 leaveItem.title = item.details || "";
//                 dayCell.appendChild(leaveItem);
//             });

//             calendarDays.appendChild(dayCell);
//         }
//     });
// }

// function formatLeaveType(type) {
//     if (type === "annual-leave") return "Annual Leave";
//     if (type === "sick-leave") return "Sick Leave";
//     if (type === "maternity-leave") return "Maternity Leave";
//     if (type === "study-leave") return "Study Leave";
//     if (type === "official-holiday-leave") return "Official Holiday Leave";
//     return type;
// }



let db;
let currentDate = new Date();

const DB_NAME = "EmployeeDB";
const DB_VERSION = 1;

const monthTitle = document.getElementById("monthTitle");
const calendarDays = document.getElementById("calendarDays");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

openDatabase();

function openDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
        const database = event.target.result;

        if (!database.objectStoreNames.contains("employees")) {
            const employeeStore = database.createObjectStore("employees", {
                keyPath: "id"
            });

            employeeStore.createIndex("name", "name", { unique: false });
            employeeStore.createIndex("email", "email", { unique: true });
            employeeStore.createIndex("phoneNumber", "phoneNumber", { unique: true });
        }

        if (!database.objectStoreNames.contains("leaveRequests")) {
            const leaveStore = database.createObjectStore("leaveRequests", {
                keyPath: "leaveId"
            });

            leaveStore.createIndex("employeeId", "employeeId", { unique: false });
            leaveStore.createIndex("name", "name", { unique: false });
            leaveStore.createIndex("leaveType", "leaveType", { unique: false });
            leaveStore.createIndex("leaveDate", "leaveDate", { unique: false });
            leaveStore.createIndex("startDate", "startDate", { unique: false });
            leaveStore.createIndex("endDate", "endDate", { unique: false });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        renderCalendar();
    };

    request.onerror = function () {
        console.log("Database error");
    };
}

if (prevMonthButton) {
    prevMonthButton.addEventListener("click", function () {
        currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        );

        renderCalendar();
    });
}

if (nextMonthButton) {
    nextMonthButton.addEventListener("click", function () {
        currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
        );

        renderCalendar();
    });
}

function getAllLeaveRequests(callback) {
    const transaction = db.transaction("leaveRequests", "readonly");
    const store = transaction.objectStore("leaveRequests");
    const request = store.getAll();

    request.onsuccess = function () {
        callback(request.result);
    };

    request.onerror = function () {
        callback([]);
    };
}

function renderCalendar() {
    if (!db) return;

    getAllLeaveRequests(function (leaveRequests) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = [
            "January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December"
        ];

        monthTitle.textContent = monthNames[month] + " " + year;
        calendarDays.innerHTML = "";

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "empty";
            calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate =
                year + "-" +
                String(month + 1).padStart(2, "0") + "-" +
                String(day).padStart(2, "0");

            const dayBox = document.createElement("div");
            dayBox.className = "day";

            const dayNumber = document.createElement("div");
            dayNumber.className = "day-number";
            dayNumber.textContent = day;

            dayBox.appendChild(dayNumber);

            leaveRequests.forEach(function (leave) {
                const startDate = leave.startDate;
                const endDate = leave.endDate;
                const leaveDate = leave.leaveDate;

                const hasRange = startDate && endDate;
                const isInsideRange = hasRange && fullDate >= startDate && fullDate <= endDate;
                const isSameDate = leaveDate === fullDate;

                if (isInsideRange || isSameDate) {
                    const leaveItem = document.createElement("div");
                    leaveItem.className = "leave-item";
                    leaveItem.textContent = leave.name + " - " + formatLeaveType(leave.leaveType);

                    dayBox.appendChild(leaveItem);
                }
            });

            calendarDays.appendChild(dayBox);
        }
    });
}

function formatLeaveType(type) {
    if (type === "annual-leave") {
        return "Annual Leave";
    }

    if (type === "sick-leave") {
        return "Sick Leave";
    }

    if (type === "maternity-leave") {
        return "Maternity Leave";
    }

    if (type === "study-leave") {
        return "Study Leave";
    }

    if (type === "official-holiday-leave") {
        return "Official Holiday Leave";
    }

    return type;
}