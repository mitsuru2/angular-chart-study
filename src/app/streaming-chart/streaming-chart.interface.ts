export interface DataItemData {
  name: string;
  value: [string, number];
}

export interface SeriesConfig {
  name: string;
  /** When set, values are indices into this label list (discrete/categorical series). */
  labels?: string[];
}
