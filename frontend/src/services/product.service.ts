interface Filter {
  page?: number,
  limit?: number,
  q?: string,
  categoriaId?: number
}

export default function getProducts(filter: Filter): Record<string,any>[] {
  // /productos?page=1&limit=10&q=texto&categoriaId=123
  return [
    {
      "id": 0,
      "nombre": "string",
      "descripcion": "string",
      "precio": 0,
      "stockDisponible": 0,
      "pesoKg": 0,
      "dimensiones": {
        "largoCm": 0,
        "anchoCm": 0,
        "altoCm": 0
      },
      "ubicacion": {
        "almacenId": 0,
        "pasillo": "string",
        "estanteria": "string",
        "nivel": 0
      },
      "imagenes": [
        {
          "url": "https://example.com/images/laptop_frontal.jpg",
          "esPrincipal": true
        }
      ],
      "categorias": [
        {
          "id": 1,
          "nombre": "Electrónica",
          "descripcion": "Dispositivos electrónicos y accesorios."
        }
      ]
    }
  ]
}