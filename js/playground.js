/**
 * Interactive Database Playground Controller
 * Powered by WebAssembly SQLite (sql.js)
 * Supports full DDL, DML, multi-statement scripts, live schema discovery,
 * starter templates, query history, CSV export, and SQLite binary export.
 */

// Global State
let SQL = null;
let db = null;
let currentResult = null;
const HISTORY_KEY = 'dbms_hub_sql_history';

// Starter SQL Templates
const TEMPLATES = {
    blank: `-- ========================================================
-- Blank Database Sandbox
-- Write your own CREATE TABLE, INSERT, and SELECT statements!
-- ========================================================

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    major TEXT DEFAULT 'General',
    gpa REAL CHECK(gpa >= 0.0 AND gpa <= 4.0),
    enrollment_year INTEGER
);

INSERT INTO students (name, major, gpa, enrollment_year) VALUES
('Aarav Sharma', 'Computer Science', 3.85, 2023),
('Diya Patel', 'Data Science', 3.92, 2022),
('Rohan Verma', 'Electrical Eng', 3.45, 2023),
('Priya Singh', 'Computer Science', 3.70, 2024);

SELECT * FROM students;`,

    university: `-- ========================================================
-- University Academic Portal Schema (M:N Relationship)
-- ========================================================

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    major TEXT
);

CREATE TABLE courses (
    course_id TEXT PRIMARY KEY,
    course_title TEXT NOT NULL,
    credits INTEGER DEFAULT 3
);

CREATE TABLE enrollments (
    enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(student_id),
    course_id TEXT REFERENCES courses(course_id),
    grade TEXT,
    semester TEXT
);

INSERT INTO students (name, email, major) VALUES
('Alice Chen', 'alice@univ.edu', 'Computer Science'),
('Bob Smith', 'bob@univ.edu', 'Information Systems'),
('Charlie Davis', 'charlie@univ.edu', 'Computer Science');

INSERT INTO courses (course_id, course_title, credits) VALUES
('CS101', 'Intro to Database Systems', 4),
('CS201', 'Data Structures & Algorithms', 4),
('MATH301', 'Discrete Mathematics', 3);

INSERT INTO enrollments (student_id, course_id, grade, semester) VALUES
(1, 'CS101', 'A', 'Fall 2024'),
(1, 'CS201', 'A-', 'Fall 2024'),
(2, 'CS101', 'B+', 'Fall 2024'),
(3, 'MATH301', 'A', 'Fall 2024');

-- Relational query joining all 3 tables:
SELECT s.name AS student, c.course_title, c.credits, e.grade
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
ORDER BY s.name ASC;`,

    ecommerce: `-- ========================================================
-- E-Commerce Retail Store Schema
-- Customers, Products, and Transactional Orders
-- ========================================================

CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    city TEXT,
    tier TEXT DEFAULT 'Standard'
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT,
    unit_price REAL NOT NULL,
    stock_quantity INTEGER DEFAULT 0
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date TEXT NOT NULL,
    total_amount REAL,
    status TEXT DEFAULT 'Completed'
);

INSERT INTO customers (full_name, city, tier) VALUES
('Nexus Tech', 'Seattle', 'Enterprise'),
('Apex Solutions', 'Chicago', 'Enterprise'),
('Vanguard Labs', 'Austin', 'Standard'),
('Echo Media', 'New York', 'Standard');

INSERT INTO products (product_name, category, unit_price, stock_quantity) VALUES
('Cloud Server Node', 'Infrastructure', 249.99, 50),
('Mechanical Keyboard', 'Hardware', 89.99, 120),
('27-inch 4K Monitor', 'Hardware', 349.50, 45),
('SSL Certificate 1Yr', 'Security', 49.00, 500);

INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
(1, '2025-01-15', 748.50, 'Completed'),
(1, '2025-02-01', 349.50, 'Completed'),
(2, '2025-02-10', 89.99, 'Shipped'),
(3, '2025-02-14', 49.00, 'Processing');

-- Customer Lifetime Value & Order Metrics:
SELECT c.full_name, c.tier, c.city,
       COUNT(o.order_id) AS total_orders,
       COALESCE(SUM(o.total_amount), 0) AS lifetime_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id
ORDER BY lifetime_spent DESC;`,

    hr: `-- ========================================================
-- Corporate Enterprise HR & Organization Hierarchy
-- ========================================================

CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    dept_name TEXT NOT NULL,
    location TEXT,
    budget REAL
);

CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dept_id INTEGER REFERENCES departments(dept_id),
    role TEXT,
    salary REAL,
    manager_id INTEGER REFERENCES employees(emp_id)
);

INSERT INTO departments VALUES
(1, 'Engineering', 'Seattle', 1500000),
(2, 'Product', 'San Francisco', 800000),
(3, 'Human Resources', 'Austin', 400000);

INSERT INTO employees (name, dept_id, role, salary, manager_id) VALUES
('Sophia Taylor', 1, 'VP of Engineering', 160000, NULL),
('Liam Martinez', 1, 'Senior Backend Engineer', 125000, 1),
('Noah Johnson', 1, 'Full Stack Engineer', 95000, 1),
('Emma Watson', 2, 'Product Director', 140000, NULL),
('Oliver Brown', 2, 'Associate PM', 80000, 4),
('Ava Wilson', 3, 'HR Director', 90000, NULL);

-- Department Analytics & Executive Ranking:
SELECT d.dept_name,
       COUNT(e.emp_id) AS headcount,
       ROUND(AVG(e.salary), 2) AS average_salary,
       MAX(e.salary) AS highest_salary
FROM departments d
JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id
ORDER BY average_salary DESC;`,

    banking: `-- ========================================================
-- Banking Accounts & Ledger System
-- ========================================================

CREATE TABLE accounts (
    account_no TEXT PRIMARY KEY,
    holder_name TEXT NOT NULL,
    account_type TEXT CHECK(account_type IN ('Savings', 'Checking')),
    balance REAL CHECK(balance >= 0.0)
);

CREATE TABLE transactions (
    txn_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_no TEXT REFERENCES accounts(account_no),
    txn_type TEXT CHECK(txn_type IN ('Deposit', 'Withdrawal')),
    amount REAL CHECK(amount > 0),
    txn_time TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO accounts VALUES
('ACC-1001', 'Alice Green', 'Savings', 12450.00),
('ACC-1002', 'Bob White', 'Checking', 3820.50),
('ACC-1003', 'Charlie Blue', 'Savings', 8900.00);

INSERT INTO transactions (account_no, txn_type, amount) VALUES
('ACC-1001', 'Deposit', 1500.00),
('ACC-1002', 'Withdrawal', 200.00),
('ACC-1001', 'Withdrawal', 450.00);

SELECT * FROM accounts;
SELECT * FROM transactions;`
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    initSqlEngine();
    initEditorEvents();
    initTabs();
    initControls();
    loadHistoryList();
});

