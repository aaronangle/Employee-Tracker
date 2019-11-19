const inquirer = require("inquirer")
const table = require("console.table")
const mysql = require("mysql")

const role = [];
const manager = [];
const first = [];
const employeeList = [];
const departments = [];

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "newEmployeeTracker_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {
    inquirer.prompt({

        type: "list",
        message: "What would you like to do?",
        choices: ["View Employees", "Add an Employee", "Remove an Employee", "Add a Role", "Add a Department"],
        name: "userInput"

    }).then(data => {
        const { userInput } = data;
        switch (userInput) {
            case "View Employees":
                viewEmployees();
                break;
            case "Add an Employee":
                titleList();
                break;
            case "Remove an Employee":
                getEmployeesFirst();
                break;
            case "Add a Role":
                roleList();
                break;
            case "Add a Department":
                addDepartment();
                break;
            default:
                break;
        }
    })
}

function viewEmployees() {
    connection.query("SELECT * FROM employees", function (err, result) {

    })
    const query = `SELECT * FROM employees
    LEFT JOIN role ON role.id = employees.role_id
    LEFT JOIN department ON department.id = role.department_id;`
    connection.query(query, function (err, results) {
        results.forEach(element => {

            employeeList.push({
                id: element.id,
                firstName: element.first_name,
                lastName: element.last_name,
                title: element.title,
                department: element.name,
                salary: element.salary,
            })
        });
        console.table(employeeList)
        setTimeout(() => {

        }, 1000);
        employeeList.length = 0;
        start();
    })
}

async function titleList() {
    await connection.query("SELECT title FROM role", function (err, results) {
        results.forEach(element => {
            if (role.indexOf(element.title) === -1) {
                role.push(element.title);
            }
        });

    })
    await connection.query("SELECT * FROM employees", function (err, results) {
        results.forEach(element => {
            if (element.manager_id === 0) {
                manager.push(element.first_name)
            }
        })

    });
    await addEmployee()
}

function addEmployee() {

    inquirer.prompt([
        {
            type: "input",
            message: "Employee's first name?",
            name: "first"
        },
        {
            type: "input",
            message: "Employee's last name?",
            name: "last"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            choices: role,
            name: "role"
        },
        {
            type: "list",
            message: "Who is the employee's manager",
            choices: manager,
            name: "manager"
        }


    ]).then(data => {
        const { first, last, role, manager } = data;
        connection.query(`SELECT id FROM employees WHERE first_name= '${manager}'`, function (err, results) {
            const managerID = results[0].id
            connection.query(`SELECT id FROM role WHERE title = "${role}"`, function (err, results) {
                const roleID = results[0].id
                const query = `INSERT INTO employees(first_name, last_name, manager_id, role_id) VALUES('${first}', '${last}', ${managerID}, ${roleID})`
                connection.query(query, function (err, results) {
                    role.length = 0;
                    manager.length = 0;
                    viewEmployees();
                    start();

                })
            })
        })
    })

}


function getEmployeesFirst() {
    connection.query("SELECT first_name FROM employees", async function (err, results) {
        await results.forEach(element => {
            first.push(element.first_name)
        })
        await removeEmployee()
    })
}
function removeEmployee() {

    inquirer.prompt({
        type: "list",
        message: "Which employee would you like to remove?",
        choices: first,
        name: "first"
    }).then(data => {
        const { first } = data;
        connection.connect(`DELETE FROM employees WHERE first_name = '${first}'`, function (err, result) {
            console.log(first + " was removed")
            setTimeout(() => {

            }, 1000);
            first.length = 0;
            start();
        })
    })
}
function addDepartment() {
    inquirer.prompt({
        type: "input",
        message: "What is the name of the department you would like to add?",
        name: "department"
    }).then(data => {
        const { department } = data;
        connection.query(`INSERT INTO department(name) VALUE("${department}")`, function (err, res) {
            console.log(department + " was succesfully added")
            setTimeout(() => {

            }, 1000);
            start();
        })
    })
}


function roleList() {
    connection.query(`SELECT name FROM department`, async function (err, res) {
        await res.forEach(element => {
            departments.push(element.name)
        })
        addRole()
    })

}
function addRole() {

    inquirer.prompt([
        {
            type: "input",
            message: "What is the title of the role you are adding?",
            name: "title"
        },
        {
            type: "list",
            message: "What department does the role belong to?",
            choices: departments,
            name: "department"
        },
        {
            type: "input",
            message: "What is the salary for the role?",
            name: "salary"
        }
    ]).then(data => {
        const { department, title, salary } = data;
        connection.query(`SELECT id FROM department WHERE name = '${department}'`, function (err, res) {
            const department_id = res[0].id
            connection.query(`INSERT INTO role(title, salary, department_id) VALUE('${title}', '${salary}', ${department_id})`, function (err, res) {
                console.log(title + " was succesfully added")
                setTimeout(() => {

                }, 1000);
                start();
            })
        })
    })

}