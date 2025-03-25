import { Helmet } from "react-helmet-async";
import AddPlantForm from "../../../components/Form/AddPlantForm";
import { uploadImage } from "../../../api/utils";
import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const AddPlant = () => {
  const { user } = useAuth();
  const [uploadImageText, setUploadImageText] = useState({ name: "Upload" });
  const [loading, setLoading] = useState(false)
  const axiosSecure = useAxiosSecure()
  const navigate = useNavigate()
 
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true)
    const form = e.target;
    const name = form.name.value;
    const category = form.category.value;
    const description = form.description.value;
    const price = parseInt(form.price.value);
    const quantity = parseInt(form.quantity.value);
    const image = form.image.files[0];
    const image_url = await uploadImage(image);

    const seller = {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL,
    };

    const product = {
      name,
      category,
      description,
      price,
      quantity,
      image: image_url,
      seller,
    };

    
    try{
      await axiosSecure.post('/product', product)
      toast.success('Data Added Successfully!')
      navigate('/dashboard/my-inventory')
    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  };
  return (
    <div>
      <Helmet>
        <title>Add Plant | Dashboard</title>
      </Helmet>

      {/* Form */}
      <AddPlantForm
        handleAddProduct={handleAddProduct}
        uploadImageText={uploadImageText}
        setUploadImageText={setUploadImageText}
        loading={loading}
      />
    </div>
  );
};

export default AddPlant;