// 1. Initialize WebAssembly SQLite Engine
async function initSqlEngine() {
    const statusText = document.getElementById('engineStatusText');
    try {
        if (statusText) statusText.textContent = 'Loading SQLite WebAssembly...';
        
        // Initialize sql.js with local or CDN wasm locator
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Create empty in-memory DB
        db = new SQL.Database();
        if (statusText) statusText.textContent = 'SQLite 3 Engine Ready';

        // Load initial template (blank)
        loadTemplate('blank');

        logConsole('SQLite 3.x WebAssembly engine loaded successfully in in-memory mode.', 'success');
    } catch (err) {
        console.error('Failed to initialize sql.js:', err);
        if (statusText) {
            statusText.textContent = 'Engine Offline (WASM Error)';
            statusText.parentElement.style.background = 'rgba(239, 68, 68, 0.15)';
            statusText.parentElement.style.color = '#ef4444';
        }
        logConsole('CRITICAL: WebAssembly SQLite failed to load. ' + err.message, 'error');
    }
}

// 2. Editor & Gutter Events
function initEditorEvents() {
    const textarea = document.getElementById('sqlEditorTextarea');
    const gutter = document.getElementById('editorGutter');

    if (!textarea) return;

    // Line number syncing
    const updateGutter = () => {
        if (!gutter) return;
        const lineCount = textarea.value.split('\n').length;
        let numbers = '';
        for (let i = 1; i <= Math.max(lineCount, 12); i++) {
            numbers += i + '\n';
        }
        gutter.textContent = numbers;
    };

    textarea.addEventListener('input', updateGutter);
    textarea.addEventListener('scroll', () => {
        if (gutter) gutter.scrollTop = textarea.scrollTop;
    });

    // Keyboard Shortcuts: Ctrl+Enter (Run), Tab (Indent 4 spaces)
    textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runEditorQuery();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            updateGutter();
        }
    });

    updateGutter();
}

