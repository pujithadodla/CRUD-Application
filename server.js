const express = require("express");
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// SQL Server Configuration
const dbConfig = {
    connectionString:
        "Driver={ODBC Driver 17 for SQL Server};" +
        "Server=localhost;" +
        "Database=CRUDDB;" +
        "Trusted_Connection=Yes;"
};

// Connect to SQL Server
sql.connect(dbConfig)
    .then(() => {
        console.log("SQL Server connected successfully!");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });

// Test route
app.get("/", (req, res) => {
    res.send("CRUD Application Backend is running!");
});
// GET all students
app.get("/students", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM Students ORDER BY id DESC");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to fetch students"
        });
    }
});
// CREATE a new student
app.post("/students", async (req, res) => {
    try {
        const { name, email, phone, course } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const request = new sql.Request();

        request.input("name", sql.VarChar(100), name);
        request.input("email", sql.VarChar(100), email);
        request.input("phone", sql.VarChar(15), phone || null);
        request.input("course", sql.VarChar(100), course || null);

        const result = await request.query(`
            INSERT INTO Students (name, email, phone, course)
            OUTPUT INSERTED.*
            VALUES (@name, @email, @phone, @course)
        `);

        res.status(201).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to add student"
        });
    }
});
// UPDATE a student
app.put("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, course } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const request = new sql.Request();

        request.input("id", sql.Int, id);
        request.input("name", sql.VarChar(100), name);
        request.input("email", sql.VarChar(100), email);
        request.input("phone", sql.VarChar(15), phone || null);
        request.input("course", sql.VarChar(100), course || null);

        const result = await request.query(`
            UPDATE Students
            SET
                name = @name,
                email = @email,
                phone = @phone,
                course = @course
            OUTPUT INSERTED.*
            WHERE id = @id
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to update student"
        });
    }
});
// DELETE a student
app.delete("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const request = new sql.Request();
        request.input("id", sql.Int, id);

        const result = await request.query(`
            DELETE FROM Students
            OUTPUT DELETED.*
            WHERE id = @id
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully",
            student: result.recordset[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to delete student"
        });
    }
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});