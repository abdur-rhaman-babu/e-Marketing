import axios from "axios";

// upload image and return image
export const uploadImage = async (image) => {
  const formData = new FormData();
  formData.append("image", image);

  // send image to img bb
  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    formData
  );

  return data.data.display_url;
};