// 3. Tab Switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.res-tab-btn');
    const panes = document.querySelectorAll('.res-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

// 4. Toolbar Controls & Events
function initControls() {
    const runBtn = document.getElementById('btnRunSql');
    const runSelBtn = document.getElementById('btnRunSelection');
    const clearBtn = document.getElementById('btnClearEditor');
    const resetBtn = document.getElementById('btnResetDb');
    const formatBtn = document.getElementById('btnFormatSql');
    const exportCsvBtn = document.getElementById('btnExportCsv');
    const exportSqliteBtn = document.getElementById('btnExportSqlite');
    const templateSelect = document.getElementById('templateSelect');
    const schemaFilter = document.getElementById('schemaFilterInput');

    if (runBtn) runBtn.addEventListener('click', () => runEditorQuery());
    if (runSelBtn) runSelBtn.addEventListener('click', () => runSelectionQuery());
    if (clearBtn) clearBtn.addEventListener('click', () => {
        const textarea = document.getElementById('sqlEditorTextarea');
        if (textarea) {
            textarea.value = '';
            textarea.dispatchEvent(new Event('input'));
            textarea.focus();
        }
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (confirm('Reset in-memory database? All newly created tables and uncommitted changes will be wiped.')) {
            resetDatabase();
        }
    });

    if (formatBtn) formatBtn.addEventListener('click', formatSqlCode);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportTableToCsv);
    if (exportSqliteBtn) exportSqliteBtn.addEventListener('click', exportDatabaseFile);

    if (templateSelect) {
        templateSelect.addEventListener('change', (e) => {
            loadTemplate(e.target.value);
        });
    }

    if (schemaFilter) {
        schemaFilter.addEventListener('input', (e) => {
            filterSchemaTables(e.target.value.toLowerCase().trim());
        });
    }
}

// Load Starter Template
function loadTemplate(key) {
    if (!TEMPLATES[key]) return;
    const textarea = document.getElementById('sqlEditorTextarea');
    if (!textarea) return;

    textarea.value = TEMPLATES[key];
    textarea.dispatchEvent(new Event('input'));

    // Automatically reset and run the template
    resetDatabase(false);
    runEditorQuery();
}

// Reset Database Instance
function resetDatabase(executeCurrentEditor = true) {
    if (!SQL) return;
    if (db) {
        db.close();
    }
    db = new SQL.Database();
    logConsole('Database reset to fresh in-memory state.', 'info');
    refreshSchemaExplorer();

    if (executeCurrentEditor) {
        runEditorQuery();
    }
}

// Run Full SQL Editor Script
function runEditorQuery() {
    const textarea = document.getElementById('sqlEditorTextarea');
    if (!textarea) return;
    const sql = textarea.value.trim();
    if (!sql) {
        showStatus('Editor is empty. Write or paste SQL statements to run.', 'info');
        return;
    }
    executeSql(sql);
}

