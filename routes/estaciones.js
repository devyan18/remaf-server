const router = require('express').Router();
const conexion = require('./../config/conexion');
const { check, validationResult, param } = require('express-validator');

const cors = require('cors');
const { json } = require('express');
// asignamos las rutas

// get estaciones

router.get('/estaciones', check(), (req, res) => {
  try {
    let sql = `select * from estaciones where fecha_baja is null`;
    conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else {
        res.json(rows);
      }
    });
  } catch (error) {
    return res.status(400).json({ errors: errors.array() });
  }
});

// add estaciones

router.put(
  '/estaciones/:id',
  check('nombre', 'nombre is required').exists().not().isEmpty(),
  check('id_localidad', 'id_localidad is required').exists().not().isEmpty(),
  check('direccion', 'direccion is required').exists().not().isEmpty(),
  check('latitude', 'latitude is required').exists().not().isEmpty(),
  check('longitude', 'longitude is required').exists().not().isEmpty(),
  (req, res) => {
    const { id } = req.params;
    const { nombre, id_localidad, direccion, latitude, longitude } = req.body;
    console.log(id);
    try {
      let sql = `update estaciones set
    descri_estaciones = '${nombre}',
    direccion_estaciones = '${direccion}',
    rela_localidad = '${id_localidad}',
    latitude = '${latitude}',
    longitude = '${longitude}'
    where id_estaciones = '${id}'`;

      conexion.query(sql, (err, rows, fields) => {
        if (err) {
          throw err;
        } else {
          res.json({ status: 'Estacion modificada!' });
        }
      });
    } catch (error) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);

// update estaciones

router.post(
  '/estaciones/',
  check('nombre', 'nombre is required').exists().not().isEmpty(),
  check('id_localidad', 'id_localidad is required').exists().not().isEmpty(),
  check('direccion', 'direccion is required').exists().not().isEmpty(),
  check('latitude', 'latitude is required').exists().not().isEmpty(),
  check('longitude', 'longitude is required').exists().not().isEmpty(),
  (req, res) => {
    const { nombre, id_localidad, direccion, latitude, longitude } = req.body;
    console.log(req.body);
    try {
      let sql = `INSERT into estaciones (descri_estaciones,direccion_estaciones,rela_localidad,latitude,longitude) VALUES ('${nombre}','${direccion}','${id_localidad}','${latitude}','${longitude}')`;

      conexion.query(sql, (err, rows, fields) => {
        if (err) {
          throw err;
        } else {
          res.json({ status: 'Estacion agregada!' });
        }
      });
    } catch (error) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);

// delete estaciones

router.delete('/estaciones/:id', (req, res) => {
  const { id } = req.params;
  let sql = `UPDATE estaciones set 
    fecha_baja is null where id_estaciones = '${id}'`;
  try {
    conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else {
        res.json({ status: 'Estacion Eliminada' });
      }
    });
  } catch (error) {
    return res.status(400).json({ errors: errors.array() });
  }
});

//get all localidades

router.get('/localidades', (req, res) => {
  try {
    let sql = `select * from localidades`;
    conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else {
        res.json(rows);
      }
    });
  } catch (error) {
    return res.status(400).json({ errors: errors.array() });
  }
});

// get ultima medicion de la estacion

router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    let sql = `SELECT * FROM sensores,estaciones WHERE rela_estaciones=id_estaciones 
    and id_estaciones='${id}' and fecha_baja is null ORDER by id_sensores DESC LIMIT 1 `;
    conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else {
        res.json(rows);
      }
    });
  } catch (error) {
    return res.status(400).json({ errors: errors.array() });
  }
});

// get todas las mediciones de un estacion en una fecha

router.get('/:id/:date', param('date').isISO8601().isDate(), (req, res) => {
  const { id, date } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let sql = `SELECT * FROM sensores,estaciones WHERE rela_estaciones=id_estaciones 
    and fecha_baja is null and id_estaciones='${id}'  
    and DATE_FORMAT(date_estaciones,'%Y-%m-%d') = '${date}' ORDER by id_sensores DESC`;
    conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else {
        res.json(rows);
      }
    });
  } catch (error) {
    return res.status(400).json({ errors: errors.array() });
  }
});

// get todas las mediciones de un estacion en un periodo

router.get(
  '/:id/:dateDesde/:dateHasta',
  param('dateDesde').isISO8601().isDate(),
  param('dateHasta').isISO8601().isDate(),
  (req, res) => {
    const { id, dateDesde, dateHasta } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let sql = `SELECT * FROM sensores,estaciones WHERE rela_estaciones=id_estaciones 
        and fecha_baja is null and id_estaciones='${id}'  
        and   date_estaciones > '${dateDesde}' and date_estaciones >= '${dateHasta}' ORDER by id_sensores DESC`;
      conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
          res.json(rows);
        }
      });
    } catch (error) {
      res.json(error);
    }
  }
);

// ultima medicion de cada estacion

router.get('/', (req, res) => {
  try {
    let sql = `SELECT
    id_estaciones as id,
    descri_estaciones as nombre,
    direccion_estaciones as direccion,
    latitude as latitud,
    longitude as longitud,
    localidades.descri_localidad as localidad,
    sensores.temperatura_sensores as temperatura,
    sensores.humedad_sensores as humedad,
	sensores.precipitacion_sensores as precipitacion,
	sensores.direcc_viento_sensores as direcc_viento,
	sensores.veloc_viento_sensores as veloc_viento,
    sensores.date_estaciones as fecha
    FROM estaciones
    INNER JOIN localidades 
    ON localidades.id_localidad = estaciones.rela_localidad
    INNER JOIN sensores 
    ON estaciones.ultima_medicion_sensores = sensores.id_sensores
    where fecha_baja is null`;
    conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else {
        res.json(rows);
      }
    });
  } catch (error) {
    return res.status(400).json({ errors: errors.array() });
  }
});

// -------------------
router.post('/', cors(), async function (req, res) {
  const { temp, hume, prec, dir, vel, estacion } = await req.body;
  if (temp == '' || !temp) {
    res.json({ status: 'datos incompletos' });
  } else {
    try {
      let sql = `insert into sensores(temperatura_sensores,
            humedad_sensores,
            precipitacion_sensores,
            direcc_viento_sensores,
            veloc_viento_sensores,
            rela_estaciones) 
            values('${temp}'
            ,'${hume}'
            ,'${prec}'
            ,'${dir}'
            ,'${vel}'
            ,'${estacion}');`;
      conexion.query(sql, (err, rows, fields, result) => {
        if (err) {
          res.json(err);
        } else {
          const id = rows.insertId;
          // actualizamos la ultima medicion de la tabla estaciones
          let sql = `UPDATE estaciones SET
                    ultima_medicion_sensores = '${id}'
                    where id_estaciones = '${estacion}';`;
          conexion.query(sql, (err, rows, fields) => {
            if (err) {
              res.json(err);
            } else {
              // damos de baja la medicion actual anterior

              res.json({ status: 'Lectura del sensor agregada' });
            }
          });
        }
      });
    } catch (error) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
});

module.exports = router;
