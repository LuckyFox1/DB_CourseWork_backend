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
        let request = new sql.Request();

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
            }
        );
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
        let request = new sql.Request();

        // query to the database and get the records
        request.query(
            `INSERT Users 
            VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.login}', '${req.body.password}', '${req.body.dateOfBirth}')`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    });
});

// get agency
app.get('/agency/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT *
            FROM Agency
            WHERE id_agency = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records.recordset);
            }
        );
    });
});

// add agency
app.post('/agency', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `INSERT Agency
            VALUES ('${req.body.email}', '${req.body.phone}', '${req.body.agencyName}')`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    })
});

// update agency
app.put('/agency/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `UPDATE Agency
            SET email = '${req.body.email}', phone = '${req.body.phone}', agency_name = '${req.body.agencyName}'
            WHERE id_agency = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    });
});

// delete agency
app.delete('/agency/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `DELETE Agency
            WHERE id_agency = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    });
});

// get tours by page
app.get('/tours/:page', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT Tour.id_tour, category_name, city, country, tour_name, tour_description, photo,
            (SELECT AVG(CAST(rating AS decimal(6,4))) FROM Rating WHERE Rating.id_tour = Tour.id_tour) AS tour_rating,
            (SELECT COUNT(*) FROM Comment WHERE Comment.id_tour = Tour.id_tour) AS amount_comments
            FROM Tour
            LEFT JOIN Category
            ON Category.id_category = Tour.id_category
            LEFT JOIN Hotel
            ON Hotel.id_hotel = Tour.id_hotel
            LEFT JOIN Cities
            ON Hotel.id_city = Cities.id_city
            LEFT JOIN Countries
            ON Countries.id_country = Cities.id_country
            ORDER BY tour_name OFFSET ${(req.params.page - 1) * 10} ROWS FETCH NEXT 10 ROWS ONLY`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records.recordset);
            }
        );
    })
});

// create tour
app.post('/tour', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `INSERT Tour
            VALUES (${req.body.idAgency}, ${req.body.idCategory}, ${req.body.idHotel},
             '${req.body.tourName}', '${req.body.tourDescription}', '${req.body.photo}')`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    })
});

// update tour information
app.put('/tour/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

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
            }
        );
    })
});

// delete tour
app.delete('/tour/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `DELETE Tour
            WHERE id_tour = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    })
});

// get categories
app.get('/categories', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT *
            FROM Category`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

// add category
app.post('/category', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `INSERT Category
            VALUES ('${req.body.categoryName}')`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records);
            }
        );
    })
});

// update category
app.put('/category/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `UPDATE Category
            SET category_name = '${req.body.categoryName}'
            WHERE id_category = ${req.params.id}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    })
});

// get countries
app.get('/countries', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT *
            FROM Countries`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

// get cities
app.get('/cities', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT *
            FROM Cities`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

//get tour by id
app.get('/tour/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT Tour.id_tour, tour_name, tour_description, photo, email, phone, agency_name, category_name,
            node_order, duration, hotel_name, rating AS hotel_rating, city, country, 
            (SELECT AVG(CAST(rating AS decimal(6,4))) FROM Rating WHERE id_tour = ${req.params.id}) AS tour_rating
            FROM Tour
            JOIN Agency
            ON Agency.id_agency = Tour.id_agency
            JOIN Category
            ON Category.id_category = Tour.id_category
            LEFT JOIN RoutesNode
            ON RoutesNode.id_tour = ${req.params.id}
            JOIN Hotel
            ON Hotel.id_hotel = Tour.id_hotel OR Hotel.id_hotel = RoutesNode.id_hotel
            JOIN Cities
            ON Hotel.id_city = Cities.id_city
            JOIN Countries
            ON Countries.id_country = Cities.id_country
            WHERE Tour.id_tour = ${req.params.id}`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                let recordset = records.recordset;
                let tour = {};
                let routesNodes = [];

                if (recordset.length > 1) {
                    for (let i = 0; i < recordset.length; i++) {
                        routesNodes.push({
                            order: recordset[i].node_order,
                            duration: recordset[i].duration,
                            city: recordset[i].city,
                            country: recordset[i].country,
                            hotel: {
                                name: recordset[i].hotel_name,
                                rating: recordset[i].hotel_rating
                            }
                        })
                    }
                    let tempTour = recordset[0];
                    tour = {
                        idTour: tempTour.id_tour,
                        tourName: tempTour.tour_name,
                        tourDescription: tempTour.tour_description,
                        tourPhoto: tempTour.photo,
                        tourCategory: tempTour.category_name,
                        tourRating: tempTour.tour_rating,
                        agency: {
                            email: tempTour.email,
                            phone: tempTour.phone,
                            name: tempTour.agency_name
                        },
                        routesNodes: routesNodes
                    };
                    res.send(tour);
                } else {
                    res.send(recordset);
                }
            }
        );
    })
});

// get tours packages
app.get('/packages/tour/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT *
            FROM TravelPackage
            WHERE id_tour = ${req.params.id} AND id_user IS NULL`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

// get package by id
app.get('/package/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT *
            FROM TravelPackage
            WHERE id_package = ${req.params.id}`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

// get package services
app.get('/services/package/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT TServices.id_service, TServices.name_service, Tour.id_agency, Agency_Services.price
            FROM TServices
            JOIN Tour
            ON Tour.id_tour IN 
            (SELECT TravelPackage.id_tour
            FROM TravelPackage
            WHERE TravelPackage.id_package = ${req.params.id})
            JOIN Agency_Services
            ON Tour.id_agency = Agency_Services.id_agency AND TServices.id_service = Agency_Services.id_service
            WHERE TServices.id_service IN 
            (SELECT Package_Services.id_service
            FROM Package_Services
            WHERE Package_Services.id_package = ${req.params.id})`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

// get tour services
app.get('/services/tour/package/:id', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `SELECT TServices.id_service, TServices.name_service, Tour.id_tour, Tour.id_agency, Agency_Services.price
            FROM TServices
            JOIN Tour
            ON id_tour IN 
            (SELECT id_tour
            FROM TravelPackage
            WHERE TravelPackage.id_package = ${req.params.id})
            JOIN Agency_Services
            ON Tour.id_agency = Agency_Services.id_agency AND TServices.id_service = Agency_Services.id_service`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records.recordset);
            }
        );
    })
});

// buy travel package
app.put('/package/:packageId/user/:userId', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `UPDATE TravelPackage
            SET id_user = ${req.params.userId}
            WHERE id_package = ${req.params.packageId}`,
            function (err, records) {

                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }

                res.send(records);
            }
        );
    })
});

// add service to travel package
app.post('/package/service', function (req, res) {
    sql.close();

    sql.connect(config, function (err) {
        if (err) {
            res.status(err.status || 500).json({err: err.message || ""});
        }

        let request = new sql.Request();

        request.query(
            `INSERT Package_Services
            VALUES (${req.body.packageId}, ${req.body.serviceId})`,
            function (err, records) {
                if (err) {
                    res.status(err.status || 500).json({err: err.message || ""});
                }
                res.send(records);
            }
        );
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
