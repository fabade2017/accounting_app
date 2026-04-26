export interface Field {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Detail {
  resource: string;
  foreignKey: string;
  label: string;
}

export interface OpenApiSchemaExtended {
  table: string;
  primaryKey: string;
  fields: Field[];
  detail?: Detail | null;
  
  // Convenience getters for master-detail
  DetailResource?: string;
  ForeignKey?: string;
}
