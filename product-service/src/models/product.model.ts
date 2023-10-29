export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
}

export interface ProductWithStock extends Product {
  stockId?: string;
  count: number;
}
