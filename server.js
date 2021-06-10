const express = require("express");
const multer = require("multer");
const gm = require("gm");
const app = express();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads");
	},
	filename: function (req, file, cb) {
		cb(
			null,
			new Date().toISOString().replace(/:/g, "-") + file.originalname
		);
	}
});

const fileFilter = (req, file, cb) => {
	const type = file.mimetype.split("/")[0];
	if (type === "image" || type === "video") {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 20
	},
	fileFilter: fileFilter
});


app.post("/convert", upload.single("postmedia"), (req, res) => {
	const input = req.file;
	const outputpath = ".\\" + input.path + "" + ".png";
	gm(".\\" + input.path).write(outputpath, function (err) {
		if (err) console.log(err);
		else {
			console.log("done");
			res.sendFile(__dirname + outputpath.slice(1));
		}
	});
	// res.send("Hello World");
});

app.listen(process.env.PORT || 2999);
