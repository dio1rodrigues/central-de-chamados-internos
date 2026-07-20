const fs = require("fs/promises");
const path = require("path");

const buildAttachmentData = (file) => {
  if (!file) {
    return null;
  }

  return {
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,

    path: path
      .relative(process.cwd(), file.path)
      .replaceAll("\\", "/"),
  };
};

const removeUploadedFile = async (file) => {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Não foi possível remover o arquivo enviado:",
        error.message
      );
    }
  }
};

module.exports = {
  buildAttachmentData,
  removeUploadedFile,
};