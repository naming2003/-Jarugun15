const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); 
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'shopdee',
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/product', (req, res) => {
  const { productName, productDetail, price, cost, quantity } = req.body;

  const sql = 'INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [productName, productDetail, price, cost, quantity], (err, result) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', status: false });
    }
    res.send({ message: 'บันทึกข้อมูลสำเร็จ', status: true });
  });
});

app.get('/product/:id', (req, res) => {
  const productID = req.params.id;

  const sql = 'SELECT * FROM product WHERE productID = ?';
  db.query(sql, [productID], (err, result) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', status: false });
    }
    res.send(result);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM customer WHERE username = ? AND isActive = 1';
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', status: false });
    }

    if (result.length > 0) {
      const customer = result[0];

      bcrypt.compare(password, customer.password, (err, match) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน', status: false });
        }

        if (match) {
          customer['message'] = 'เข้าสู่ระบบสำเร็จ';
          customer['status'] = true;
          res.send(customer);
        } else {
          res.send({ message: 'กรุณาระบุรหัสผ่านใหม่อีกครั้ง', status: false });
        }
      });
    } else {
      res.send({ message: 'ไม่พบผู้ใช้ที่ระบุ', status: false });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
