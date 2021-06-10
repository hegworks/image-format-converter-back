import express, { urlencoded, json } from "express";
import multer, { diskStorage } from "multer";
import gm from "gm";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") +
        Math.random() +
        file.originalname.match(/(.*)(\.[0-9a-z]+$)/)[2]
    );
  },
});

const fileFilter = (req, file, cb) => {
  const type = file.mimetype.split("/")[0];
  if (type === "image") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
  fileFilter: fileFilter,
});

// CORS handling
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested_With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    return res.status(200).json({});
  }
  next();
});

// Convert url encoded data to json
app.use(urlencoded({ extended: false }));
app.use(json());

app.post("/convert", upload.single("image"), (req, res) => {
  const file = req.file;
  const format = req.body.format;
  const inputPath = file.path;
  const outputPath = `${file.destination}/${
    file.filename.match(/(.*)(\.[0-9a-z]+$)/)[1]
  }.${format}`;

  gm(inputPath).write(outputPath, (err, stdout, stderr, cmd) => {
    if (err) console.log(err);
    else {
      console.log(cmd);
      res.sendFile(__dirname + outputPath.slice(1));
    }
  });
});

app.listen(process.env.PORT || 2999);
