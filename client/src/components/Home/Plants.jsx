import Card from "./Card";
import Container from "../Shared/Container";
import LoadingSpinner from "../Shared/LoadingSpinner";
import useProduct from "../../hooks/useProduct";

const Plants = () => {
  const {data: products, isLoading} = useProduct();
  // console.log(products)
  if (isLoading) return <LoadingSpinner />;
  return (
    <Container>
      {products && products.length > 0 ? (
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {
            products.map(product=><Card key={product._id} product={product}/>)
          }
        </div>
      ) : (
        <p>No data Available</p>
      )}
    </Container>
  );
};

export default Plants;
