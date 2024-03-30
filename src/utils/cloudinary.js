// The code is a JavaScript module that exports an asynchronous function called uploadOnCloudinary. This function is used to upload a file to Cloudinary, a cloud-based image and video management service. Here's a breakdown of the code:

// Importing necessary modules:

// cloudinary: This is the main module for interacting with Cloudinary's services. It's imported from the cloudinary package.
// fs: This is the file system module provided by Node.js. It's used to read and write files on the local system.

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //This is file system provided by node js. It can be used to open, read, write, etc

// Configuring Cloudinary credentials: The cloudinary.config() function is used to set the Cloudinary credentials like cloud_name, api_key, and api_secret. These are fetched from environment variables, promoting security by not hard-coding the credentials.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Defining the uploadOnCloudinary function: This function takes a single argument localFilePath, which is the local path to the file to be uploaded. It performs the following operations:

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Checking if the file path is valid: If the file path is falsy (empty, null, or undefined), the function returns null.
    if (!localFilePath) return null;
    //upload the file on cloudinary

    // Uploading the file to Cloudinary: Using the cloudinary.uploader.upload() function, the local file gets uploaded to Cloudinary. The resource_type parameter is set to "auto" to automatically detect the file type.

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    //console.log("File is uploaded on Cloudinary", response.url);

    // Handling the response: If the file is uploaded successfully, the response is returned. If the operation fails, the local file is deleted and null is returned.
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Cleaning up the local file: After the file is uploaded or uploading fails, the local file is removed using the fs.unlinkSync() function.
    fs.unlinkSync(localFilePath);
    //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
