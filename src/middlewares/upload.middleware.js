const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "tickets"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const allowedMimeTypes = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const storedName =
      `${crypto.randomUUID()}${extension}`;

    callback(null, storedName);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedExtensions =
    allowedMimeTypes[file.mimetype];

  const isValidMimeType =
    Array.isArray(allowedExtensions);

  const isValidExtension =
    allowedExtensions?.includes(extension);

  if (!isValidMimeType || !isValidExtension) {
    const error = new Error(
      "Envie apenas arquivos PDF, PNG, JPG ou JPEG."
    );

    error.code = "INVALID_FILE_TYPE";

    callback(error);
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter,
});

const uploadTicketAttachment = (
  req,
  res,
  next
) => {
  upload.single("attachment")(
    req,
    res,
    (error) => {
      if (!error) {
        next();
        return;
      }

      if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
      ) {
        req.fileUploadError =
          "O arquivo deve possuir no máximo 5 MB.";

        next();
        return;
      }

      if (error.code === "INVALID_FILE_TYPE") {
        req.fileUploadError = error.message;

        next();
        return;
      }

      next(error);
    }
  );
};

module.exports = {
  uploadTicketAttachment,
};