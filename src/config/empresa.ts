/**
 * Datos legales y de contacto de la empresa.
 * Fuente única de verdad para páginas legales, footer y metadatos.
 */
export const EMPRESA = {
  // Identidad
  marca: "MonopatinShop",
  razonSocial: "MONKEYMOTION SL",
  cif: "B26765099",

  // Domicilio
  direccion: "C/ Jaume I, 5",
  cp: "43005",
  ciudad: "Tarragona",
  provincia: "Tarragona",
  pais: "España",

  // Contacto
  email: "monkeymotionoficial@gmail.com",
  telefonos: ["643 27 47 56", "616 686 593"],
  whatsapp: "34616686593",

  // Web
  dominio: "monopatinmonkey.com",
  url: "https://monopatinmonkey.com",

  // Última actualización de los textos legales (formato legible en español)
  actualizado: "16 de junio de 2026",
} as const;

export const EMPRESA_DIRECCION_COMPLETA = `${EMPRESA.direccion}, ${EMPRESA.cp} ${EMPRESA.ciudad} (${EMPRESA.provincia}), ${EMPRESA.pais}`;
