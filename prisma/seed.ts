import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

function makePrisma(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url) {
    const libsql = createClient({ url, authToken: token });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = makePrisma();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const scooters = [
  {
    name: "Xiaomi Electric Scooter 4 Pro",
    brand: "Xiaomi",
    price: 549,
    compareAt: 599,
    maxSpeed: 25,
    range: 45,
    motorPower: 700,
    battery: "36V 12.4Ah",
    weight: 17,
    maxLoad: 120,
    featured: false,
    shortDesc:
      "El equilibrio perfecto entre potencia y portabilidad para tu día a día urbano.",
    description: `El Xiaomi Electric Scooter 4 Pro es la elección inteligente para quien busca un patinete fiable, potente y con la garantía de la marca líder del sector. Con un motor de 700W y autonomía real de hasta 45 km, te llevará a cualquier rincón de Tarragona sin preocuparte por la batería.

Su sistema de doble freno (disco y eléctrico regenerativo) garantiza paradas seguras incluso en condiciones de lluvia, mientras que sus neumáticos antipinchazos de 10 pulgadas absorben las irregularidades del asfalto. La pantalla LED integrada te muestra velocidad, batería y modo de conducción en tiempo real.

Plegable en 3 segundos, ligero (17 kg) y con conectividad Bluetooth para gestionarlo desde la app oficial de Xiaomi. Ideal para trayectos casa-trabajo, paseos por la costa o moverte por el casco antiguo.

En MonkeyMotion lo entregamos montado, ajustado y con prueba previa. Garantía oficial de 2 años incluida.`,
    images: ["/imagenes/local-01.jpeg", "/imagenes/local-02.jpeg"],
  },
  {
    name: "Segway Ninebot Max G2",
    brand: "Segway-Ninebot",
    price: 899,
    compareAt: null,
    maxSpeed: 25,
    range: 70,
    motorPower: 900,
    battery: "48V 15Ah",
    weight: 24,
    maxLoad: 120,
    featured: true,
    shortDesc:
      "Autonomía bestial de 70 km y motor de 900W. El rey de las distancias largas.",
    description: `El Segway Ninebot Max G2 es la referencia absoluta en patinetes eléctricos de gama alta. Con su motor de 900W y batería de 48V/15Ah, ofrece una autonomía real de hasta 70 km, suficiente para una semana entera de desplazamientos sin recargar.

Equipado con suspensión delantera y trasera, neumáticos tubeless de 10 pulgadas y un sistema de frenos hidráulicos que responden con precisión quirúrgica. La pantalla a color TFT integra GPS, control de crucero y conexión 4G opcional para localización antirrobo.

Su chasis reforzado soporta hasta 120 kg y su sistema de plegado patentado lo hace transportable en cualquier coche. Con luces LED frontales y traseras, intermitentes integrados y certificación IPX5, es apto para uso diario en cualquier condición climática.

Reservado para quienes no se conforman con menos. En MonkeyMotion incluimos preparación profesional, ajuste personalizado y mantenimiento gratuito durante el primer año.`,
    images: ["/imagenes/local-03.jpeg", "/imagenes/local-04.jpeg"],
  },
  {
    name: "Cecotec Bongo Serie A Advance",
    brand: "Cecotec",
    price: 379,
    compareAt: 449,
    maxSpeed: 25,
    range: 35,
    motorPower: 700,
    battery: "36V 7.5Ah",
    weight: 14,
    maxLoad: 120,
    featured: true,
    shortDesc:
      "Tu primera elección sin renunciar a nada. Potencia, ligereza y precio imbatible.",
    description: `El Cecotec Bongo Serie A Advance demuestra que la calidad no tiene por qué ser cara. Con un motor de 700W de potencia pico, alcanza los 25 km/h reglamentarios sin esfuerzo y mantiene la velocidad incluso en cuestas pronunciadas.

Su batería de 36V/7.5Ah ofrece hasta 35 km reales de autonomía urbana, más que suficiente para cualquier trayecto diario. Incorpora 3 modos de conducción (Eco, Normal y Sport), freno de disco trasero combinado con freno electromagnético en el motor delantero, y luces LED de serie.

A solo 14 kg de peso y con sistema de plegado rápido en una pulsación, es el patinete más práctico para combinar con transporte público o subirlo al portal sin esfuerzo. Pantalla LED multifunción y gomas antideslizantes en el reposapiés.

Garantía de 2 años, soporte técnico en castellano y disponibilidad inmediata de recambios. La opción más vendida en MonkeyMotion para quien empieza en el mundo del patinete eléctrico.`,
    images: ["/imagenes/local-05.jpeg", "/imagenes/local-06.jpeg"],
  },
  {
    name: "Smartgyro Speedway V3 Max",
    brand: "Smartgyro",
    price: 649,
    compareAt: null,
    maxSpeed: 25,
    range: 50,
    motorPower: 800,
    battery: "48V 13Ah",
    weight: 19,
    maxLoad: 130,
    featured: false,
    shortDesc:
      "Diseño robusto y motor brutal. Ideal para quien valora rendimiento sin compromisos.",
    description: `El Smartgyro Speedway V3 Max es la evolución natural de uno de los patinetes más reconocidos del mercado español. Su motor de 800W y batería de 48V/13Ah ofrecen un rendimiento sobresaliente: 50 km de autonomía real y aceleración firme desde parado.

Cuenta con doble suspensión, neumáticos de 10 pulgadas con cámara, doble freno de disco hidráulico y un sistema de luces LED 360° que mejora drásticamente la visibilidad nocturna. El chasis de aluminio aeronáutico soporta hasta 130 kg sin perder estabilidad.

Su display a color táctil permite configurar todos los parámetros del patinete y consultar estadísticas de uso. Conectividad Bluetooth, app oficial y bloqueo electrónico antirrobo integrado.

Para los que necesitan un patinete que aguante el ritmo del trabajo diario, recorridos largos y la dureza de la calle. En MonkeyMotion lo entregamos con revisión completa y configuración optimizada para tu peso y estilo de conducción.`,
    images: ["/imagenes/local-07.jpeg", "/imagenes/local-08.jpeg"],
  },
  {
    name: "Dualtron Mini Limited",
    brand: "Dualtron",
    price: 1499,
    compareAt: 1699,
    maxSpeed: 25,
    range: 65,
    motorPower: 1300,
    battery: "52V 17.5Ah",
    weight: 22,
    maxLoad: 120,
    featured: true,
    shortDesc:
      "Tecnología coreana premium. La experiencia más potente y refinada que puedes pedir.",
    description: `El Dualtron Mini Limited representa la cumbre del diseño coreano aplicado a la movilidad eléctrica urbana. Su motor de 1300W (limitado por software a 25 km/h según normativa europea) entrega un par instantáneo y aceleración deportiva sin igual en su categoría.

Batería LG/Samsung de 52V/17.5Ah que garantiza 65 km reales en uso intensivo. Suspensión hidráulica regulable en ambos ejes, frenos de disco semi-hidráulicos Zoom y neumáticos tubeless de 8 pulgadas con compuesto premium.

Cada componente está sobredimensionado: chasis de aluminio aeroespacial mecanizado CNC, pantalla EYE central con USB-C de carga, conectividad Bluetooth y sistema de gestión de batería (BMS) inteligente. Construcción artesanal con acabados premium.

El patinete favorito de los exigentes. En MonkeyMotion somos distribuidores autorizados y ofrecemos servicio técnico oficial Dualtron. Cada unidad sale del taller con configuración personalizada y prueba en carretera.`,
    images: ["/imagenes/local-09.jpeg", "/imagenes/local-10.jpeg"],
  },
  {
    name: "Inokim Light 2",
    brand: "Inokim",
    price: 799,
    compareAt: null,
    maxSpeed: 25,
    range: 40,
    motorPower: 350,
    battery: "36V 13Ah",
    weight: 13.5,
    maxLoad: 100,
    featured: false,
    shortDesc:
      "El patinete más ligero de su categoría. Israelí, premium, sofisticado.",
    description: `El Inokim Light 2 es la prueba de que menos puede ser más. Con solo 13.5 kg de peso (el más ligero de su categoría premium), combina la precisión ingenieril israelí con un diseño minimalista que enamora a primera vista.

Su motor brushless de 350W es eficiente y silencioso, mientras que la batería de 36V/13Ah ofrece 40 km reales de autonomía. Suspensión patentada Inokim de elastómeros (sin mantenimiento), neumáticos sin cámara antipinchazos y doble sistema de frenado.

Detalles que marcan la diferencia: pantalla LED retroiluminada, mecanismo de plegado magnético con bloqueo de seguridad, manillar regulable en altura, USB integrado para cargar el móvil mientras conduces y materiales premium en cada componente.

Pensado para profesionales urbanos que valoran el diseño, la calidad de fabricación y la comodidad de transporte. En MonkeyMotion somos punto oficial Inokim con servicio técnico autorizado y garantía extendida.`,
    images: ["/imagenes/local-11.jpeg", "/imagenes/local-12.jpeg"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "Monopatin2026!",
    10
  );
  const clientPassword = await bcrypt.hash("Demo1234!", 10);

  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@monopatinshop.es",
      password: adminPassword,
      name: "Admin MonkeyMotion",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "cliente@demo.es",
      password: clientPassword,
      name: "Cliente Demo",
      phone: "+34 600 000 000",
      role: "CLIENT",
    },
  });

  for (const s of scooters) {
    await prisma.product.create({
      data: {
        slug: slugify(s.name),
        name: s.name,
        brand: s.brand,
        price: s.price,
        compareAt: s.compareAt,
        shortDesc: s.shortDesc,
        description: s.description,
        category: "patinete",
        stock: 5,
        sku: slugify(s.name).toUpperCase().slice(0, 12),
        maxSpeed: s.maxSpeed,
        range: s.range,
        motorPower: s.motorPower,
        battery: s.battery,
        weight: s.weight,
        maxLoad: s.maxLoad,
        featured: s.featured,
        active: true,
        stripeLink: "https://buy.stripe.com/test_placeholder",
        images: {
          create: s.images.map((url, i) => ({
            url,
            alt: s.name,
            order: i,
          })),
        },
      },
    });
  }

  console.log("✅ Seed completed: 6 scooters + admin + cliente demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
