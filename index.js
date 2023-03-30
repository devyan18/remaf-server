const express = require('express');

const cors = require('cors')

const port = (process.env.PORT || 3000)

const app = express();

//admitir tipos de datos
app.use(express.json())
app.use(cors())

require('./config/conexion');


// configurar cors

var allowlist = []
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
  }

// configurar puerto

app.set('port',port)

// rutas

app.use('/api',require('./routes/estaciones'))



// iniciar express
app.listen(app.get('port'),(error)=>{
    if (error) {
        console.log('error al iniciar servidor: '+ error)
    } else {
       console.log('Servidor inicado en el puerto '+port) 
    }
})