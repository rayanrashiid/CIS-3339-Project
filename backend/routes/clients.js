// This file stores all the API endpoints for making calls to the "clients" collection in the MongoDB database

// Import functionalities
const express = require('express');
const router = express.Router();

// Middleware for authorization. For API calls that require authorization, this middleware checks if the header of API calls have a valid security token. If no security token or invalid security token, then the API call is not made.
const authMiddleWare = require('../auth/authMiddleWare');

// importing data model schemas
const { clients, events } = require('../models/models');
const { ObjectId } = require('mongodb');

// reading the org id from the environment variable
const org = process.env.ORG_ID;

// API Endpoint to Get all clients
router.get('/', authMiddleWare, async (req, res) => {
  try {
    const cli = await clients.find({});
    res.json(cli);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API endpoint to GET single client by ID
router.get('/id/:id', authMiddleWare, (req, res, next) => {
  clients.findOne({ _id : req.params.id, orgs: org }, (error, data) => {
    if (error) {
      return next(error);
    } else if (!data) {
      res.status(400).send('Client not found');
    } else {
      res.json(data);
    }
  });
});

// API endpoint to GET entries based on search query
// Ex: '...?firstName=Bob&lastName=&searchBy=name'
router.get('/search', authMiddleWare, (req, res, next) => {
  const dbQuery = { orgs: org };
  let queryArray = [];
  let regexOptions = 'i';

  switch (req.query.searchBy) {
    case "name":
      if (req.query.firstName) {
        const firstNameRegex = new RegExp(
          `.*${req.query.firstName}.*`,
          regexOptions
        );
        queryArray.push({ firstName: { $regex: firstNameRegex } });
      }
      if (req.query.lastName) {
        const lastNameRegex = new RegExp(
          `.*${req.query.lastName}.*`,
          regexOptions
        );
        queryArray.push({ lastName: { $regex: lastNameRegex } });
      }
      break;
    case "number":
      if (req.query.phoneNumber) {
        const phoneNumberRegex = new RegExp(
          `.*${req.query.phoneNumber}.*`,
          regexOptions
        );
        queryArray.push({
          "phoneNumber.primary": { $regex: phoneNumberRegex },
        });
      }
      break;
    default:
      return res.status(400).send("invalid searchBy");
  }

  dbQuery["$and"] = queryArray;
  clients.find(dbQuery, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// POST create new client
router.post('/', authMiddleWare, (req, res, next) => {
  const newClient = req.body;
  newClient.orgs = [org];
  clients.create(newClient, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).send("New client created successfully");
    }
  });
});

// API endpoint to PUT update client
router.put("/update/:id", authMiddleWare, (req, res, next) => {
  clients.findByIdAndUpdate(req.params.id, req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      if (!data)
        res.status(400).send("Client not found.")
      else
        res.status(201).send("Client updated successfully");
    }
  });
});

// API endpoint to hard delete client by ID, can be only be done if client is not signed up for events
router.delete("/:id", authMiddleWare, (req, res, next) => {
  clients.findOne({ _id : req.params.id, orgs: org }, (error, data) => {
    if (error) {
      return next(error);
    } else if (!data) {
      res.status(400).send("Client not found");
    } else {
      events.find({ attendees: req.params.id, org: org }, (error, data) => {
        if (error) {
          return next(error);
        } else {
          // only delete event if no client is not signed up for any event
          if (data.length === 0)
            clients.findByIdAndDelete(req.params.id, (error, data) => {
              if (error) {
                return next(error);
              } else if (!data) {
                res.status(400).send('Client not found');
              } else {
                res.status(200).send("Client deleted successfully");
              }
            });
          else 
            res.status(406).send("Client is signed up for events and can't be deleted.");
        }
      });
    }
  });
});

// GET clients by zip code for dashboard
router.get('/byzip', (req, res, next) => {
  clients.aggregate(
    [
      {
        $match: {
          "address.zip": { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$address.zip",
          count: { $sum: 1 }
        }
      }
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        return res.json(data);
      }
    }
  );
});

module.exports = router;
