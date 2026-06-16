import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { EMPRESA } from "@/config/empresa";

export const metadata = {
  title: "Política de Cookies",
  description: `Información sobre el uso de cookies y tecnologías similares en ${EMPRESA.dominio}.`,
};

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="★ COOKIES ★" title="Política de" titleAccent="Cookies" updated={EMPRESA.actualizado}>
      <p>
        Esta Política de Cookies explica qué son las cookies y qué tecnologías de seguimiento
        utilizamos en <strong>{EMPRESA.dominio}</strong>, de conformidad con el artículo 22.2 de la
        Ley 34/2002 (LSSI-CE) y las directrices de la Agencia Española de Protección de Datos.
      </p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Una cookie es un pequeño archivo de texto que un sitio web almacena en tu navegador o
        dispositivo cuando lo visitas. Sirve para recordar información sobre tu visita, como tus
        preferencias o el estado de tu sesión.
      </p>

      <h2>2. Cookies que utilizamos</h2>
      <p>
        En este Sitio Web utilizamos <strong>únicamente cookies técnicas estrictamente
        necesarias</strong> para su funcionamiento. Estas cookies están exentas del deber de
        consentimiento previo, por lo que no mostramos un banner de aceptación.
      </p>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sesión / autenticación</td>
            <td>Mantener tu sesión iniciada y proteger tu cuenta mientras navegas.</td>
            <td>Sesión / persistente</td>
          </tr>
          <tr>
            <td>Preferencias</td>
            <td>Recordar ajustes como el contenido del carrito o avisos ya cerrados.</td>
            <td>Persistente</td>
          </tr>
          <tr>
            <td>Seguridad</td>
            <td>Prevenir fraude y proteger los formularios y el proceso de pago.</td>
            <td>Sesión</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Analítica sin cookies</h2>
      <p>
        Para entender de forma agregada cómo se usa el Sitio Web utilizamos{" "}
        <strong>Vercel Analytics</strong>, una solución de medición que{" "}
        <strong>no utiliza cookies ni rastrea a usuarios individuales</strong> y no recopila datos
        personales identificables. Por ello no requiere tu consentimiento.
      </p>

      <h2>4. Cookies de terceros (pasarela de pago)</h2>
      <p>
        Durante el proceso de pago, nuestro proveedor <strong>Stripe</strong> puede establecer
        cookies propias necesarias para procesar la transacción de forma segura y prevenir el
        fraude. Puedes consultar más información en la{" "}
        <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer">
          política de privacidad de Stripe
        </a>.
      </p>

      <h2>5. Cómo gestionar o desactivar las cookies</h2>
      <p>
        Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo configurando
        las opciones de tu navegador. Ten en cuenta que, al ser cookies técnicas necesarias,
        desactivarlas puede impedir el correcto funcionamiento del Sitio Web (por ejemplo, iniciar
        sesión o finalizar una compra).
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a>
        </li>
        <li>
          <a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a>
        </li>
        <li>
          <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a>
        </li>
        <li>
          <a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a>
        </li>
      </ul>

      <h2>6. Más información</h2>
      <p>
        Para más detalles sobre cómo tratamos tus datos personales, consulta nuestra{" "}
        <Link href="/privacidad">Política de Privacidad</Link>. Si tienes cualquier duda, puedes
        escribirnos a <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.
      </p>
    </LegalPage>
  );
}
