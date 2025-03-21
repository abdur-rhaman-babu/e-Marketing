import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { uploadImage } from "./../../api/utils";
import { useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */
const UpdatePlantForm = ({ id, setIsEditModalOpen, refetch }) => {
  const [uploadImageText, setUploadImageText] = useState({
    name: "Upload Image",
  });
  const axiosSecure = useAxiosSecure();

  const { data: product = {} } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/product/${id}`);
      return data;
    },
  });

  const { name, category, image, description, price, quantity } = product || {};

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedName = form.name.value;
    const updatedCategory = form.category.value;
    const updatedDescription = form.description.value;
    const updatedPrice = parseInt(form.price.value);
    const updatedQuantity = parseInt(form.quantity.value);
    const newImageFile = form.image.files[0];

    let image_url = image; // Default to existing image
    if (newImageFile) {
      image_url = await uploadImage(newImageFile); // Upload new image if provided
    }

    const updateProduct = {
      name: updatedName,
      category: updatedCategory,
      description: updatedDescription,
      price: updatedPrice,
      quantity: updatedQuantity,
      image: image_url,
    };

    try {
      const { data } = await axiosSecure.put(`/product/${id}`, updateProduct);
      if (data.modifiedCount > 0) {
        toast.success("Product Updated Successfully!");
        refetch();
      }
      console.log("Update success", data);
    } catch (err) {
      toast.error(err.response?.data || "Update failed");
    } finally {
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50">
      <form onSubmit={handleUpdateProduct}>
        <div className="grid grid-cols-1 gap-10">
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-1 text-sm">
              <label htmlFor="name" className="block text-gray-600">Name</label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                name="name"
                defaultValue={name}
                id="name"
                type="text"
                placeholder="Product Name"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1 text-sm">
              <label htmlFor="category" className="block text-gray-600">Category</label>
              <select
                required
                className="w-full px-4 py-3 border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                name="category"
                defaultValue={category}
              >
                <option value="Fashion">Fashion</option>
                <option value="Electric">Electric</option>
                <option value="Furniture">Furniture</option>
                <option value="Grocery">Grocery</option>
                <option value="Health">Health</option>
                <option value="Beauty">Beauty</option>
                <option value="Kids">Kids</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1 text-sm">
              <label htmlFor="description" className="block text-gray-600">Description</label>
              <textarea
                defaultValue={description}
                id="description"
                placeholder="Write plant description here..."
                className="block rounded-md focus:lime-300 w-full h-32 px-4 py-3 text-gray-800 border border-lime-300 bg-white focus:outline-lime-500"
                name="description"
              ></textarea>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            {/* Price & Quantity */}
            <div className="flex justify-between gap-2">
              <div className="space-y-1 text-sm">
                <label htmlFor="price" className="block text-gray-600">Price</label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                  name="price"
                  id="price"
                  type="number"
                  placeholder="Price per unit"
                  defaultValue={price}
                  required
                />
              </div>

              <div className="space-y-1 text-sm">
                <label htmlFor="quantity" className="block text-gray-600">Quantity</label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                  name="quantity"
                  id="quantity"
                  type="number"
                  placeholder="Available quantity"
                  defaultValue={quantity}
                  required
                />
              </div>
            </div>

            {/* Show current image */}
            {image && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Current Image:</p>
                <img src={image} alt="Current" className="w-20 h-20 object-cover rounded" />
              </div>
            )}

            {/* Image Upload */}
            <div className="p-4 w-full m-auto rounded-lg flex-grow">
              <div className="file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg">
                <div className="flex flex-col w-max mx-auto text-center">
                  <label>
                    <input
                      className="text-sm cursor-pointer w-36 hidden"
                      onChange={(e) => setUploadImageText(e.target.files[0] || { name: "Upload Image" })}
                      type="file"
                      name="image"
                      id="image"
                      accept="image/*"
                    />
                    <div className="bg-lime-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-lime-500">
                      {uploadImageText.name}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-lime-500"
            >
              Update Plant
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdatePlantForm;
