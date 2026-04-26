window.seedDefaultEmployees = async function (db) {
    try {
        const response = await fetch("/backend/script-files/db/json/records.json");

        if (!response.ok) {
            console.error("Could not find records.json");
            return;
        }

        const data = await response.json();
        const employees = data.employees || [];

        const transaction = db.transaction(
            ["employees", "leaveRequests", "humanResourceRequests"],
            "readwrite"
        );

        const employeeStore = transaction.objectStore("employees");
        const leaveStore = transaction.objectStore("leaveRequests");
        const hrStore = transaction.objectStore("humanResourceRequests");

        employees.forEach((record) => {
            const employeeId = String(record.id);
            const phoneNumber = String(record.phoneNumber);

            // Save employee data
            const employeeData = {
                id: employeeId,
                name: record.name,
                email: record.email,
                gender: record.gender,
                nationality: record.nationality,
                phoneNumber: phoneNumber,
                department: record.department,
                role: record.role
            };

            employeeStore.put(employeeData);

            // Save leave request data if it exists
            if (record.leaveType && record.leaveDate) {
                const leaveData = {
                    leaveId: "L" + employeeId,
                    employeeId: employeeId,
                    name: record.name,
                    leaveType: formatLeaveTypeForDatabase(record.leaveType),
                    startDate: formatDateForDatabase(record.leaveDate.startDate),
                    endDate: formatDateForDatabase(record.leaveDate.endDate),
                    leaveDate: formatDateForDatabase(record.leaveDate.startDate),
                    details: "Imported from JSON file"
                };

                leaveStore.put(leaveData);
            }

            // Save HR request data if it exists
            if (record.hrRequestType && record.hrRequestId) {
                const hrRequestData = {
                    hrID: String(record.hrRequestId),
                    employeeId: employeeId,
                    name: record.name,
                    requestType: record.hrRequestType,
                    details: "Imported from JSON file"
                };

                hrStore.put(hrRequestData);
            }
        });

        transaction.oncomplete = function () {
            console.log("JSON records imported successfully.");
        };

        transaction.onerror = function (event) {
            console.error("JSON import failed:", event.target.error);
        };

    } catch (error) {
        console.error("Seed error:", error);
    }
};

function formatDateForDatabase(dateValue) {
    const date = new Date(dateValue);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function formatLeaveTypeForDatabase(leaveType) {
    return leaveType
        .toLowerCase()
        .replaceAll(" ", "-");
}