let shopcart_BD = []

export const getShopCart = async (): Promise<any[]> => {
  return shopcart_BD;
}

export const createProduct = async (data: any): Promise<any> => {
  shopcart_BD.push(data)
  return data;
}

export const deleteProduct = async (id: any): Promise<any> => {
  return true;
}

export const updateProductQuantity = async (id: any, quantity: number): Promise<any> => {
  return true;
}

export const clearShopCart = async (): Promise<any> => {
  shopcart_BD = []
  return true;
}