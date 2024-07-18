export interface MediaResponse {
  url?: string;
}
export interface Contact {
  name: string;
  phones: string[];
}

export interface GlobalVendorArgs {
  name: string;
  url: string;
  port: number;
  tockenId: string;
}

export interface Message {
  type: string;
  from: string;
  to: string;
  body: string;
  pushName: string;
  name: string;
  url?: string;
  payload?: string;
  title_button_reply?: string;
  title_list_reply?: string;
  latitude?: number;
  longitude?: number;
  contacts?: Contact[];
  order?: Order;
  id?: string;
}

export interface Order {
  catalog_id: string;
  product_items: string[];
}
