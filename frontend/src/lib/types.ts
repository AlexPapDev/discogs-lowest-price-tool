export interface DiscogsList {
  id: number;
  name: string;
}

export interface DiscogsListItem {
  id: number;
  type: string,
  comment: string,
  uri: string,
  resource_url: string,
  image_url: string,
  display_title: string,
  lowest_price: number
}