import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useProduct = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      return res.data;
    },
  });
  return { data, isLoading };
};

export default useProduct;
