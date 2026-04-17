// Default Employees Data 50 Employee

 const defaultEmployees = [
    { name: "Liam Carter", email: "liam.carter01@gmail.com" },
    { name: "Noah Bennett", email: "noah.bennett02@gmail.com" },
    { name: "Oliver Hughes", email: "oliver.hughes03@gmail.com" },
    { name: "Elijah Brooks", email: "elijah.brooks04@gmail.com" },
    { name: "James Foster", email: "james.foster05@gmail.com" },
    { name: "William Hayes", email: "william.hayes06@gmail.com" },
    { name: "Benjamin Reed", email: "benjamin.reed07@gmail.com" },
    { name: "Lucas Price", email: "lucas.price08@gmail.com" },
    { name: "Henry Ward", email: "henry.ward09@gmail.com" },
    { name: "Alexander Ross", email: "alexander.ross10@gmail.com" },

    { name: "Emma Collins", email: "emma.collins11@gmail.com" },
    { name: "Olivia Murphy", email: "olivia.murphy12@gmail.com" },
    { name: "Ava Cooper", email: "ava.cooper13@gmail.com" },
    { name: "Sophia Richardson", email: "sophia.richardson14@gmail.com" },
    { name: "Isabella Cox", email: "isabella.cox15@gmail.com" },
    { name: "Mia Howard", email: "mia.howard16@gmail.com" },
    { name: "Charlotte Peterson", email: "charlotte.peterson17@gmail.com" },
    { name: "Amelia Gray", email: "amelia.gray18@gmail.com" },
    { name: "Harper Ramirez", email: "harper.ramirez19@gmail.com" },
    { name: "Evelyn James", email: "evelyn.james20@gmail.com" },

    { name: "Daniel Powell", email: "daniel.powell21@gmail.com" },
    { name: "Michael Long", email: "michael.long22@gmail.com" },
    { name: "Matthew Patterson", email: "matthew.patterson23@gmail.com" },
    { name: "Joseph Hughes", email: "joseph.hughes24@gmail.com" },
    { name: "David Simmons", email: "david.simmons25@gmail.com" },
    { name: "Samuel Bryant", email: "samuel.bryant26@gmail.com" },
    { name: "Jackson Griffin", email: "jackson.griffin27@gmail.com" },
    { name: "Sebastian Diaz", email: "sebastian.diaz28@gmail.com" },
    { name: "Aiden Sanders", email: "aiden.sanders29@gmail.com" },
    { name: "Logan Butler", email: "logan.butler30@gmail.com" },

    { name: "Emily Flores", email: "emily.flores31@gmail.com" },
    { name: "Abigail Barnes", email: "abigail.barnes32@gmail.com" },
    { name: "Ella Fisher", email: "ella.fisher33@gmail.com" },
    { name: "Scarlett Henderson", email: "scarlett.henderson34@gmail.com" },
    { name: "Grace Coleman", email: "grace.coleman35@gmail.com" },
    { name: "Chloe Jenkins", email: "chloe.jenkins36@gmail.com" },
    { name: "Victoria Perry", email: "victoria.perry37@gmail.com" },
    { name: "Riley Powell", email: "riley.powell38@gmail.com" },
    { name: "Aria Russell", email: "aria.russell39@gmail.com" },
    { name: "Lily Griffin", email: "lily.griffin40@gmail.com" },

    { name: "Owen Kelly", email: "owen.kelly41@gmail.com" },
    { name: "Gabriel Hughes", email: "gabriel.hughes42@gmail.com" },
    { name: "Julian Reed", email: "julian.reed43@gmail.com" },
    { name: "Levi Morgan", email: "levi.morgan44@gmail.com" },
    { name: "Isaac Bell", email: "isaac.bell45@gmail.com" },
    { name: "Nathan Rivera", email: "nathan.rivera46@gmail.com" },
    { name: "Caleb Cooper", email: "caleb.cooper47@gmail.com" },
    { name: "Dylan Foster", email: "dylan.foster48@gmail.com" },
    { name: "Aaron Murphy", email: "aaron.murphy49@gmail.com" },
    { name: "Christopher Ward", email: "christopher.ward50@gmail.com" }
];

export default function defaultEmployeesIfEmpty() {
    function defaultEmployeesIfEmpty() {
        if (!db) return;

        const transaction = db.transaction(["employees"], "readonly").objectStore("employees");
        const countRequest = transaction.count();

        countRequest.onsuccess = () => {
            if (countRequest.result === 0) {
                const writeTransaction = db.transaction(["employees"], "readwrite").objectStore("employees");
                const writeStore = writeTransaction.objectStore("employees");

                defaultEmployees.forEach((employee) => {
                    writeStore.add(employee);
                });

                writeTransaction.oncomplete = () => {
                    console.log("Default employees added to the database.");
                };

                writeTransaction.onerror = (e) => {
                    console.error("Failed to seed default employees.");
                };
            }
        };

        countRequest.onerror = () => {
            console.error("Failed to count employees.");
        };
    }
}