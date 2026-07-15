// import cloudinary from "../config/cloudinary";
// import streamifier from "streamifier";

// export const uploadToCloudinary = (file: Express.Multer.File) => {

//     return new Promise<any>((resolve, reject) => {

//         const stream = cloudinary.uploader.upload_stream(

//             {
//                 folder: "tks/videos/notes",
//                 resource_type: "raw"
//             },

//             (error, result) => {

//                 if (error) return reject(error);

//                 resolve(result);

//             }

//         );

//         streamifier.createReadStream(file.buffer).pipe(stream);

//     });

// };


import cloudinary from "../config/cloudinary";
import fs from "fs";

export const uploadToCloudinary = async (
  file: Express.Multer.File
) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "tks/videos/notes",
    resource_type: "raw",
  });

  // Delete temporary file
  fs.unlinkSync(file.path);

  return result;
};