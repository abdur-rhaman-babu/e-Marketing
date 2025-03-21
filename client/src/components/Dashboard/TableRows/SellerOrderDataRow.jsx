import PropTypes from "prop-types";
import { useState } from "react";
import DeleteModal from "../../Modal/DeleteModal";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
const SellerOrderDataRow = ({ order, refetch }) => {
  const axiosSecure = useAxiosSecure();
  let [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  const { customer, price, quantity, address, status, productId, _id } =
    order || {};

  // handle delete order
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
      toast.error(err.response.data);
    } finally {
      closeModal();
    }
  };

  // handle change status
  const handleChangeStatus = async (newStatus) => {
    if (status === newStatus) return;
    try {
      await axiosSecure.patch(`/order/${_id}`, { status: newStatus });
      toast.success("Status updated successfully!");
      refetch();
    } catch (err) {
      toast.error(err.response.data);
    } finally {
      closeModal();
    }
  };
  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{customer?.name}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{customer?.email}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">${price}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{quantity}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{address}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{status}</p>
      </td>

      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center gap-2">
          <select
            required
            onChange={(e) => handleChangeStatus(e.target.value)}
            defaultValue={status}
            className="p-1 border-2 border-lime-300 focus:outline-lime-500 rounded-md text-gray-900 whitespace-no-wrap bg-white"
            name="category"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">Start Processing</option>
            <option value="Delivered">Deliver</option>
          </select>
          <button
            onClick={() => setIsOpen(true)}
            className="relative disabled:cursor-not-allowed cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
            ></span>
            <span className="relative">Cancel</span>
          </button>
        </div>
        <DeleteModal
          isOpen={isOpen}
          closeModal={closeModal}
          handleDelete={handleDelete}
        />
      </td>
    </tr>
  );
};

SellerOrderDataRow.propTypes = {
  order: PropTypes.object,
  refetch: PropTypes.func,
};

export default SellerOrderDataRow;
