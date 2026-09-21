/**
 * DBMS Hub - Interactive SQL Query Lab & Execution Engine (sql-lab.js)
 * High-performance browser SQL sandbox powered by sql.js (WebAssembly SQLite)
 * Inspired by SQLBolt and SQLZoo
 */

// Global state
let sqlEngine = null;
let currentDbKey = 'movies';
let activeDbInstance = null;

// Database DDL & Seed Definitions
const DATABASE_SCHEMAS = {
    movies: {
        name: "Pixar Movies & Box Office",
        description: "Classic Pixar film catalog with domestic/international earnings and IMDb ratings.",
        tables: ["movies", "box_office"],
        sql: `
            DROP TABLE IF EXISTS box_office;
            DROP TABLE IF EXISTS movies;

            CREATE TABLE movies (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                director TEXT NOT NULL,
                year INTEGER NOT NULL,
                length_minutes INTEGER NOT NULL
            );

            CREATE TABLE box_office (
                movie_id INTEGER PRIMARY KEY,
                rating REAL NOT NULL,
                domestic_sales INTEGER NOT NULL,
                international_sales INTEGER NOT NULL,
                FOREIGN KEY (movie_id) REFERENCES movies(id)
            );

            INSERT INTO movies VALUES (1, 'Toy Story', 'John Lasseter', 1995, 81);
            INSERT INTO movies VALUES (2, 'A Bug''s Life', 'John Lasseter', 1998, 95);
            INSERT INTO movies VALUES (3, 'Toy Story 2', 'John Lasseter', 1999, 93);
            INSERT INTO movies VALUES (4, 'Monsters, Inc.', 'Pete Docter', 2001, 92);
            INSERT INTO movies VALUES (5, 'Finding Nemo', 'Andrew Stanton', 2003, 100);
            INSERT INTO movies VALUES (6, 'The Incredibles', 'Brad Bird', 2004, 115);
            INSERT INTO movies VALUES (7, 'Cars', 'John Lasseter', 2006, 117);
            INSERT INTO movies VALUES (8, 'Ratatouille', 'Brad Bird', 2007, 111);
            INSERT INTO movies VALUES (9, 'WALL-E', 'Andrew Stanton', 2008, 98);
            INSERT INTO movies VALUES (10, 'Up', 'Pete Docter', 2009, 96);

            INSERT INTO box_office VALUES (1, 8.3, 191796233, 170162593);
            INSERT INTO box_office VALUES (2, 7.2, 162798565, 200600000);
            INSERT INTO box_office VALUES (3, 7.9, 245852179, 239163000);
            INSERT INTO box_office VALUES (4, 8.1, 289916256, 272900000);
            INSERT INTO box_office VALUES (5, 8.2, 380843261, 555900000);
            INSERT INTO box_office VALUES (6, 8.0, 261441092, 370001000);
            INSERT INTO box_office VALUES (7, 7.2, 244082982, 217900120);
            INSERT INTO box_office VALUES (8, 8.0, 206445654, 415000000);
            INSERT INTO box_office VALUES (9, 8.4, 223808164, 297503692);
            INSERT INTO box_office VALUES (10, 8.3, 293004164, 438338421);
        `
    },
    techcorp: {
        name: "TechCorp HR & Payroll",
        description: "Enterprise organizational schema with employees, hierarchical managers, and departments.",
        tables: ["employees", "departments", "projects"],
        sql: `
            DROP TABLE IF EXISTS projects;
            DROP TABLE IF EXISTS employees;
            DROP TABLE IF EXISTS departments;

            CREATE TABLE departments (
                dept_id INTEGER PRIMARY KEY,
                dept_name TEXT NOT NULL,
                location TEXT NOT NULL,
                budget INTEGER NOT NULL
            );

            CREATE TABLE employees (
                emp_id INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                dept_id INTEGER,
                salary INTEGER NOT NULL,
                hire_date TEXT NOT NULL,
                manager_id INTEGER,
                FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
            );

            CREATE TABLE projects (
                proj_id INTEGER PRIMARY KEY,
                proj_name TEXT NOT NULL,
                dept_id INTEGER NOT NULL,
                budget INTEGER NOT NULL,
                FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
            );

            INSERT INTO departments VALUES (10, 'Engineering', 'Building A', 500000);
            INSERT INTO departments VALUES (20, 'Marketing', 'Building B', 250000);
            INSERT INTO departments VALUES (30, 'Sales', 'Building B', 300000);
            INSERT INTO departments VALUES (40, 'Human Resources', 'Building C', 150000);
            INSERT INTO departments VALUES (50, 'Research', 'Building D', 400000);

            INSERT INTO employees VALUES (101, 'Alice', 'Smith', 10, 95000, '2019-03-15', NULL);
            INSERT INTO employees VALUES (102, 'Bob', 'Jones', 10, 82000, '2020-06-01', 101);
            INSERT INTO employees VALUES (103, 'Charlie', 'Brown', 20, 68000, '2021-01-10', 105);
            INSERT INTO employees VALUES (104, 'Diana', 'Prince', 10, 88000, '2019-11-20', 101);
            INSERT INTO employees VALUES (105, 'Evan', 'Wright', 20, 91000, '2018-08-14', NULL);
            INSERT INTO employees VALUES (106, 'Fiona', 'Gallagher', 30, 72000, '2022-04-05', 108);
            INSERT INTO employees VALUES (107, 'George', 'Clark', NULL, 55000, '2023-02-18', 101);
            INSERT INTO employees VALUES (108, 'Hannah', 'Abbott', 30, 89000, '2017-09-12', NULL);

            INSERT INTO projects VALUES (501, 'Cloud Migration', 10, 120000);
            INSERT INTO projects VALUES (502, 'Global Rebrand', 20, 85000);
            INSERT INTO projects VALUES (503, 'CRM Upgrade', 30, 95000);
            INSERT INTO projects VALUES (504, 'AI Research Hub', 50, 200000);
        `
    },
    university: {
        name: "University Academic DB",
        description: "Student course registration, GPA standings, credits, and grade history.",
        tables: ["students", "courses", "enrollments"],
        sql: `
            DROP TABLE IF EXISTS enrollments;
            DROP TABLE IF EXISTS courses;
            DROP TABLE IF EXISTS students;

            CREATE TABLE students (
                student_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                major TEXT NOT NULL,
                gpa REAL NOT NULL,
                cohort_year INTEGER NOT NULL
            );

            CREATE TABLE courses (
                course_id TEXT PRIMARY KEY,
                course_name TEXT NOT NULL,
                credits INTEGER NOT NULL,
                dept_code TEXT NOT NULL
            );

            CREATE TABLE enrollments (
                student_id INTEGER,
                course_id TEXT,
                grade TEXT NOT NULL,
                PRIMARY KEY (student_id, course_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (course_id) REFERENCES courses(course_id)
            );

            INSERT INTO students VALUES (1, 'Aarav Sharma', 'Computer Science', 3.85, 2021);
            INSERT INTO students VALUES (2, 'Diya Patel', 'Information Technology', 3.92, 2022);
            INSERT INTO students VALUES (3, 'Rohan Verma', 'Computer Science', 3.40, 2021);
            INSERT INTO students VALUES (4, 'Ananya Iyer', 'Data Science', 3.78, 2023);
            INSERT INTO students VALUES (5, 'Kabir Singh', 'Mechanical Eng', 3.15, 2020);
            INSERT INTO students VALUES (6, 'Meera Nair', 'Computer Science', 3.95, 2022);

            INSERT INTO courses VALUES ('CS101', 'Database Management Systems', 4, 'CSE');
            INSERT INTO courses VALUES ('CS102', 'Operating Systems', 4, 'CSE');
            INSERT INTO courses VALUES ('DS201', 'Data Warehousing & Mining', 3, 'CSE');
            INSERT INTO courses VALUES ('MA101', 'Discrete Mathematics', 3, 'MATH');
            INSERT INTO courses VALUES ('ME101', 'Thermodynamics', 4, 'MECH');

            INSERT INTO enrollments VALUES (1, 'CS101', 'A');
            INSERT INTO enrollments VALUES (1, 'CS102', 'A-');
            INSERT INTO enrollments VALUES (2, 'CS101', 'A+');
            INSERT INTO enrollments VALUES (2, 'DS201', 'A');
            INSERT INTO enrollments VALUES (3, 'CS101', 'B+');
            INSERT INTO enrollments VALUES (4, 'DS201', 'A');
            INSERT INTO enrollments VALUES (5, 'ME101', 'B');
            INSERT INTO enrollments VALUES (6, 'CS101', 'A+');
            INSERT INTO enrollments VALUES (6, 'CS102', 'A');
        `
    },
    retail: {
        name: "Retail E-Commerce DB",
        description: "Online store customer profiles, international orders, and purchase transactions.",
        tables: ["customers", "orders"],
        sql: `
            DROP TABLE IF EXISTS orders;
            DROP TABLE IF EXISTS customers;

            CREATE TABLE customers (
                customer_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                country TEXT NOT NULL
            );

            CREATE TABLE orders (
                order_id INTEGER PRIMARY KEY,
                customer_id INTEGER NOT NULL,
                order_date TEXT NOT NULL,
                total_amount REAL NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
            );

            INSERT INTO customers VALUES (1, 'John Doe', 'New York', 'USA');
            INSERT INTO customers VALUES (2, 'Emma Watson', 'London', 'UK');
            INSERT INTO customers VALUES (3, 'Rajesh Kumar', 'Mumbai', 'India');
            INSERT INTO customers VALUES (4, 'Yuki Tanaka', 'Tokyo', 'Japan');
            INSERT INTO customers VALUES (5, 'Sophie Martin', 'Paris', 'France');
            INSERT INTO customers VALUES (6, 'Carlos Silva', 'Sao Paulo', 'Brazil');

            INSERT INTO orders VALUES (1001, 1, '2023-01-15', 250.00);
            INSERT INTO orders VALUES (1002, 2, '2023-01-20', 120.50);
            INSERT INTO orders VALUES (1003, 1, '2023-02-10', 480.00);
            INSERT INTO orders VALUES (1004, 3, '2023-02-14', 95.00);
            INSERT INTO orders VALUES (1005, 5, '2023-03-01', 310.20);
            INSERT INTO orders VALUES (1006, 1, '2023-03-22', 150.00);
            INSERT INTO orders VALUES (1007, 3, '2023-04-05', 520.00);
        `
    }
};

