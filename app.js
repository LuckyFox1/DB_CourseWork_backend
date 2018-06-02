var express = require('express');
var path = require('path');
var sql = require("mssql");
var bodyParser = require('body-parser')

var app = express();

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// config for your database
var config = {
    user: 'user',
    password: 'user',
    server: 'localhost',
    database: 'toursdb'
};

// for login user
app.post('/login', function (req, res) {

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {

        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(
            `select user_login 
            from Users 
            WHERE user_login = '${req.body.login}' AND user_password = '${req.body.password}'`,
            function (err, records) {

            if (err) {
                res.status(err.status || 500).json({err: err.message || ""});
            }

            // send records as a response
            if (records.recordset.length === 0) {
                res.send({success: false});
            } else {
                res.send({
                    success: true,
                    login: records.recordset
                });
            }
        });
    });
});

// registry user
app.post('/registry', function (req, res) {

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {

        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(
            `INSERT Users 
            VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.login}', '${req.body.password}', '${req.body.dateOfBirth}')`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            });
    });
});

// get tours by page
app.get('/tours/:page', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        var request = new sql.Request();

        request.query(
            `SELECT *
            FROM Tour
            ORDER BY tour_name OFFSET ${(req.params.page - 1) * 10} ROWS FETCH NEXT 10 ROWS ONLY`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records.recordset);
            });
    })
});

// create tour
app.post('/tour', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        var request = new sql.Request();

        request.query(
            `INSERT Tour
            VALUES (${req.body.idAgency}, ${req.body.idCategory}, ${req.body.idHotel},
             '${req.body.tourName}', '${req.body.tourDescription}', '${req.body.photo}')`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            });
    })
});

// update tour information
app.put('/tour/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        var request = new sql.Request();

        request.query(
            `UPDATE Tour
            SET id_agency = ${req.body.idAgency}, id_category = ${req.body.idCategory},
            id_hotel = ${req.body.idHotel}, tour_name = '${req.body.tourName}',
            tour_description = '${req.body.tourDescription}', photo = '${req.body.photo}'
            WHERE id_tour = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            });
    })
});

// delete tour
app.delete('/tour/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        var request = new sql.Request();

        request.query(
            `DELETE Tour
            WHERE id_tour = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            });
    })
});

var server = app.listen(5000, function () {
    console.log('Server is running..');
});

app.use((req, res, next) => {
    const err = new Error(`Not Found ${req.path}`);

    err.status = 404;
    next(err);
});

app.use((error, req, res, next) => {
    if (error) {
        return res.status(400).json({error: error.message || ""});
    }
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({err: err.message || ""});
});
