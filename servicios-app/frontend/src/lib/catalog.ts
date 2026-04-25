export interface CatalogItem {
  nombre: string;
  precio: number;
}

export type CatalogData = {
  [service: string]: {
    [category: string]: CatalogItem[];
  };
};

export const CATALOG: CatalogData = {
  aire_acondicionado: {
    instalacion: [
      { nombre: 'Mini split 1 ton', precio: 2500 },
      { nombre: 'Mini split 1.5 ton', precio: 3000 },
      { nombre: 'Mini split 2 ton', precio: 3500 },
      { nombre: 'Sistema central residencial', precio: 8000 },
      { nombre: 'Cassette comercial', precio: 5000 },
      { nombre: 'Ventana residencial', precio: 1800 },
    ],
    reparacion: [
      { nombre: 'Sistema eléctrico', precio: 600 },
      { nombre: 'Falla de enfriamiento', precio: 800 },
      { nombre: 'Fuga de gas refrigerante', precio: 900 },
      { nombre: 'Ruido excesivo', precio: 500 },
      { nombre: 'Sensor dañado', precio: 450 },
      { nombre: 'Compresor', precio: 3500 },
    ],
    mantenimiento: [
      { nombre: 'Limpieza de filtros', precio: 300 },
      { nombre: 'Limpieza profunda de unidad', precio: 600 },
      { nombre: 'Revisión general', precio: 400 },
      { nombre: 'Limpieza de serpentín', precio: 500 },
      { nombre: 'Revisión eléctrica', precio: 350 },
      { nombre: 'Mantenimiento preventivo anual', precio: 900 },
    ],
  },
  carpinteria: {
    estructuras: [
      { nombre: 'Vigas de madera', precio: 1200 },
      { nombre: 'Marcos de ventana', precio: 800 },
      { nombre: 'Techos de madera', precio: 2000 },
      { nombre: 'Reparación de piso', precio: 600 },
      { nombre: 'Travesaños', precio: 700 },
      { nombre: 'Refuerzo de pilares', precio: 1500 },
    ],
    acabados: [
      { nombre: 'Barniz y laca', precio: 600 },
      { nombre: 'Lijado de superficie', precio: 350 },
      { nombre: 'Cambio de clavos y tornillos', precio: 200 },
      { nombre: 'Sellado de grietas', precio: 400 },
      { nombre: 'Pintura de acabado', precio: 550 },
      { nombre: 'Nivelado de superficie', precio: 450 },
    ],
  },
  cerrajeria: {
    apertura: [
      { nombre: 'Puerta residencial', precio: 350 },
      { nombre: 'Puerta de seguridad', precio: 500 },
      { nombre: 'Vehiculo particular', precio: 450 },
      { nombre: 'Candado de disco', precio: 200 },
      { nombre: 'Caja fuerte', precio: 800 },
      { nombre: 'Oficina o negocio', precio: 400 },
    ],
    instalacion: [
      { nombre: 'Cerradura básica', precio: 400 },
      { nombre: 'Cerradura de seguridad', precio: 700 },
      { nombre: 'Cerradura digital', precio: 1200 },
      { nombre: 'Cerrojo adicional', precio: 350 },
      { nombre: 'Cerradura multipunto', precio: 1500 },
      { nombre: 'Ojo de buey y cerrojo', precio: 300 },
    ],
    reparacion: [
      { nombre: 'Cambio de cilindro', precio: 300 },
      { nombre: 'Llave rota dentro', precio: 250 },
      { nombre: 'Palanca dañada', precio: 350 },
      { nombre: 'Manija y mecanismo', precio: 400 },
      { nombre: 'Cerradura eléctrica', precio: 600 },
      { nombre: 'Bisagras y ajuste de puerta', precio: 280 },
    ],
  },
  electricidad: {
    instalacion: [
      { nombre: 'Contacto eléctrico', precio: 180 },
      { nombre: 'Apagador sencillo', precio: 150 },
      { nombre: 'Apagador triple', precio: 280 },
      { nombre: 'Lámpara de techo', precio: 250 },
      { nombre: 'Ventilador de techo', precio: 350 },
      { nombre: 'Timbre domiciliario', precio: 200 },
    ],
    reparacion: [
      { nombre: 'Corto circuito localizado', precio: 400 },
      { nombre: 'Cableado dañado (tramo)', precio: 350 },
      { nombre: 'Tablero de distribución', precio: 600 },
      { nombre: 'Interruptor termomagnético', precio: 450 },
      { nombre: 'Baja de voltaje general', precio: 500 },
      { nombre: 'Contacto quemado', precio: 200 },
    ],
    diagnostico: [
      { nombre: 'Revisión general de instalación', precio: 300 },
      { nombre: 'Estudio de carga eléctrica', precio: 500 },
      { nombre: 'Termografía de tablero', precio: 800 },
      { nombre: 'Detección de fuga a tierra', precio: 600 },
      { nombre: 'Certificación NOM residencial', precio: 1200 },
      { nombre: 'Revisión de tierras físicas', precio: 400 },
    ],
  },
  jardineria: {
    mantenimiento: [
      { nombre: 'Corte de césped', precio: 80 },
      { nombre: 'Poda de arbustos', precio: 120 },
      { nombre: 'Poda de árboles medianos', precio: 300 },
      { nombre: 'Fertilización de jardín', precio: 150 },
      { nombre: 'Control de plagas', precio: 200 },
      { nombre: 'Aireado de suelo', precio: 100 },
    ],
    instalacion: [
      { nombre: 'Colocación de pasto en rollo', precio: 180 },
      { nombre: 'Siembra de jardín completo', precio: 250 },
      { nombre: 'Instalación de sistema de riego', precio: 400 },
      { nombre: 'Macetera y arriates', precio: 350 },
      { nombre: 'Jardineras elevadas', precio: 500 },
      { nombre: 'Colocación de grava decorativa', precio: 120 },
    ],
    limpieza: [
      { nombre: 'Retiro de hojas', precio: 70 },
      { nombre: 'Deshierbe manual', precio: 90 },
      { nombre: 'Poda y retiro de ramas caídas', precio: 150 },
      { nombre: 'Limpieza de alberca perimetral', precio: 120 },
      { nombre: 'Retiro de escombro vegetal', precio: 100 },
      { nombre: 'Limpieza post-tormenta', precio: 200 },
    ],
  },
  limpieza: {
    basica: [
      { nombre: 'Barrido y trapeado', precio: 150 },
      { nombre: 'Limpieza de baño', precio: 180 },
      { nombre: 'Limpieza de cocina', precio: 200 },
      { nombre: 'Limpieza de habitación', precio: 160 },
      { nombre: 'Limpieza de sala-comedor', precio: 180 },
      { nombre: 'Limpieza de oficina pequeña', precio: 250 },
    ],
    profunda: [
      { nombre: 'Limpieza profunda de baño', precio: 350 },
      { nombre: 'Limpieza profunda de cocina', precio: 500 },
      { nombre: 'Lavado de alfombras', precio: 400 },
      { nombre: 'Lavado de tapicería por mueble', precio: 450 },
      { nombre: 'Limpieza de ventanas exteriores', precio: 300 },
      { nombre: 'Limpieza de fachada', precio: 600 },
    ],
    desinfeccion: [
      { nombre: 'Nebulización de cuarto', precio: 300 },
      { nombre: 'Nebulización de vivienda completa', precio: 700 },
      { nombre: 'Sanitización de oficina', precio: 500 },
      { nombre: 'Desinfección de bodega', precio: 600 },
      { nombre: 'Fumigación preventiva', precio: 400 },
      { nombre: 'Control de cucarachas', precio: 350 },
    ],
  },
  pintura: {
    interior: [
      { nombre: 'Pared estándar (vinílica)', precio: 55 },
      { nombre: 'Pared con textura lisa', precio: 75 },
      { nombre: 'Techo liso', precio: 65 },
      { nombre: 'Pared con pintura epóxica', precio: 90 },
      { nombre: 'Pared de baño (impermeable)', precio: 80 },
      { nombre: 'Pared decorativa (degradado)', precio: 110 },
    ],
    exterior: [
      { nombre: 'Fachada (vinílica exterior)', precio: 70 },
      { nombre: 'Fachada (elastomérica)', precio: 95 },
      { nombre: 'Bardas y muros divisorios', precio: 60 },
      { nombre: 'Columnas y pilares', precio: 85 },
      { nombre: 'Herrería y cancel (anticorrosivo)', precio: 100 },
      { nombre: 'Piso exterior (pintura especial)', precio: 80 },
    ],
    preparacion: [
      { nombre: 'Resane de grietas', precio: 40 },
      { nombre: 'Aplicación de sellador', precio: 30 },
      { nombre: 'Lijado de superficie', precio: 35 },
      { nombre: 'Remoción de pintura vieja', precio: 50 },
      { nombre: 'Aplicación de fondo fijador', precio: 35 },
      { nombre: 'Masillado y nivelado de muro', precio: 60 },
    ],
  },
  plomeria: {
    instalacion: [
      { nombre: 'Lavabo o fregadero', precio: 400 },
      { nombre: 'Taza de baño', precio: 600 },
      { nombre: 'Regadera y accesorios', precio: 500 },
      { nombre: 'Calentador de paso', precio: 800 },
      { nombre: 'Boiler de depósito', precio: 1200 },
      { nombre: 'Llave de jardín y manguera', precio: 250 },
    ],
    reparacion: [
      { nombre: 'Fuga en tubería visible', precio: 300 },
      { nombre: 'Fuga empotrada (localización)', precio: 600 },
      { nombre: 'Destapado de drenaje', precio: 350 },
      { nombre: 'Cambio de llave de paso', precio: 200 },
      { nombre: 'Reparación de cisterna', precio: 450 },
      { nombre: 'Cambio de flotador y válvula', precio: 250 },
    ],
    mantenimiento: [
      { nombre: 'Limpieza de sarro en tuberías', precio: 400 },
      { nombre: 'Revisión general de instalación', precio: 350 },
      { nombre: 'Prueba de presión', precio: 300 },
      { nombre: 'Desazolve de albañal', precio: 500 },
      { nombre: 'Limpieza de trampa de grasas', precio: 600 },
      { nombre: 'Revisión de calentador', precio: 280 },
    ],
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
  estructuras: 'Reparación de estructuras',
  acabados: 'Acabados',
  apertura: 'Apertura',
  diagnostico: 'Diagnóstico',
  limpieza: 'Limpieza',
  basica: 'Básica',
  profunda: 'Profunda',
  desinfeccion: 'Desinfección',
  interior: 'Interior',
  exterior: 'Exterior',
  preparacion: 'Preparación',
};

export const SERVICE_LABELS: Record<string, string> = {
  aire_acondicionado: 'Aire Acondicionado',
  carpinteria: 'Carpintería',
  cerrajeria: 'Cerrajería',
  electricidad: 'Electricidad',
  jardineria: 'Jardinería',
  limpieza: 'Limpieza',
  pintura: 'Pintura',
  plomeria: 'Plomería',
};

export interface MultiField {
  key: string;
  label: string;
}

export interface QuantityConfig {
  unit: string;
  label: string;
  min: number;
  step: number;
  multiFields?: MultiField[];
}

const QUANTITY_CONFIGS: Record<string, QuantityConfig> = {
  aire_acondicionado: { unit: 'unidades', label: 'Unidades', min: 1, step: 1 },
  carpinteria: { unit: 'unidades', label: 'Unidades', min: 1, step: 1 },
  cerrajeria: { unit: 'unidades', label: 'Unidades', min: 1, step: 1 },
  electricidad: { unit: 'puntos', label: 'Puntos eléctricos', min: 1, step: 1 },
  jardineria: { unit: 'm²', label: 'Metros cuadrados', min: 1, step: 1 },
  limpieza: { unit: 'cuartos', label: 'Número de cuartos', min: 1, step: 1 },
  pintura: { unit: 'm²', label: 'Metros cuadrados', min: 1, step: 1 },
  plomeria: {
    unit: 'piezas',
    label: 'Elementos de plomería',
    min: 0,
    step: 1,
    multiFields: [
      { key: 'lavabos', label: 'Lavabos' },
      { key: 'wc', label: 'WC (Inodoros)' },
      { key: 'mingitorios', label: 'Mingitorios' },
    ],
  },
};

export function toCatalogKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_');
}

export function getCatalogForService(serviceName: string) {
  const key = toCatalogKey(serviceName);
  return { key, data: CATALOG[key] || null };
}

export function getQuantityConfig(serviceKey: string): QuantityConfig {
  return QUANTITY_CONFIGS[serviceKey] || { unit: 'unidades', label: 'Unidades', min: 1, step: 1 };
}
