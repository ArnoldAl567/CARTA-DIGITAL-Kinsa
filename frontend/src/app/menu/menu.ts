export interface Product {
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  image: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  products: Product[];
}

export interface Menu {
  categories: Category[];
}
