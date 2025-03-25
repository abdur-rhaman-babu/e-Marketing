import Container from "../../components/Shared/Container";
import { Helmet } from "react-helmet-async";
import Heading from "../../components/Shared/Heading";
import Button from "../../components/Shared/Button/Button";
import PurchaseModal from "../../components/Modal/PurchaseModal";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import useRole from "./../../hooks/useRole";

const PlantDetails = () => {
  const [role] = useRole();
  const { user } = useAuth();
  const { id } = useParams();
  let [isOpen, setIsOpen] = useState(false);

  const {
    data: product = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/product/${id}`
      );

      return res.data;
    },
  });

  // console.log(product);

  const { name, category, image, description, price, quantity, seller } =
    product || {};

  const closeModal = () => {
    setIsOpen(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container>
      <Helmet>
        <title>{name}</title>
      </Helmet>
      <div className="mx-auto flex flex-col lg:flex-row justify-between w-full gap-12">
        {/* Plant Image */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="w-full overflow-hidden rounded-xl">
            <img className="object-cover w-full" src={image} alt={name} />
          </div>
        </div>

        {/* Plant Details */}
        <div className="md:gap-10 flex-1">
          <Heading title={name} subtitle={`Category: ${category}`} />
          <hr className="my-6" />
          <div className="text-lg font-light text-neutral-500">
            {description}
          </div>
          <hr className="my-6" />

          {/* Seller Info */}
          <div className="text-xl font-semibold flex flex-row items-center gap-2">
            <div>Seller: {seller?.name}</div>
            {seller?.image ? (
              <img
                className="rounded-full"
                height="30"
                width="30"
                alt="Seller Avatar"
                referrerPolicy="no-referrer"
                src={seller.image}
              />
            ) : (
              <div className="w-[30px] h-[30px] bg-gray-300 rounded-full flex items-center justify-center">
                ❓
              </div>
            )}
          </div>
          <hr className="my-6" />

          {/* Quantity */}
          <p className="gap-4 font-light text-neutral-500">
            Quantity: {quantity ?? 0} Units Left Only!
          </p>
          <hr className="my-6" />
          <div className="flex justify-between">
            <p className="font-bold text-3xl text-gray-500">Price: {price}$</p>
            <div>
              <Button
                disabled={
                  !user ||
                  user?.email === seller?.email ||
                  role !== "customer" ||
                  quantity === 0
                }
                onClick={() => setIsOpen(true)}
                label={quantity > 0 ? "Purchase" : "Out of Stock"}
              />
            </div>
          </div>
          <hr className="my-6" />

          {/* Purchase Modal */}
          <PurchaseModal
            product={product}
            closeModal={closeModal}
            isOpen={isOpen}
            refetch={refetch}
          />
        </div>
      </div>
    </Container>
  );
};

export default PlantDetails;
