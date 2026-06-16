import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { EMPRESA, EMPRESA_DIRECCION_COMPLETA } from "@/config/empresa";

export const metadata = {
  title: "Política de Privacidad",
  description: `Cómo trata ${EMPRESA.razonSocial} (${EMPRESA.marca}) tus datos personales, conforme al RGPD y la LOPDGDD.`,
};

export default function PrivacidadPage() {
  return (
    <LegalPage eyebrow="★ TUS DATOS ★" title="Política de" titleAccent="Privacidad" updated={EMPRESA.actualizado}>
      <p>
        En {EMPRESA.razonSocial} nos tomamos muy en serio la protección de tus datos personales. Esta
        Política de Privacidad explica qué datos recogemos, con qué finalidad y qué derechos tienes,
        conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de Protección de Datos
        Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Responsable:</strong> {EMPRESA.razonSocial}</li>
        <li><strong>NIF/CIF:</strong> {EMPRESA.cif}</li>
        <li><strong>Domicilio:</strong> {EMPRESA_DIRECCION_COMPLETA}</li>
        <li><strong>Correo electrónico:</strong> <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a></li>
      </ul>

      <h2>2. Datos que tratamos</h2>
      <p>Dependiendo de tu relación con nosotros, podemos tratar las siguientes categorías de datos:</p>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y contraseña (almacenada cifrada) cuando creas una cuenta.</li>
        <li><strong>Datos de pedidos:</strong> nombre, dirección de envío y facturación, teléfono y detalle de los productos adquiridos.</li>
        <li><strong>Datos de pago:</strong> los pagos se procesan a través de Stripe; nosotros <strong>no almacenamos los datos completos de tu tarjeta</strong>.</li>
        <li><strong>Datos de contacto:</strong> los que nos facilitas al rellenar el formulario de contacto o al escribirnos por correo o WhatsApp.</li>
        <li><strong>Datos de reparaciones:</strong> datos de contacto y descripción de la avería del patinete cuando solicitas un servicio de reparación.</li>
        <li><strong>Datos de navegación:</strong> información técnica anónima o agregada sobre el uso del Sitio Web (ver <Link href="/cookies">Política de Cookies</Link>).</li>
      </ul>

      <h2>3. Finalidades y base legal del tratamiento</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base legal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gestionar tu cuenta de usuario</td>
            <td>Ejecución de un contrato (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Tramitar y entregar tus pedidos, y gestionar pagos</td>
            <td>Ejecución de un contrato (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Gestionar solicitudes de reparación y postventa</td>
            <td>Ejecución de un contrato / interés legítimo (art. 6.1.b/f RGPD)</td>
          </tr>
          <tr>
            <td>Responder a tus consultas de contacto</td>
            <td>Consentimiento / interés legítimo (art. 6.1.a/f RGPD)</td>
          </tr>
          <tr>
            <td>Cumplir obligaciones legales (fiscales, contables, garantías)</td>
            <td>Obligación legal (art. 6.1.c RGPD)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Plazos de conservación</h2>
      <p>
        Conservamos tus datos durante el tiempo necesario para cumplir la finalidad para la que
        fueron recabados y para atender las responsabilidades que pudieran derivarse. Los datos
        relativos a pedidos y facturación se conservan durante los plazos legalmente exigidos en
        materia fiscal y mercantil (por regla general, hasta 6 años). Los datos de cuenta se
        conservan mientras la mantengas activa.
      </p>

      <h2>5. Destinatarios y encargados del tratamiento</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Para prestar nuestros servicios
        trabajamos con proveedores que actúan como encargados del tratamiento, entre ellos:
      </p>
      <ul>
        <li><strong>Stripe Payments Europe, Ltd.</strong> — procesamiento de pagos.</li>
        <li><strong>Vercel Inc.</strong> — alojamiento del Sitio Web y analítica de uso agregada.</li>
        <li>Empresas de mensajería y transporte, para la entrega de pedidos.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden realizar transferencias internacionales de datos; en tal
        caso, se llevan a cabo con las debidas garantías (cláusulas contractuales tipo u otros
        mecanismos aprobados por la Comisión Europea).
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento los siguientes derechos dirigiéndote a{" "}
        <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>, indicando el derecho que deseas
        ejercer y adjuntando copia de tu documento identificativo:
      </p>
      <ul>
        <li>Derecho de <strong>acceso</strong> a tus datos personales.</li>
        <li>Derecho de <strong>rectificación</strong> de datos inexactos.</li>
        <li>Derecho de <strong>supresión</strong> («derecho al olvido»).</li>
        <li>Derecho a la <strong>limitación</strong> del tratamiento.</li>
        <li>Derecho a la <strong>portabilidad</strong> de tus datos.</li>
        <li>Derecho de <strong>oposición</strong> al tratamiento.</li>
      </ul>
      <p>
        Si consideras que no hemos atendido correctamente tus derechos, puedes presentar una
        reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>,{" "}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos las medidas técnicas y organizativas apropiadas para garantizar un nivel de
        seguridad adecuado al riesgo, protegiendo tus datos frente a accesos no autorizados,
        pérdida o alteración. Las contraseñas se almacenan cifradas y las comunicaciones del Sitio
        Web se realizan mediante conexión segura (HTTPS).
      </p>

      <h2>8. Menores de edad</h2>
      <p>
        El Sitio Web no está dirigido a menores de 14 años. Si eres menor de esa edad, no nos
        facilites tus datos sin el consentimiento de tus padres o tutores.
      </p>

      <h2>9. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta Política de Privacidad para adaptarla a cambios normativos o a
        nuevas funcionalidades del Sitio Web. Te recomendamos revisarla periódicamente.
      </p>
    </LegalPage>
  );
}
