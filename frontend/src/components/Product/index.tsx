import { useEffect, useState } from "react"
import getProducts from "~/services/product.service"

export default function Products() {
  let [products, setProducts] = useState([])

  useEffect(()=> {
    setProducts(getProducts({}))
  },[])

  return <h1>Products</h1>
}