const mysql = require('mysql2');
require('dotenv').config()
const conexion = mysql.createConnection({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT_DATABASE,
});
// console.log(process.env.PORT_DATABASE)

conexion.connect((err)=>{
    if (err) {
        console.log('ha ocurrido un error'+ err)
    } else {
        console.log('la base de datos se conecto')
    }
});

module.exports = conexion;