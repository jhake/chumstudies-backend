const cloudinary = require("cloudinary");

module.exports.validateAttachment = async (cloudinaryString) => {
  const cloudinaryData = JSON.parse(cloudinaryString);
  const { public_id, resource_type } = cloudinaryData;

  return await cloudinary.v2.uploader.update_metadata(
    `${process.env.CLOUDINARY_METADATA_EXTERNAL_ID}=YES`,
    [public_id],
    {
      resource_type,
    }
  );
};

module.exports.destroyFile = async (cloudinaryString) => {
  const cloudinaryData = JSON.parse(cloudinaryString);
  const { public_id, resource_type } = cloudinaryData;

  return await cloudinary.v2.uploader.destroy(public_id, {
    resource_type,
  });
};
