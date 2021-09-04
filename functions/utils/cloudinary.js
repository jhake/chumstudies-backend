const cloudinary = require("cloudinary");

module.exports.updateMetadata = async (cloudinaryString, newMetadata) => {
  const cloudinaryData = JSON.parse(cloudinaryString);
  const { public_id, resource_type } = cloudinaryData;

  return await cloudinary.v2.uploader.update_metadata(
    `${process.env.CLOUDINARY_METADATA_EXTERNAL_ID}=${newMetadata}`,
    [public_id],
    {
      resource_type,
    }
  );
};

module.exports.destroy = async (cloudinaryString) => {
  const cloudinaryData = JSON.parse(cloudinaryString);
  const { public_id, resource_type } = cloudinaryData;

  return await cloudinary.v2.uploader.destroy(public_id, {
    resource_type,
  });
};
