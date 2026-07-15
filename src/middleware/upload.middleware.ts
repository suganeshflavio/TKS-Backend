// // import multer from "multer";

// // const storage = multer.memoryStorage();

// // export const upload = multer({
// //   storage,
// //   limits: {
// //     fileSize: 50 * 1024 * 1024, // 50 MB
// //   },
// // });

// import multer from "multer";

// const storage = multer.memoryStorage();

// export const upload = multer({
//     storage,

//     limits: {
//         fileSize: 10 * 1024 * 1024 //10MB
//     },

//     fileFilter(req, file, cb) {

//         const allowed = [
//             "application/pdf",

//             "application/vnd.ms-powerpoint",

//             "application/vnd.openxmlformats-officedocument.presentationml.presentation"
//         ];

//         if (allowed.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error("Only PDF, PPT and PPTX allowed"));
//         }
//     }
// });


import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter(req, file, cb) {
    const allowed = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, PPT and PPTX files are allowed."));
    }
  },
});