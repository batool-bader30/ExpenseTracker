-- Expense Tracker: database schema
-- Run this file once to create the table and add some sample data.
-- Running it again deletes the table and starts from the sample data.
 
DROP TABLE IF EXISTS expenses;

CREATE TABLE expenses (
  id       SERIAL PRIMARY KEY,
  title    VARCHAR(100)  NOT NULL CHECK (btrim(title) <> ''),
  amount   NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(20)   NOT NULL CHECK (category IN ('Food', 'Transport', 'Bills', 'Entertainment', 'Other')),
  date     DATE          NOT NULL
);

INSERT INTO expenses (title, amount, category, date) VALUES
  ('Lunch',            4.50,  'Food',          '2026-01-15'),
  ('Bus ticket',       1.20,  'Transport',     '2026-01-15'),
  ('Electricity bill', 32.00, 'Bills',         '2026-01-18'),
  ('Cinema',           8.00,  'Entertainment', '2026-01-20'),
  ('Notebook',         2.50,  'Other',         '2026-01-22'),
  ('Groceries',        27.75, 'Food',          '2026-02-02'),
  ('Taxi',             6.00,  'Transport',     '2026-02-04'),
  ('Internet bill',    20.00, 'Bills',         '2026-02-07');
