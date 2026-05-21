export interface Unit {
  id?: number;
  unitNumber: string;
  price: number;
  status: string; // 'vacio', 'ocupado', 'mantenimiento'
  type: string; // 'Cuarto', 'Mini-Depa', 'Departamento'
}

export interface Floor {
  id?: number;
  level: number; // <--- CAMBIADO DE floorNumber A level
  units: Unit[];
}

export interface Property {
  id?: number;
  name: string;
  address: string;
  imageUrl?: string;
  floors: Floor[];
}
