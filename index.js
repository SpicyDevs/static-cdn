const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const basicAuth = require("express-basic-auth");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use("/img", express.static(path.join(__dirname, "img")));

const upload = multer({ dest: "img/" }); // Set the destination folder for uploaded files

// Define the username and password for authentication
const users = {
  12: "12",
  aauysh: "aayush1234",
  sahil: "SahilOp1234",
};

// Middleware to check for basic authentication
app.use(
  basicAuth({
    users: users,
    challenge: true,
    unauthorizedResponse: "Unauthorized",
    // Exclude /img from authentication
    authorizer: (username, password, req) => {
      if (req && req.originalUrl && req.originalUrl.startsWith("/img")) {
        return true; // Allow access to /img without authentication
      }
      return basicAuth.safeCompare(username, password, users);
    },
  })
);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/images", (req, res) => {
  const imgFolderPath = path.join(__dirname, "img");

  fs.readdir(imgFolderPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    let images = [];

    files.forEach((file) => {
      const imageUrl = `/img/${file}`;
      const imageLink = `<a href="${imageUrl}">${file}</a>`;
      images.push(imageLink);
    });
    res.send(images.join("<br>"));
  });
});

app.post("/upload", upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  req.files.forEach((file) => {
    if (!file) {
      console.error(
        `Invalid file object or buffer is undefined for file: ${file.originalname}`
      );
      return res
        .status(500)
        .send(
          `Invalid file object or buffer is undefined for file: ${file.originalname}`
        );
    }

    const uploadFile = fs.readFileSync(file.path);
    const fileName = file.originalname;
    const uploadPath = path.join(__dirname, "img", fileName);

    // Use fs.writeFile to save the buffer to a file
    fs.writeFile(uploadPath, uploadFile, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
    });
  });

  res.status(200).send("Files uploaded successfully.");
});

// Dynamically load all images in /img
app.listen(80, () => {
  console.log("Server is running on port 80");
});
