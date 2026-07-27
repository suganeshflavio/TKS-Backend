import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB - PPT/PPTX slide decks
  },
  fileFilter(req, file, cb) {
    const allowed = [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PPT and PPTX files are allowed."));
    }
  },
});
