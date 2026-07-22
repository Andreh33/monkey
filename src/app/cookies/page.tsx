import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { EMPRESA } from "@/config/empresa";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: `Información sobre el uso de cookies en ${EMPRESA.dominio}.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="★ COOKIES ★" title="Política de" titleAccent="Cookies" updated={EMPRESA.actualizado}>
      <h2>¿Qué son las cookies?</h2>
      <p>
        Cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web.
        Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información
        sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información
        que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al
        usuario. El navegador del usuario memoriza cookies en el disco duro solamente durante la
        sesión actual ocupando un espacio de memoria mínimo y no perjudicando al ordenador. Las
        cookies no contienen ninguna clase de información personal específica, y la mayoría de las
        mismas se borran del disco duro al finalizar la sesión de navegador (las denominadas cookies
        de sesión).
      </p>
      <p>
        La mayoría de los navegadores aceptan como estándar a las cookies y, con independencia de las
        mismas, permiten o impiden en los ajustes de seguridad las cookies temporales o memorizadas.
      </p>
      <p>
        Sin su expreso consentimiento –mediante la activación de las cookies en su navegador– no
        enlazará en las cookies los datos memorizados con sus datos personales proporcionados en el
        momento del registro o la compra.
      </p>

      <h2>¿Qué tipos de cookies utiliza esta página web?</h2>
      <p>
        <strong>Cookies técnicas:</strong> Son aquéllas que permiten al usuario la navegación a través
        de una página web, plataforma o aplicación y la utilización de las diferentes opciones o
        servicios que en ella existan como, por ejemplo, controlar el tráfico y la comunicación de
        datos, identificar la sesión, acceder a partes de acceso restringido, recordar los elementos
        que integran un pedido, realizar el proceso de compra de un pedido, realizar la solicitud de
        inscripción o participación en un evento, utilizar elementos de seguridad durante la
        navegación, almacenar contenidos para la difusión de videos o sonido o compartir contenidos a
        través de redes sociales.
      </p>
      <p>
        <strong>Cookies de personalización:</strong> Son aquéllas que permiten al usuario acceder al
        servicio con algunas características de carácter general predefinidas en función de una serie
        de criterios en el terminal del usuario como por ejemplo serían el idioma, el tipo de
        navegador a través del cual accede al servicio, la configuración regional desde donde accede
        al servicio, etc.
      </p>
      <p>
        <strong>Cookies de análisis:</strong> Son aquéllas que bien tratadas por nosotros o por
        terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis
        estadístico de la utilización que hacen los usuarios del servicio ofertado. Para ello se
        analiza su navegación en nuestra página web con el fin de mejorar la oferta de productos o
        servicios que le ofrecemos.
      </p>
      <p>
        <strong>Cookies publicitarias:</strong> Son aquéllas que, bien tratadas por nosotros o por
        terceros, nos permiten gestionar de la forma más eficaz posible la oferta de los espacios
        publicitarios que hay en la página web, adecuando el contenido del anuncio al contenido del
        servicio solicitado o al uso que realice de nuestra página web. Para ello podemos analizar sus
        hábitos de navegación en Internet y podemos mostrarle publicidad relacionada con su perfil de
        navegación.
      </p>
      <p>
        <strong>Cookies de publicidad comportamental:</strong> Son aquéllas que permiten la gestión,
        de la forma más eficaz posible, de los espacios publicitarios que, en su caso, el editor haya
        incluido en una página web, aplicación o plataforma desde la que presta el servicio
        solicitado. Estas cookies almacenan información del comportamiento de los usuarios obtenida a
        través de la observación continuada de sus hábitos de navegación, lo que permite desarrollar un
        perfil específico para mostrar publicidad en función del mismo.
      </p>

      <h2>Cookies de terceros</h2>
      <p>
        La Web de www.{EMPRESA.dominio} puede utilizar servicios de terceros que recopilarán
        información con fines estadísticos, de uso del Site por parte del usuario y para la prestación
        de otros servicios relacionados con la actividad del Website y otros servicios de Internet.
      </p>
      <p>
        En particular, este sitio Web utiliza <strong>Vercel Analytics</strong>, un servicio de
        medición de audiencia prestado por Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723,
        Estados Unidos). Se trata de una solución analítica que <strong>no utiliza cookies ni rastrea
        a usuarios individuales</strong>: la información se recopila de forma agregada y anónima, sin
        almacenar datos personales identificables, con la única finalidad de conocer el uso general
        del Sitio Web y mejorar nuestros productos y servicios. Por este motivo, esta analítica no
        requiere tu consentimiento previo.
      </p>
      <p>
        Asimismo, durante el proceso de pago, nuestro proveedor <strong>Stripe</strong> puede
        establecer cookies propias necesarias para procesar la transacción de forma segura y prevenir
        el fraude. Puedes consultar más información en la{" "}
        <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer">
          política de privacidad de Stripe
        </a>.
      </p>
      <p>
        El Usuario reconoce conocer la posibilidad de rechazar el tratamiento de los datos o
        información rechazando el uso de cookies mediante la selección de la configuración apropiada a
        tal fin en su navegador. Si bien esta opción de bloqueo de cookies en su navegador puede no
        permitirle el uso pleno de todas las funcionalidades del Website.
      </p>

      <h2>Cómo configurar las cookies</h2>
      <p>
        Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la
        configuración de las opciones del navegador instalado en su ordenador:
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a>
        </li>
        <li>
          <a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer">Explorer / Edge</a>
        </li>
        <li>
          <a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" rel="noopener noreferrer">Firefox</a>
        </li>
        <li>
          <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a>
        </li>
      </ul>
    </LegalPage>
  );
}
