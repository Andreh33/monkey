import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { EMPRESA, EMPRESA_DIRECCION_COMPLETA } from "@/config/empresa";

export const metadata = {
  title: "Condiciones de Compra",
  description: `Condiciones generales de venta de ${EMPRESA.razonSocial} (${EMPRESA.marca}): pago, envíos, devoluciones y garantía.`,
};

export default function CondicionesCompraPage() {
  return (
    <LegalPage
      eyebrow="★ CONDICIONES ★"
      title="Condiciones de"
      titleAccent="Compra"
      updated={EMPRESA.actualizado}
    >
      <p>
        Las presentes Condiciones Generales de Contratación regulan la compra de productos y la
        contratación de servicios a través del Sitio Web <strong>{EMPRESA.dominio}</strong>,
        titularidad de {EMPRESA.razonSocial}. Realizar un pedido implica la aceptación plena de
        estas condiciones, así como del{" "}
        <Link href="/aviso-legal">Aviso Legal</Link> y la{" "}
        <Link href="/privacidad">Política de Privacidad</Link>.
      </p>

      <h2>1. Identificación del vendedor</h2>
      <ul>
        <li><strong>Vendedor:</strong> {EMPRESA.razonSocial}</li>
        <li><strong>NIF/CIF:</strong> {EMPRESA.cif}</li>
        <li><strong>Domicilio:</strong> {EMPRESA_DIRECCION_COMPLETA}</li>
        <li><strong>Contacto:</strong> <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a> · {EMPRESA.telefonos.join(" · ")}</li>
      </ul>

      <h2>2. Productos y servicios</h2>
      <p>
        Los productos ofrecidos son patinetes eléctricos, recambios y accesorios, además del
        servicio de reparación. Procuramos que las descripciones, fotografías y características de
        los productos sean lo más exactas posible; no obstante, pueden existir pequeñas variaciones
        ajenas a nuestra voluntad. La disponibilidad de los productos está sujeta a existencias.
      </p>

      <h2>3. Precios</h2>
      <p>
        Todos los precios mostrados en el Sitio Web están expresados en euros (€) e incluyen el
        Impuesto sobre el Valor Añadido (IVA) aplicable, salvo que se indique lo contrario. Los
        gastos de envío, cuando proceda, se indicarán de forma separada antes de finalizar el pedido.
        {" "}{EMPRESA.razonSocial} se reserva el derecho de modificar los precios en cualquier momento,
        aplicándose el precio vigente en el momento de realizar el pedido.
      </p>

      <h2>4. Proceso de compra</h2>
      <p>
        Para realizar un pedido, selecciona el producto deseado y sigue los pasos indicados en el
        Sitio Web. Antes de confirmar el pago podrás revisar el resumen de tu pedido. Una vez
        completado, recibirás una confirmación por correo electrónico. El contrato de compraventa se
        considera perfeccionado en el momento de la confirmación del pedido y del pago.
      </p>

      <h2>5. Formas de pago</h2>
      <p>
        El pago se realiza de forma segura a través de la pasarela de pago <strong>Stripe</strong>,
        que admite tarjeta de crédito/débito y otros métodos disponibles en el momento de la compra.
        {EMPRESA.razonSocial} no tiene acceso ni almacena los datos completos de tu tarjeta.
      </p>

      <h2>6. Envíos y entrega</h2>
      <p>
        Los pedidos se envían a la dirección indicada por el cliente. Los plazos de entrega son
        orientativos y dependen del destino y del transportista. También ofrecemos la posibilidad de
        recogida en nuestra tienda física situada en {EMPRESA.direccion}, {EMPRESA.cp} {EMPRESA.ciudad}.
        Los riesgos de los productos se transmiten al cliente en el momento de la entrega.
      </p>

      <h2>7. Derecho de desistimiento</h2>
      <p>
        Si eres consumidor, dispones de un plazo de <strong>14 días naturales</strong> desde la
        recepción del producto para desistir de la compra sin necesidad de justificación, conforme
        al Real Decreto Legislativo 1/2007 (TRLGDCU). Para ejercerlo, comunícanoslo por correo
        electrónico a <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a> antes de que finalice
        dicho plazo.
      </p>
      <p>El derecho de desistimiento no será aplicable, entre otros supuestos legalmente previstos, a:</p>
      <ul>
        <li>Productos personalizados o confeccionados conforme a tus especificaciones.</li>
        <li>Servicios de reparación ya ejecutados con tu consentimiento previo.</li>
        <li>Productos precintados que no puedan devolverse por razones de higiene o seguridad y que hayan sido desprecintados tras la entrega.</li>
      </ul>
      <p>
        Tras el desistimiento, te reembolsaremos los importes pagados (incluidos los gastos de envío
        estándar) sin demora indebida y, en todo caso, en un plazo máximo de 14 días naturales desde
        que tengamos conocimiento de tu decisión. Los costes directos de devolución del producto
        correrán por cuenta del cliente, salvo indicación en contrario.
      </p>

      <h2>8. Devoluciones y reembolsos</h2>
      <p>
        El producto deberá devolverse en buen estado, completo y, a ser posible, en su embalaje
        original. Una vez recibido y comprobado, gestionaremos el reembolso por el mismo medio de
        pago utilizado en la compra.
      </p>

      <h2>9. Garantía</h2>
      <p>
        Todos los productos cuentan con la garantía legal de conformidad prevista en el TRLGDCU.
        Adicionalmente, en {EMPRESA.marca} ofrecemos una <strong>garantía de hasta 3 años</strong>{" "}
        en los términos y condiciones que se detallan para cada producto o servicio. La garantía no
        cubre los daños derivados de un uso indebido, negligencia, accidentes, manipulación por
        terceros no autorizados o el desgaste normal de componentes consumibles (neumáticos,
        pastillas de freno, baterías por uso, etc.).
      </p>

      <h2>10. Servicio de reparación</h2>
      <p>
        Las solicitudes de reparación se gestionan según el diagnóstico realizado en nuestro taller.
        Antes de cualquier intervención facturable se proporcionará un presupuesto. La garantía sobre
        las reparaciones cubre la mano de obra y las piezas sustituidas en los términos comunicados
        al cliente. Puedes consultar más detalles en la página de{" "}
        <Link href="/reparaciones">Reparaciones</Link>.
      </p>

      <h2>11. Resolución de litigios</h2>
      <p>
        Si eres consumidor residente en la Unión Europea, te informamos de la existencia de la
        plataforma de resolución de litigios en línea de la Comisión Europea, accesible en{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>.
      </p>

      <h2>12. Legislación aplicable</h2>
      <p>
        Estas Condiciones se rigen por la legislación española. Para cualquier controversia será de
        aplicación el fuero que corresponda al consumidor conforme a la normativa vigente.
      </p>
    </LegalPage>
  );
}
