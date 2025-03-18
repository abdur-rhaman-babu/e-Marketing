/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import { useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import DeleteModal from "../../Modal/DeleteModal";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const CustomerOrderCard = ({ order, refetch }) => {
  const axiosSecure = useAxiosSecure();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  const { image, name, quantity, price, status, category, _id, productId } =
    order;

  // delete order/cancellation
  const handleDelete = async () => {
    try {
      await axiosSecure.delete(`/order/${_id}`);

      // increase quantity from product
      await axiosSecure.patch(`product/quantity/${productId}`, {
        quantityToUpdate: quantity,
        status: "increase",
      });

      toast.success("Order cancelled");
      refetch();
    } catch (err) {
      toast.error(err.response.data)
    } finally {
      closeModal();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-3 flex flex-col md:flex-row items-center gap-6 w-full max-w-lg md:max-w-3xl mx-auto border border-gray-200 relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
      >
        <HiOutlineDotsVertical size={24} />
      </button>
      {menuOpen && (
        <div className="absolute top-12 right-4 w-32 bg-white shadow-lg rounded-lg py-2 z-10">
          <button
            onClick={() => {
              setIsOpen(true);
              setMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}
      <img
        src={image}
        alt={name}
        className="w-48 h-full object-cover rounded-lg shadow-md"
      />
      <div className="flex-1 space-y-2">
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-500">
          Category:{" "}
          <span className="font-medium text-gray-700">{category}</span>
        </p>
        <p className="text-sm text-gray-500">
          Quantity:{" "}
          <span className="font-medium text-gray-700">{quantity}</span>
        </p>
        <p className="text-sm text-gray-500">
          Price: <span className="font-medium text-gray-700">${price}</span>
        </p>
        <p
          className={`text-sm font-semibold ${
            status === "Pending" ? "text-yellow-500" : "text-green-500"
          }`}
        >
          Status: {status}
        </p>
      </div>
      <DeleteModal
        handleDelete={handleDelete}
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </div>
  );
};

CustomerOrderCard.propTypes = {
  order: PropTypes.shape({
    image: PropTypes.string,
    name: PropTypes.string,
    quantity: PropTypes.number,
    price: PropTypes.number,
    status: PropTypes.string,
    category: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default CustomerOrderCard;
