import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { EMPRESA, EMPRESA_DIRECCION_COMPLETA } from "@/config/empresa";

export const metadata = {
  title: "Aviso Legal",
  description: `Aviso legal e información de ${EMPRESA.razonSocial} (${EMPRESA.marca}), conforme a la LSSI-CE.`,
};

export default function AvisoLegalPage() {
  return (
    <LegalPage eyebrow="★ INFORMACIÓN LEGAL ★" title="Aviso" titleAccent="Legal" updated={EMPRESA.actualizado}>
      <p>
        El presente Aviso Legal regula el acceso, navegación y uso del sitio web{" "}
        <strong>{EMPRESA.dominio}</strong> (en adelante, el «Sitio Web»), en cumplimiento de la Ley
        34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio
        Electrónico (LSSI-CE).
      </p>

      <h2>1. Datos identificativos del titular</h2>
      <p>En cumplimiento del artículo 10 de la LSSI-CE, se informa de los siguientes datos:</p>
      <ul>
        <li><strong>Titular:</strong> {EMPRESA.razonSocial}</li>
        <li><strong>NIF/CIF:</strong> {EMPRESA.cif}</li>
        <li><strong>Domicilio:</strong> {EMPRESA_DIRECCION_COMPLETA}</li>
        <li><strong>Correo electrónico:</strong> <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a></li>
        <li><strong>Teléfonos:</strong> {EMPRESA.telefonos.join(" · ")}</li>
        <li><strong>Nombre comercial:</strong> {EMPRESA.marca}</li>
        <li><strong>Actividad:</strong> venta y reparación de patinetes eléctricos y accesorios.</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El Sitio Web tiene por objeto ofrecer información sobre los productos y servicios de{" "}
        {EMPRESA.razonSocial}, así como permitir la compra de productos y la solicitud de servicios
        de reparación. El acceso al Sitio Web atribuye la condición de usuario e implica la
        aceptación plena de las disposiciones contenidas en este Aviso Legal.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El usuario se compromete a hacer un uso adecuado y lícito del Sitio Web y de sus contenidos,
        de conformidad con la legislación vigente, el presente Aviso Legal, la moral y el orden
        público. En particular, se obliga a abstenerse de:
      </p>
      <ul>
        <li>Utilizar los contenidos con fines ilícitos o contrarios a lo establecido en este Aviso Legal.</li>
        <li>Introducir o difundir virus informáticos o cualquier sistema susceptible de causar daños.</li>
        <li>Intentar acceder a áreas restringidas del Sitio Web sin autorización.</li>
        <li>Suplantar la identidad de otro usuario o de {EMPRESA.razonSocial}.</li>
      </ul>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del Sitio Web (textos, fotografías, gráficos, imágenes, iconos,
        tecnología, software, diseño, marcas, nombres comerciales y demás signos distintivos) son
        titularidad de {EMPRESA.razonSocial} o de terceros que han autorizado su uso, y están
        protegidos por la normativa de propiedad intelectual e industrial.
      </p>
      <p>
        Queda prohibida la reproducción, distribución, comunicación pública, transformación o
        cualquier otra forma de explotación, total o parcial, de los contenidos sin la autorización
        expresa y por escrito de {EMPRESA.razonSocial}.
      </p>

      <h2>5. Exclusión de responsabilidad</h2>
      <p>
        {EMPRESA.razonSocial} no se hace responsable de los daños o perjuicios que pudieran derivarse
        de interferencias, omisiones, interrupciones, virus informáticos, averías o desconexiones en
        el funcionamiento del sistema electrónico, motivadas por causas ajenas a su control. Tampoco
        se responsabiliza de los contenidos de páginas de terceros enlazadas desde el Sitio Web.
      </p>

      <h2>6. Enlaces (links)</h2>
      <p>
        El Sitio Web puede contener enlaces a sitios de terceros. {EMPRESA.razonSocial} no asume
        responsabilidad alguna sobre la información, contenidos o servicios que pudieran aparecer en
        dichos sitios, que tienen carácter meramente informativo.
      </p>

      <h2>7. Protección de datos</h2>
      <p>
        El tratamiento de los datos personales de los usuarios se rige por lo dispuesto en nuestra{" "}
        <Link href="/privacidad">Política de Privacidad</Link> y nuestra{" "}
        <Link href="/cookies">Política de Cookies</Link>.
      </p>

      <h2>8. Legislación aplicable y jurisdicción</h2>
      <p>
        El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier
        controversia que pudiera derivarse del acceso o uso del Sitio Web, las partes se someten a
        los Juzgados y Tribunales que correspondan conforme a la normativa aplicable. Cuando el
        usuario tenga la condición de consumidor, prevalecerá el fuero que legalmente le corresponda.
      </p>
    </LegalPage>
  );
}
