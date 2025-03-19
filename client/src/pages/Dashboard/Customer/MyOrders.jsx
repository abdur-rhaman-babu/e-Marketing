import { Helmet } from "react-helmet-async";
import CustomerOrderDataRow from "../../../components/Dashboard/TableRows/CustomerOrderDataRow";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";

const MyOrders = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders?email=${user.email}`);
      return res.data;
    },
  });

  // console.log(orders);

  if (isLoading) return <LoadingSpinner />;
  return (
    <>
      <Helmet>
        <title>My Orders</title>
      </Helmet>
      <div className="container mx-auto">
        {orders.length <= 0 ? (
          <div>No order available</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-3">
            {orders.map((order) => (
              <CustomerOrderDataRow
                key={order._id}
                order={order}
                refetch={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;
