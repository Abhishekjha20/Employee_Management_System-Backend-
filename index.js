const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
 
const bcrypt = require('bcrypt'); 
var jwt = require('jsonwebtoken');
 
const app = express();
const port = process.env.port || 8000;
 
app.use(express.json());
app.use(cors());
 
const con = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "Akjha@93100",
    database: "usermanagement"
})
 
con.connect(function(err) {
    if(err) {
        console.log("Error in Connection");
    } else {
        console.log("Connected");
    }
})
 
app.get('/getemployees', (req, res) => {
    const sql = "SELECT * FROM employees";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Get employees error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})
 
app.get('/get/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employees where id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "Get employees error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})
 
app.put("/update/:id", (req, res) => {
  const userId = req.params.id;
  const q = "UPDATE employees SET `name`= ?, `email`= ?, `salary`= ?, `address`= ? WHERE id = ?";
  
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
  ];
  
  con.query(q, [...values,userId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
    //return res.json({Status: "Success"})
  });
});
 
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "Delete FROM employees WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "delete employees error in sql"});
        return res.json({Status: "Success"})
    })
})
 
app.get('/adminCount', (req, res) => {
    const sql = "Select count(id) as admin from users";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Error in runnig query"});
        return res.json(result);
    })
})
 
app.get('/employeesCount', (req, res) => {
    const sql = "Select count(id) as employees from employees";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Error in runnig query"});
        return res.json(result);
    })
})
 
app.get('/salary', (req, res) => {
    const sql = "Select sum(salary) as sumOfSalary from employees";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Error in runnig query"});
        return res.json(result);
    })
})
 
app.post('/create', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const salary = req.body.salary;
    const address = req.body.address;
  
    con.query("INSERT INTO employees (name, email, address, salary) VALUES (?, ?, ?, ?)", [name, email, address, salary], 
        (err, result) => {
            if(result){
                res.send(result);
            }else{
                res.send({message: "ENTER CORRECT DETAILS!"})
            }
        }
    )
})


 
app.get('/hash', (req, res) => { 
    bcrypt.hash("123456", 10, (err, hash) => {
        if(err) return res.json({Error: "Error in hashing password"});
        const values = [
            hash
        ]
        return res.json({result: hash});
    } )
})
 
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
        if(result.length > 0) {
            bcrypt.compare(req.body.password.toString(), result[0].password, (err, response)=> {
                if(err) return res.json({Error: "password error"});
                if(response) {
                    const token = jwt.sign({role: "admin"}, "jwt-secret-key", {expiresIn: '1d'});
                    return res.json({Status: "Success", Token: token})
                } else {
                    return res.json({Status: "Error", Error: "Wrong Email or Password"});
                }
            })
        } else {
            return res.json({Status: "Error", Error: "Wrong Email or Password"});
        }
    })
})
 
app.post('/register',(req, res) => {
    const sql = "INSERT INTO users (`name`,`email`,`password`) VALUES (?)"; 
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if(err) return res.json({Error: "Error in hashing password"});
        const values = [
            req.body.name,
            req.body.email,
            hash,
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Error: "Error query"});
            return res.json({Status: "Success"});
        })
    } )
})
 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})