const cloudinary = require("../config/cloudnary");

exports.uploadBase64 = async (base64, folder = "blogs") => {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder,
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (err) {
    throw new Error("Image upload failed");
  }
};

exports.deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    throw new Error("Image deletion failed");
  }
};
