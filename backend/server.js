require('dotenv').config();
const pool = require('./pg');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());


//   GET    /api/expenses        return all expenses

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') As date FROM expenses");
    res.status(200).json(result.rows);
  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});


//   GET    /api/expenses/getbycategory    return one expense (404 if not found)

app.get('/api/expenses/category/:category', async (req, res) => {
  const { category } = req.params;
  const validCategories = ['Other', 'Entertainment', 'Bills', 'Transport', 'Food'];
  if (!validCategories.includes(category))
    return res.status(400).json({ error: 'Invalid data' });
  try {
    const result = await pool.query("SELECT id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') As date FROM expenses WHERE category=$1", [category]);

    res.status(200).json(result.rows);

  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});


//   GET    /api/expenses/:id    return one expense (404 if not found)

app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Pleas Enter ID As A Number' });
  try {
    const result = await pool.query("SELECT id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') As date FROM expenses WHERE id=$1", [id]);
    if (result.rows.length == 0) return res.status(404).json({ error: 'data not found' });
    res.status(200).json(result.rows[0]);

  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});

//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)

app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;
  const validCategories = ['Other', 'Entertainment', 'Bills', 'Transport', 'Food'];

  if (!title ||
    !category ||
    amount === undefined ||
    isNaN(amount) ||
    amount <= 0 ||
    !validCategories.includes(category))
    return res.status(400).json({ error: 'Invalid data' });
  try {
    const result = await pool.query(
      "INSERT INTO expenses (title, amount, category, date) VALUES ($1,$2,$3,$4) RETURNING id, title, amount::float8,category, to_char(date, 'YYYY-MM-DD') AS date",
      [title, amount, category, date]);
    res.status(201).json(result.rows[0]);

  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});


//   PUT   /api/expenses/:id    update an expense (200, 400, or 404)

app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Pleas Enter id AS A Number' });

  const { title, amount, category, date } = req.body;
  const validCategories = ['Other', 'Entertainment', 'Bills', 'Transport', 'Food'];

  if (!title ||
    amount === undefined ||
    isNaN(amount) ||
    amount <= 0 ||
    !category ||
    !validCategories.includes(category))
    return res.status(400).json({ error: 'Invalid update data' });

  try {
    const result = await pool.query(
      "UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4 WHERE id = $5 RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date",
      [title, amount, category, date, id]
    );
    if (result.rows.length == 0) return res.status(404).json({ error: 'data not found' });
    res.status(200).json(result.rows[0]);

  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});


//   DELETE /api/expenses/:id    delete an expense (200, or 404)

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(404).json({ error: 'Pleas Enter ID AS A Number' });
  try {
    const result = await pool.query("DELETE FROM expenses WHERE id=$1 RETURNING id, title, amount::float8,category, to_char(date, 'YYYY-MM-DD') AS date", [id]);
    if (result.rows.length == 0) return res.status(404).json({ error: 'There’s no expense to delete it' });
    res.status(200).json(result.rows[0]);

  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});

//   DELETE /api/expenses/category    delete expense By Category (200, or 404)

app.delete('/api/expenses/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query("DELETE FROM expenses WHERE category=$1 RETURNING id, title, amount::float8,category, to_char(date, 'YYYY-MM-DD') AS date", [category]);
    if (result.rows.length == 0) return res.status(404).json({ error: 'There’s no expense to delete it' });
    res.status(200).json({ message: "deleted successfully" });

  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});

//   DELETE /api/expenses    delete all expense (200, or 404)

app.delete('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM expenses RETURNING id, title, amount::float8,category, to_char(date, 'YYYY-MM-DD') AS date");
    if (result.rows.length == 0) return res.status(404).json({ error: 'There’s no expense to delete it' });
    res.status(200).json({ message: "deleted successfully" });
  }
  catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

















