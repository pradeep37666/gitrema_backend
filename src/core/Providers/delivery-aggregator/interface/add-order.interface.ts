export interface AddOrder {
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_id?: string;
  preparation_time: number;
  lat: number;
  lng: number;
  customer_phone: string;
  customer_name: string;
  client_order_id: string;
  ingr_shop_id: string;
  ingr_shop_name: string;
  ingr_branch_id: string;
  ingr_branch_name: string;
  ingr_branch_lat: number;
  ingr_branch_lng: number;
  ingr_branch_phone: string;
  Ingr_logo: string;
}