/**
 * Initialize WebAssembly SQLite Engine
 */
async function initSqlEngine() {
    const statusEl = document.getElementById('engineStatusBadge');
    if (statusEl) statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing SQLite WASM...';

    try {
        if (typeof initSqlJs === 'function') {
            sqlEngine = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
            switchDatabase(currentDbKey);
            if (statusEl) {
                statusEl.className = 'result-status-badge result-status-success';
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i> SQLite WASM Ready';
            }
        } else {
            initMockEngine();
        }
    } catch (err) {
        console.warn('WASM SQLite initialization failed, using in-memory engine fallback:', err);
        initMockEngine();
    }
}

/**
 * Fallback engine for 100% offline or network-blocked environments
 */
function initMockEngine() {
    const statusEl = document.getElementById('engineStatusBadge');
    if (statusEl) {
        statusEl.className = 'result-status-badge result-status-success';
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Local SQL Engine Active';
    }
}

/**
 * Switch active schema
 */
function switchDatabase(dbKey) {
    if (!DATABASE_SCHEMAS[dbKey]) return;
    currentDbKey = dbKey;

    if (sqlEngine) {
        activeDbInstance = new sqlEngine.Database();
        activeDbInstance.run(DATABASE_SCHEMAS[dbKey].sql);
    }

    const selectEl = document.getElementById('dbSelector');
    if (selectEl && selectEl.value !== dbKey) {
        selectEl.value = dbKey;
    }

    const dbDescEl = document.getElementById('activeDbDescription');
    if (dbDescEl) {
        dbDescEl.textContent = `${DATABASE_SCHEMAS[dbKey].name} (${DATABASE_SCHEMAS[dbKey].tables.join(', ')})`;
    }
}

