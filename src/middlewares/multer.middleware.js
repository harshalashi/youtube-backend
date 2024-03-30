import multer from "multer";

// cb is short form for callback

// Setting up the multer.diskStorage object: This is a configuration for multer, which specifies the storage and naming details for the uploaded files.
const storage = multer.diskStorage({
  // The destination function is used to specify the folder where the files will be temporarily saved, and the filename function is used to define the file naming convention
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
