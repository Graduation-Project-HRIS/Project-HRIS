let db;
let currentDate = new Date();

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const monthTitle = document.getElementById("monthTitle");
const calendarDays = document.getElementById("calendarDays");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

openDatabase();



function setupDatabase(event) {
    const database = event.target.result;
    const transaction = event.target.transaction;

    let employeeStore;
    let leaveStore;
    let hrStore;

    // =========================
    // employees store
    // =========================
    if (!database.objectStoreNames.contains("employees")) {
        employeeStore = database.createObjectStore("employees", {
            keyPath: "id"
        });
    } else {
        employeeStore = transaction.objectStore("employees");
    }

    if (!employeeStore.indexNames.contains("name")) {
        employeeStore.createIndex("name", "name", { unique: false });
    }

    if (!employeeStore.indexNames.contains("email")) {
        employeeStore.createIndex("email", "email", { unique: true });
    }

    if (!employeeStore.indexNames.contains("phoneNumber")) {
        employeeStore.createIndex("phoneNumber", "phoneNumber", { unique: true });
    }

    if (!employeeStore.indexNames.contains("department")) {
        employeeStore.createIndex("department", "department", { unique: false });
    }


    // =========================
    // leaveRequests store
    // =========================
    if (!database.objectStoreNames.contains("leaveRequests")) {
        leaveStore = database.createObjectStore("leaveRequests", {
            keyPath: "leaveId"
        });
    } else {
        leaveStore = transaction.objectStore("leaveRequests");
    }

    if (!leaveStore.indexNames.contains("employeeId")) {
        leaveStore.createIndex("employeeId", "employeeId", { unique: false });
    }

    if (!leaveStore.indexNames.contains("name")) {
        leaveStore.createIndex("name", "name", { unique: false });
    }

    if (!leaveStore.indexNames.contains("leaveType")) {
        leaveStore.createIndex("leaveType", "leaveType", { unique: false });
    }

    if (!leaveStore.indexNames.contains("leaveDate")) {
        leaveStore.createIndex("leaveDate", "leaveDate", { unique: false });
    }

    if (!leaveStore.indexNames.contains("startDate")) {
        leaveStore.createIndex("startDate", "startDate", { unique: false });
    }

    if (!leaveStore.indexNames.contains("endDate")) {
        leaveStore.createIndex("endDate", "endDate", { unique: false });
    }

    // =========================
    // humanResourceRequests store
    // =========================
    if (!database.objectStoreNames.contains("humanResourceRequests")) {
        hrStore = database.createObjectStore("humanResourceRequests", {
            keyPath: "hrID"
        });
    } else {
        hrStore = transaction.objectStore("humanResourceRequests");
    }

    if (!hrStore.indexNames.contains("employeeId")) {
        hrStore.createIndex("employeeId", "employeeId", { unique: false });
    }

    if (!hrStore.indexNames.contains("name")) {
        hrStore.createIndex("name", "name", { unique: false });
    }

    if (!hrStore.indexNames.contains("requestType")) {
        hrStore.createIndex("requestType", "requestType", { unique: false });
    }
}

function openDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = setupDatabase;


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