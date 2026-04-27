let chartDb = null;
let mainChart = null;

const DB_NAME = "EmployeeDB";
const DB_VERSION = 4;

const STORE_NAMES = {
    employees: "employees",
    leaveRequests: "leaveRequests",
    hrRequests: "humanResourceRequests"
};

const chartMessage = document.getElementById("chartMessage");
const roleFilter = document.getElementById("roleFilter");
const dataFilter = document.getElementById("dataFilter");
const chartTypeFilter = document.getElementById("chartTypeFilter");
const chartTitle = document.getElementById("chartTitle");

let allEmployees = [];
let allLeaveRequests = [];
let allHrRequests = [];

openChartDatabase();

if (roleFilter) {
    roleFilter.addEventListener("change", updateChart);
}

if (dataFilter) {
    dataFilter.addEventListener("change", updateChart);
}

if (chartTypeFilter) {
    chartTypeFilter.addEventListener("change", updateChart);
}

function openChartDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = setupChartDatabase;

    request.onsuccess = function (event) {
        chartDb = event.target.result;
        loadCharts();
    };

    request.onerror = function () {
        showChartMessage("Database could not open.", "red");
    };

    request.onblocked = function () {
        showChartMessage("Close other tabs, then refresh this page.", "red");
    };
}

function setupChartDatabase(event) {
    const database = event.target.result;
    const transaction = event.target.transaction;

    let employeeStore;
    let leaveStore;
    let hrStore;

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

    if (!leaveStore.indexNames.contains("startDate")) {
        leaveStore.createIndex("startDate", "startDate", { unique: false });
    }

    if (!leaveStore.indexNames.contains("endDate")) {
        leaveStore.createIndex("endDate", "endDate", { unique: false });
    }

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

async function loadCharts() {
    if (!chartDb) {
        showChartMessage("Database is not ready.", "red");
        return;
    }

    try {
        allEmployees = await getAllRecords(STORE_NAMES.employees);
        allLeaveRequests = await getAllRecords(STORE_NAMES.leaveRequests);
        allHrRequests = await getAllRecords(STORE_NAMES.hrRequests);

        if (
            allEmployees.length === 0 &&
            allLeaveRequests.length === 0 &&
            allHrRequests.length === 0
        ) {
            showChartMessage("No data found. Import JSON records first.", "red");
            return;
        }

        updateChart();
        showChartMessage("Chart loaded successfully.", "green");

    } catch (error) {
        console.error(error);
        showChartMessage("Could not load chart data.", "red");
    }
}

function getAllRecords(storeName) {
    return new Promise(function (resolve, reject) {
        if (!chartDb.objectStoreNames.contains(storeName)) {
            resolve([]);
            return;
        }

        const transaction = chartDb.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject("Could not read " + storeName);
        };
    });
}

function updateChart() {
    const selectedRole = roleFilter.value;
    const selectedData = dataFilter.value;
    const selectedChartType = chartTypeFilter.value;

    const filteredEmployees = filterEmployeesByRole(selectedRole);

    const employeeIds = filteredEmployees.map(function (employee) {
        return String(employee.id);
    });

    const filteredLeaveRequests = allLeaveRequests.filter(function (leave) {
        return employeeIds.includes(String(leave.employeeId));
    });

    const filteredHrRequests = allHrRequests.filter(function (hr) {
        return employeeIds.includes(String(hr.employeeId));
    });

    const chartData = getChartData(
        selectedData,
        filteredEmployees,
        filteredLeaveRequests,
        filteredHrRequests
    );

    drawMainChart(
        selectedChartType,
        chartData.labels,
        chartData.data,
        chartData.title
    );
}

function filterEmployeesByRole(selectedRole) {
    if (selectedRole === "all") {
        return allEmployees;
    }

    return allEmployees.filter(function (employee) {
        return String(employee.role || "").toLowerCase() === selectedRole;
    });
}

function getChartData(selectedData, employees, leaveRequests, hrRequests) {
    if (selectedData === "total") {
        return {
            title: "Total Records",
            labels: ["Employees", "Leave Requests", "HR Requests"],
            data: [employees.length, leaveRequests.length, hrRequests.length]
        };
    }

    if (selectedData === "department") {
        const result = countByField(employees, "department");

        return {
            title: "Employees by Department",
            labels: Object.keys(result),
            data: Object.values(result)
        };
    }

    if (selectedData === "role") {
        const result = countByField(employees, "role");

        return {
            title: "Employees by Role",
            labels: Object.keys(result),
            data: Object.values(result)
        };
    }

    if (selectedData === "leave") {
        const result = countByField(leaveRequests, "leaveType");

        return {
            title: "Leave Requests by Type",
            labels: Object.keys(result),
            data: Object.values(result)
        };
    }

    const result = countByField(hrRequests, "requestType");

    return {
        title: "HR Requests by Type",
        labels: Object.keys(result),
        data: Object.values(result)
    };
}

function drawMainChart(chartType, labels, data, title) {
    const canvas = document.getElementById("mainChart");

    if (!canvas) {
        return;
    }

    if (mainChart) {
        mainChart.destroy();
    }

    if (chartTitle) {
        chartTitle.textContent = title;
    }

    mainChart = new Chart(canvas, {
        type: chartType,

        data: {
            labels: labels,

            datasets: [
                {
                    label: title,
                    data: data,
                    backgroundColor: [
                        "#0D4988",
                        "#1D7A8C",
                        "#8C5E1D",
                        "#6B4E9B",
                        "#B85C38",
                        "#2F855A",
                        "#805AD5",
                        "#DD6B20"
                    ],
                    borderWidth: 1
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            title: {
                display: false
            },

            legend: {
                display: chartType !== "bar" && chartType !== "horizontalBar"
            },

            scales: chartType === "bar" || chartType === "horizontalBar" ? {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }
                ],
                xAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }
                ]
            } : {}
        }
    });
}

function countByField(records, fieldName) {
    const result = {};

    records.forEach(function (record) {
        let value = record[fieldName];

        if (!value) {
            value = "Unknown";
        }

        value = formatLabel(String(value));

        if (!result[value]) {
            result[value] = 0;
        }

        result[value]++;
    });

    return result;
}

function formatLabel(value) {
    return value
        .replaceAll("-", " ")
        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });
}

function showChartMessage(message, color) {
    if (!chartMessage) return;

    chartMessage.textContent = message;
    chartMessage.style.color = color;
}