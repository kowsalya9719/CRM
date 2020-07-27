const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;

const dbURL =
  "mongodb+srv://kowsalya:kowsalya123@cluster0.yuvsh.mongodb.net/studentDetails?retryWrites=true&w=majority";

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("your app is running in", port));
app.post("/registration", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("RegisteredData");
    db.collection("team").findOne({ email: req.body.email }, (err, data) => {
      if (err) throw err;
      if (data) {
        res.status(400).json({ message: "Email already exists..!!" });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, cryptPassword) => {
            if (err) throw err;
            req.body.password = cryptPassword;
            db.collection("team").insertOne(req.body, (err, result) => {
              if (err) throw err;
              client.close();
              res
                .status(200)
                .json({ message: " Registration successful..!! " });
            });
          });
        });
      }
    });
  });
});
app.get("/registration", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("RegisteredData");
    db.collection("team")
      .find()
      .toArray()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(404).json({
          message: "No data Found or some error happen",
          error: err,
        });
      });
  });
});



app.post("/login", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    client.db("RegisteredData").collection("team")
      .findOne({ email: req.body.email }, (err, data) => {
        if (err) throw err;
        if (data) {
          bcrypt.compare(req.body.password, data.password, (err, validUser) => {
            if (err) throw err;
            if (validUser) {
              jwt.sign({ userId: data._id, email: data.email }, "QMrB89LyGGYkQh1b", { expiresIn: "2h" },
                (err, token) => {
                  res.status(200).json({ message: "Login success..!!", token });
                }
              );
            }
            else {
              res
                .status(403)
                .json({ message: "Bad Credentials, Login unsuccessful..!!" });
            }
          });
        } else {
          res.status(401).json({
            message: "Email is not registered, Kindly register..!!",
          });
        }
      });
  });
});
app.get("/login", authenticatedUser, (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("RegisteredData");
    db.collection("team")
      .find()
      .toArray()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(404).json({
          message: "No data Found or some error happen",
          error: err,
        });
      });
  });
});

function authenticatedUser(req, res, next) {
  if (req.headers.authorization == undefined) {
    res.status(401).json({
      message: "No token available in headers",
    });
  } else {
    jwt.verify(
      req.headers.authorization,
      "QMrB89LyGGYkQh1b",
      (err, decodedString) => {
        if (decodedString == undefined) {
          res.status(401).json({ message: "Invalid Token" });
        } else {
          console.log(decodedString);
          next();
        }
      }
    );
  }
}



app.put("/admin/:id", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("RegisteredData")
      .collection("team")
      .findOneAndUpdate({ id: req.params.id }, { $set: req.body })
      .then((data) => {
        console.log("admin approval update successfully..!!");
        client.close();
        res.status(200).json({
          message: "admin approval updated..!!",
        });
      });
  });
});

app.put("/rights/:id", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("RegisteredData")
      .collection("team")
      .findOneAndUpdate({ id: req.params.id }, { $set: req.body })
      .then((data) => {
        console.log("rights update successfully..!!");
        client.close();
        res.status(200).json({
          message: "rights updated..!!",
        });
      });
  });
});