// Run Only Selected SQL
function runSelectionQuery() {
    const textarea = document.getElementById('sqlEditorTextarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedSql = textarea.value.substring(start, end).trim();

    if (!selectedSql) {
        alert('Please highlight/select a snippet of SQL text to run.');
        return;
    }

    executeSql(selectedSql);
}

// Core Execution Function
function executeSql(rawSql) {
    if (!db) {
        logConsole('Cannot execute: SQLite engine is not initialized yet.', 'error');
        return;
    }

    const startTime = performance.now();
    const resultContainer = document.getElementById('resultTableContainer');
    const statPill = document.getElementById('executionStatPill');

    saveToHistory(rawSql);

    try {
        // Execute multi-statement SQL script
        const execResults = db.exec(rawSql);
        const duration = (performance.now() - startTime).toFixed(2);

        // Update Schema Tree
        refreshSchemaExplorer();

        if (execResults && execResults.length > 0) {
            // Take the last result that produced table data
            const lastResult = execResults[execResults.length - 1];
            currentResult = lastResult;
            renderResultTable(lastResult, duration);

            if (statPill) {
                statPill.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981;"></i> <span>${lastResult.values.length} rows returned in ${duration} ms</span>`;
            }
            logConsole(`Execution completed successfully: ${lastResult.values.length} rows returned (${duration} ms).`, 'success');
        } else {
            // DDL or DML without direct projection (CREATE, INSERT, UPDATE, DELETE)
            currentResult = null;
            const rowsModified = db.getRowsModified();
            if (resultContainer) {
                resultContainer.innerHTML = `
                    <div style="padding: 30px 20px; text-align: center; color: var(--text-color, #1e293b);">
                        <i class="fas fa-check-circle" style="font-size: 2.5rem; color: #10b981; margin-bottom: 12px; display: block;"></i>
                        <h4 style="margin: 0 0 6px; font-size: 1.15rem;">Command(s) Executed Successfully</h4>
                        <p style="color: var(--text-secondary, #64748b); font-size: 0.9rem; margin: 0;">
                            Executed DDL/DML script with 0 syntax errors. Rows modified: <strong>${rowsModified}</strong> (${duration} ms).
                        </p>
                    </div>
                `;
            }
            if (statPill) {
                statPill.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981;"></i> <span>OK (${duration} ms)</span>`;
            }
            logConsole(`Command executed successfully: ${rowsModified} rows modified (${duration} ms).`, 'success');
        }

        // Switch to Results tab automatically
        switchToTab('tabResults');

    } catch (err) {
        const duration = (performance.now() - startTime).toFixed(2);
        console.error('SQL Execution Error:', err);
        currentResult = null;

        if (resultContainer) {
            resultContainer.innerHTML = `
                <div style="padding: 24px 20px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #ef4444; font-weight: 700; margin-bottom: 8px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>SQL Execution Error</span>
                    </div>
                    <pre style="margin: 0; font-family: 'Fira Code', monospace; color: #ef4444; font-size: 0.9rem; white-space: pre-wrap;">${escapeHtml(err.message)}</pre>
                </div>
            `;
        }

        if (statPill) {
            statPill.innerHTML = `<i class="fas fa-times-circle" style="color:#ef4444;"></i> <span style="color:#ef4444;">Error in ${duration} ms</span>`;
        }

        logConsole(`ERROR: ${err.message}`, 'error');
        switchToTab('tabResults');
    }
}

// Render Result Set Table
function renderResultTable(res, duration) {
    const container = document.getElementById('resultTableContainer');
    if (!container) return;

    if (!res || !res.columns || res.columns.length === 0) {
        container.innerHTML = '<p style="color:#64748b;padding:20px;text-align:center;">Query executed with 0 columns returned.</p>';
        return;
    }

    let ths = res.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
    let trs = res.values.map(row => {
        let tds = row.map(val => {
            if (val === null || val === undefined) {
                return '<td><span class="null-badge">NULL</span></td>';
            }
            return `<td>${escapeHtml(String(val))}</td>`;
        }).join('');
        return `<tr>${tds}</tr>`;
    }).join('');

    container.innerHTML = `
        <div class="sample-table-wrapper" style="border-radius:8px; border:1px solid var(--border-color,#e2e8f0);">
            <table class="sample-table">
                <thead><tr>${ths}</tr></thead>
                <tbody>${trs}</tbody>
            </table>
        </div>
    `;
}

// 5. Schema Introspection (Live Refresh)
function refreshSchemaExplorer() {
    const list = document.getElementById('schemaTablesList');
    const countBadge = document.getElementById('tableCountBadge');
    if (!db || !list) return;

    try {
        const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;");
        
        if (!tablesRes.length || !tablesRes[0].values.length) {
            list.innerHTML = `
                <div style="padding: 20px 10px; text-align: center; color: var(--text-secondary, #64748b); font-size: 0.85rem;">
                    <i class="fas fa-database" style="font-size: 1.5rem; margin-bottom: 8px; opacity: 0.5; display: block;"></i>
                    No tables in database yet.<br>Create one using <code>CREATE TABLE</code>!
                </div>
            `;
            if (countBadge) countBadge.textContent = '0 Tables';
            return;
        }

        const tables = tablesRes[0].values.map(v => v[0]);
        if (countBadge) countBadge.textContent = `${tables.length} Table${tables.length === 1 ? '' : 's'}`;

        let html = '';
        for (const tableName of tables) {
            // Get row count
            let rowCount = 0;
            try {
                const countRes = db.exec(`SELECT COUNT(*) AS cnt FROM "${tableName}";`);
                if (countRes.length && countRes[0].values.length) {
                    rowCount = countRes[0].values[0][0];
                }
            } catch (e) {}

            // Get columns info
            let columns = [];
            try {
                const colRes = db.exec(`PRAGMA table_info("${tableName}");`);
                if (colRes.length) {
                    columns = colRes[0].values.map(col => ({
                        cid: col[0],
                        name: col[1],
                        type: col[2] || 'ANY',
                        notNull: col[3] === 1,
                        isPk: col[5] === 1
                    }));
                }
            } catch (e) {}

            let colRowsHtml = columns.map(c => `
                <div class="schema-col-row">
                    <span>
                        <i class="fas fa-columns" style="font-size:0.7rem;margin-right:4px;opacity:0.6;"></i>
                        ${escapeHtml(c.name)}
                        ${c.isPk ? '<span class="schema-pk-tag">PK</span>' : ''}
                    </span>
                    <span class="schema-col-type">${escapeHtml(c.type)}</span>
                </div>
            `).join('');

            html += `
                <div class="schema-table-item" data-table="${escapeHtml(tableName)}">
                    <div class="schema-table-head" onclick="toggleTableColumns(this)">
                        <div class="schema-table-name">
                            <i class="fas fa-table" style="color:var(--primary-color,#3776ab);"></i>
                            <span>${escapeHtml(tableName)}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span class="schema-row-badge">${rowCount} rows</span>
                            <i class="fas fa-chevron-down" style="font-size:0.75rem;color:#94a3b8;transition:transform 0.2s;"></i>
                        </div>
                    </div>
                    <div class="schema-table-columns">
                        ${colRowsHtml}
                        <div class="schema-table-actions">
                            <button class="btn-table-action" onclick="quickSelectTable('${escapeHtml(tableName)}')">
                                <i class="fas fa-search"></i> SELECT *
                            </button>
                            <button class="btn-table-action" style="color:#ef4444;" onclick="quickDropTable('${escapeHtml(tableName)}')">
                                <i class="fas fa-trash"></i> DROP
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        list.innerHTML = html;
    } catch (err) {
        console.error('Error refreshing schema explorer:', err);
    }
}

// Toggle Table Column Tree
window.toggleTableColumns = function(headEl) {
    const parent = headEl.closest('.schema-table-item');
    if (!parent) return;
    const cols = parent.querySelector('.schema-table-columns');
    const icon = headEl.querySelector('.fa-chevron-down, .fa-chevron-up');
    if (cols) {
        cols.classList.toggle('is-expanded');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }
};

// Quick SELECT Table
window.quickSelectTable = function(tableName) {
    const textarea = document.getElementById('sqlEditorTextarea');
    if (!textarea) return;
    const query = `SELECT * FROM "${tableName}" LIMIT 50;`;
    textarea.value = query;
    textarea.dispatchEvent(new Event('input'));
    runEditorQuery();
};

// Quick DROP Table
window.quickDropTable = function(tableName) {
    if (confirm(`Are you sure you want to permanently DROP table "${tableName}"?`)) {
        executeSql(`DROP TABLE "${tableName}";`);
    }
};

// Filter Schema Tables
function filterSchemaTables(query) {
    const items = document.querySelectorAll('.schema-table-item');
    items.forEach(item => {
        const name = item.getAttribute('data-table') || '';
        item.style.display = name.toLowerCase().includes(query) ? 'block' : 'none';
    });
}

// 6. Query History Management
function saveToHistory(sql) {
    if (!sql || sql.length < 5) return;
    try {
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        // Deduplicate recent
        history = history.filter(item => item.sql !== sql);
        history.unshift({
            sql: sql,
            timestamp: new Date().toLocaleTimeString()
        });
        if (history.length > 25) history = history.slice(0, 25);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        loadHistoryList();
    } catch (e) {}
}

function loadHistoryList() {
    const list = document.getElementById('queryHistoryList');
    if (!list) return;

    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        if (!history.length) {
            list.innerHTML = '<p style="color:#64748b;text-align:center;padding:14px;font-size:0.85rem;">No recently executed queries.</p>';
            return;
        }

        list.innerHTML = history.map((item, idx) => `
            <div class="history-item" onclick="loadHistoryItem(${idx})">
                <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%;">
                    ${escapeHtml(item.sql.replace(/\n/g, ' '))}
                </div>
                <span style="font-size:0.72rem;color:#94a3b8;flex-shrink:0;">${item.timestamp}</span>
            </div>
        `).join('');
    } catch (e) {}
}

window.loadHistoryItem = function(idx) {
    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        if (history[idx]) {
            const textarea = document.getElementById('sqlEditorTextarea');
            if (textarea) {
                textarea.value = history[idx].sql;
                textarea.dispatchEvent(new Event('input'));
                switchToTab('tabResults');
                runEditorQuery();
            }
        }
    } catch (e) {}
};

// 7. Console Logging
function logConsole(message, type = 'info') {
    const box = document.getElementById('consoleLogBox');
    if (!box) return;

    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-entry time">[${time}]</span> <span>${escapeHtml(message)}</span>`;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
}

// 8. Format SQL Code (Basic Capitalization of Keywords)
function formatSqlCode() {
    const textarea = document.getElementById('sqlEditorTextarea');
    if (!textarea) return;

    const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL',
        'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'ON',
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'ADD COLUMN',
        'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'AUTOINCREMENT', 'CHECK', 'UNIQUE', 'DEFAULT',
        'UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'WITH', 'OVER', 'PARTITION BY'
    ];

    let code = textarea.value;
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        code = code.replace(regex, kw);
    });

    textarea.value = code;
    textarea.dispatchEvent(new Event('input'));
    logConsole('SQL formatted keywords to standard uppercase.', 'info');
}

// 9. Export Utilities
function exportTableToCsv() {
    if (!currentResult || !currentResult.columns) {
        alert('No tabular results available to export. Run a SELECT query first!');
        return;
    }

    const rows = [currentResult.columns, ...currentResult.values];
    const csvContent = rows.map(r => r.map(cell => {
        let val = (cell === null || cell === undefined) ? '' : String(cell);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
    }).join(',')).join('\n');

    downloadFile(csvContent, 'query_results.csv', 'text/csv;charset=utf-8;');
    logConsole('Exported active query result set to CSV.', 'info');
}

function exportDatabaseFile() {
    if (!db) {
        alert('Database is not initialized.');
        return;
    }
    const binaryArray = db.export();
    const blob = new Blob([binaryArray], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database_sandbox.sqlite';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logConsole('Exported complete SQLite database file (.sqlite).', 'success');
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper: Tab Switching
function switchToTab(tabId) {
    const tabBtns = document.querySelectorAll('.res-tab-btn');
    const panes = document.querySelectorAll('.res-tab-pane');

    tabBtns.forEach(b => {
        if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
        else b.classList.remove('active');
    });

    panes.forEach(p => {
        if (p.id === tabId) p.classList.add('active');
        else p.classList.remove('active');
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
