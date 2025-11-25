export interface FieldCoords {
  x: number;
  y: number;
  w: number;
  h: number;
  page?: number; // optional 1-based page index when coords are page-local
}

export interface ExtractedField {
  value: string;
  confidence: number;
  coords: FieldCoords;
}

export interface LineItem {
  description: string;
  qty: number;
  amount: string;
  // tableIndex removed: line items can map to multiple tables; mapping is inferred or explicit via other data
}

export interface DocumentData {
  project: string;
  validationStatus: string;
  file: string;
  fields: Record<string, ExtractedField>;
  // single table coords or multiple tables (for multi-table documents)
  tableCoords: FieldCoords | FieldCoords[];
  lineItems: LineItem[];
}
