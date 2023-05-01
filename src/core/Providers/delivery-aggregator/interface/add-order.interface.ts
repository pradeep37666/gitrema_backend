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
}