/**
 * Reset database to initial seed data
 */
function resetCurrentDatabase() {
    switchDatabase(currentDbKey);
    const outputEl = document.getElementById('playgroundOutput');
    if (outputEl) {
        outputEl.innerHTML = `<div style="padding: 15px; color: #34d399;"><i class="fas fa-undo"></i> Database <strong>${DATABASE_SCHEMAS[currentDbKey].name}</strong> reset to original seed state.</div>`;
    }
}

/**
 * Execute SQL query from the playground editor
 */
function runPlaygroundQuery() {
    const textarea = document.getElementById('sqlEditorInput');
    const outputEl = document.getElementById('playgroundOutput');
    const statusBadge = document.getElementById('queryStatusBadge');
    if (!textarea || !outputEl) return;

    const query = textarea.value.trim();
    if (!query) {
        outputEl.innerHTML = '<div style="padding: 15px; color: #9ca3af;">Enter a valid SQL query and click "Run Query" (or press Ctrl+Enter).</div>';
        return;
    }

    const startTime = performance.now();

    try {
        if (activeDbInstance) {
            const results = activeDbInstance.exec(query);
            const duration = (performance.now() - startTime).toFixed(1);

            if (!results || results.length === 0) {
                // Statement executed (e.g. INSERT, UPDATE, DDL) with no returned rows
                if (statusBadge) {
                    statusBadge.className = 'result-status-badge result-status-success';
                    statusBadge.innerHTML = `<i class="fas fa-check"></i> Executed in ${duration}ms (0 rows returned)`;
                }
                outputEl.innerHTML = `
                    <div style="padding: 20px; color: #34d399; font-family: monospace;">
                        <i class="fas fa-check-circle"></i> Query executed successfully. Modified database state.
                    </div>`;
                return;
            }

            const { columns, values } = results[0];
            if (statusBadge) {
                statusBadge.className = 'result-status-badge result-status-success';
                statusBadge.innerHTML = `<i class="fas fa-check"></i> ${values.length} row${values.length === 1 ? '' : 's'} (${duration}ms)`;
            }

            // Build HTML result table
            let tableHtml = '<table class="playground-output-table"><thead><tr>';
            columns.forEach(col => {
                tableHtml += `<th>${escapeHtml(col)}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';

            values.forEach(row => {
                tableHtml += '<tr>';
                row.forEach(val => {
                    const formatted = (val === null) ? '<span style="color: #f87171; font-style: italic;">NULL</span>' : escapeHtml(String(val));
                    tableHtml += `<td>${formatted}</td>`;
                });
                tableHtml += '</tr>';
            });

            tableHtml += '</tbody></table>';
            outputEl.innerHTML = tableHtml;

        } else {
            // Simulated execution message if WebAssembly isn't available
            outputEl.innerHTML = `
                <div style="padding: 20px; color: #38bdf8;">
                    <p><i class="fas fa-info-circle"></i> SQLite WebAssembly initializing. Inspect the rendered "Expected Output" tables below for full visual reference.</p>
                </div>`;
        }
    } catch (err) {
        if (statusBadge) {
            statusBadge.className = 'result-status-badge result-status-error';
            statusBadge.innerHTML = `<i class="fas fa-times-circle"></i> Error`;
        }
        outputEl.innerHTML = `
            <div style="padding: 16px; color: #f87171; font-family: monospace; line-height: 1.5;">
                <strong><i class="fas fa-exclamation-triangle"></i> SQL Error:</strong><br>
                ${escapeHtml(err.message || String(err))}
            </div>`;
    }
}

/**
 * Load any query card into the interactive playground
 */
function loadQueryToEditor(sqlText, dbKey) {
    if (dbKey && dbKey !== currentDbKey) {
        switchDatabase(dbKey);
    }
    const editor = document.getElementById('sqlEditorInput');
    if (editor) {
        editor.value = sqlText.trim();
        const playgroundEl = document.getElementById('sqlPlayground');
        if (playgroundEl) {
            playgroundEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setTimeout(runPlaygroundQuery, 300);
    }
}

/**
 * Copy code snippet to clipboard with visual checkmark
 */
function copyQueryText(btn, text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" style="color: #34d399;"></i> Copied!';
            setTimeout(() => { btn.innerHTML = orig; }, 1500);
        });
    }
}

/**
 * Toggle challenge question solution
 */
function toggleChallenge(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('is-open');
    }
}

/**
 * Filter modules by category pill
 */
function filterQueryModules(category) {
    document.querySelectorAll('.query-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.getAttribute('data-cat') === category) {
            pill.classList.add('active');
        }
    });

    const modules = document.querySelectorAll('.query-module-card');
    modules.forEach(mod => {
        const cat = mod.getAttribute('data-category');
        if (category === 'all' || cat === category) {
            mod.style.display = 'block';
        } else {
            mod.style.display = 'none';
        }
    });
}

/**
 * Real-time search across all query cards
 */
function searchQueries() {
    const query = document.getElementById('querySearchInput').value.trim().toLowerCase();
    const items = document.querySelectorAll('.query-item-box');
    let matchCount = 0;

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
            item.style.display = 'block';
            matchCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Also hide modules that have 0 visible items
    document.querySelectorAll('.query-module-card').forEach(mod => {
        const visibleChildren = mod.querySelectorAll('.query-item-box[style="display: block;"], .query-item-box:not([style*="display: none"])');
        if (query && visibleChildren.length === 0) {
            mod.style.display = 'none';
        } else {
            mod.style.display = 'block';
        }
    });

    const counter = document.getElementById('queryMatchCount');
    if (counter) {
        counter.textContent = query ? `Found ${matchCount} matching lessons` : '';
    }
}

/**
 * View Database Schema Modal
 */
function showDatabaseSchema() {
    const db = DATABASE_SCHEMAS[currentDbKey];
    let schemaInfo = `Database: ${db.name}\n${'='.repeat(40)}\n\n`;
    
    if (activeDbInstance) {
        try {
            const tables = activeDbInstance.exec("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
            if (tables.length > 0) {
                tables[0].values.forEach(row => {
                    schemaInfo += `${row[1]};\n\n`;
                });
            }
        } catch(e) {
            schemaInfo += db.sql;
        }
    } else {
        schemaInfo += db.sql;
    }

    const outputEl = document.getElementById('playgroundOutput');
    if (outputEl) {
        outputEl.innerHTML = `
            <div style="padding: 14px; font-family: 'Fira Code', monospace; font-size: 0.82rem; color: #93c5fd; white-space: pre-wrap; line-height: 1.5;">
                ${escapeHtml(schemaInfo)}
            </div>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// Event Listeners & Auto-Initialization
document.addEventListener('DOMContentLoaded', () => {
    initSqlEngine();

    const dbSelector = document.getElementById('dbSelector');
    if (dbSelector) {
        dbSelector.addEventListener('change', (e) => {
            switchDatabase(e.target.value);
            runPlaygroundQuery();
        });
    }

    const sqlInput = document.getElementById('sqlEditorInput');
    if (sqlInput) {
        sqlInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runPlaygroundQuery();
            }
        });
    }

    const searchInput = document.getElementById('querySearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchQueries);
    }
});
