import { LegalPage } from "@/components/legal/LegalPage";
import { EMPRESA } from "@/config/empresa";

export const metadata = {
  title: "Política de Privacidad",
  description: `Política de privacidad y protección de datos de ${EMPRESA.razonSocial} (${EMPRESA.marca}), conforme al RGPD y la LOPDGDD.`,
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="★ TUS DATOS ★"
      title="Política de Privacidad y"
      titleAccent="Protección de Datos"
      updated={EMPRESA.actualizado}
    >
      <h2>1. Recogida, tratamiento y uso de los datos personales en la web</h2>
      <p>
        En base a lo dispuesto en el Reglamento General de Protección de Datos 2016/679 (RGPD) y en
        la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de derechos digitales
        (LOPDGDD), le informamos que para hacer uso de algunos de los servicios que le ofrece nuestra
        web, puede ser necesario que nos suministre determinados datos de carácter personal que serán
        incorporados a ficheros automatizados.
      </p>
      <p>
        Cumpliendo con las nuevas disposiciones del Reglamento (UE) 2016/679 del PE y del Consejo de
        27 de abril de 2016 y de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos
        Personales y garantía de derechos digitales, relativas a la protección de las personas físicas
        en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos
        y por el que se deroga la Directiva 95/46/CE, le informamos que el responsable del tratamiento
        de los datos es <strong>{EMPRESA.razonSocial}</strong>, con domicilio social en C/ Jaume I, 5,
        bajo, local 1, 43005 (Tarragona).
      </p>
      <p>
        Para realizar cualquier tipo de observación respecto a posibles incumplimientos de los
        derechos de propiedad intelectual o industrial, así como sobre cualquiera de los contenidos
        del sitio web, puede hacerlo a través del correo electrónico{" "}
        <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a> o a la siguiente dirección postal:
        C/ Jaume I, 5, bajo, local 1, 43005 (Tarragona).
      </p>
      <p>
        Con carácter general, los datos recogidos serán tratados con la finalidad de prestar los
        servicios ofrecidos a través de la web o atender otros tipos de relaciones que puedan surgir
        con {EMPRESA.razonSocial} como consecuencia de las solicitudes, gestiones o trámites que el
        Usuario realice mediante la web. Los datos objeto de tratamiento serán aquellos que nos
        facilite a través de los formularios que en cada momento contenga la página o a través de los
        correos electrónicos que el Usuario dirija a las direcciones de correo electrónico
        identificadas en la misma, así como aquellos otros que se generen durante el mantenimiento de
        la relación correspondiente.
      </p>
      <p>
        Todos los campos que aparecen señalados como obligatorios en cualquiera de los formularios
        deberán ser cumplimentados necesariamente, de tal modo que la omisión de alguno de ellos podrá
        comportar la imposibilidad de que podamos atender su solicitud o prestarle los servicios
        correspondientes.
      </p>
      <p>
        Adicionalmente, durante dicha recogida de datos, es posible que se solicite su consentimiento
        para otra serie de finalidades que no guardan una relación directa con el servicio o la
        relación correspondiente. En el caso de que no esté de acuerdo con dichos tratamientos
        adicionales, marque la casilla destinada al efecto según corresponda.
      </p>

      <h2>2. Finalidad del tratamiento de los datos personales</h2>
      <h3>2.1. ¿Con qué finalidad trataremos tus datos personales?</h3>
      <p>
        En {EMPRESA.razonSocial} trataremos tus datos personales, recabados a través del Sitio Web
        con las siguientes finalidades:
      </p>
      <ul>
        <li>Envío de información solicitada a través de los formularios dispuestos en el Sitio Web.</li>
      </ul>
      <p>
        Te recordamos que puedes oponerte al envío de comunicaciones comerciales por cualquier vía y
        en cualquier momento, remitiendo un correo electrónico a la dirección de correo electrónico
        indicada anteriormente.
      </p>
      <p>
        Los campos de dichos registros son de cumplimentación obligatoria, siendo imposible realizar
        las finalidades expresadas si no se aportan esos datos.
      </p>
      <h3>2.2. ¿Por cuánto tiempo se conservan los datos personales recabados?</h3>
      <p>
        Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial
        o no solicites su supresión y durante el plazo por el cual pudieran derivarse
        responsabilidades legales por los servicios prestados.
      </p>

      <h2>3. Legitimación</h2>
      <p>
        El tratamiento de tus datos se realiza con las siguientes bases jurídicas que legitiman el
        mismo:
      </p>
      <ul>
        <li>
          El consentimiento libre, específico, informado e inequívoco, en tanto que te informamos
          poniendo a tu disposición la presente política de privacidad, que tras la lectura de la
          misma, en caso de estar conforme, puedes aceptar mediante una declaración o una clara acción
          afirmativa, como el marcado de una casilla dispuesta al efecto.
        </li>
      </ul>
      <p>
        En caso de que no nos facilites tus datos o los hagas de forma errónea o incompleta, no
        podremos atender tu solicitud, resultando del todo imposible proporcionarte la información
        solicitada o llevar a cabo la contratación de los servicios.
      </p>

      <h2>4. Conservación de los datos</h2>
      <p>
        Sus datos se conservarán mientras se mantenga la relación o durante los años necesarios para
        cumplir con las obligaciones legales, mientras no solicite su cese o durante el tiempo
        necesario para la realización de los fines necesarios para los recabados.
      </p>

      <h2>5. Destinatarios</h2>
      <p>
        Sus datos serán conservados bajo estrictas medidas de seguridad que garanticen la
        confidencialidad y la seguridad de los mismos. Del mismo modo, sólo serán cedidos a las
        entidades y para las finalidades siguientes:
      </p>
      <ul>
        <li>
          Entidades y proveedores que prestan servicios a {EMPRESA.razonSocial} para la correcta
          ejecución de la venta de nuestros productos o servicios. Dichas entidades y proveedores se
          encuentran debidamente acreditados y firman con nosotros el correspondiente contrato de
          tratamiento de datos en cumplimiento de la normativa de protección de datos vigente.
        </li>
        <li>Organismos y entidades oficiales en cumplimiento de las normativas y leyes vigentes.</li>
      </ul>
      <p>
        Cualquier transferencia internacional de datos derivada del uso de servicios de proveedores
        estadounidenses se realizará con las debidas garantías, conforme al marco{" "}
        <strong>EU-US Data Privacy Framework</strong> y/o a las Cláusulas Contractuales Tipo aprobadas
        por la Comisión Europea, que garantizan un nivel de protección adecuado de tus datos.
      </p>
      <p>
        Los datos no se comunicarán a ningún tercero ajeno a {EMPRESA.razonSocial}, salvo obligación
        legal.
      </p>
      <p>
        Para procesar los pagos realizados en el Sitio Web utilizamos la pasarela de pago{" "}
        <strong>Stripe</strong> (Stripe Payments Europe, Ltd.). Al efectuar un pago, los datos
        necesarios para completar la transacción son tratados por Stripe en condición de proveedor de
        servicios de pago, conforme a su propia política de privacidad. {EMPRESA.razonSocial} no
        almacena los datos completos de tu tarjeta.
      </p>

      <h2>6. Derechos</h2>
      <p>
        Como interesado que nos has proporcionado tus datos personales, tienes pleno derecho a obtener
        confirmación sobre si en {EMPRESA.razonSocial} estamos tratando tus datos personales, y en
        concreto estás facultado para ejercitar los siguientes derechos que la normativa en materia de
        protección de datos te reconoce, conforme a lo previsto en la misma:
      </p>
      <ul>
        <li>Derecho de <strong>ACCESO</strong> a tus datos personales.</li>
        <li>Derecho a solicitar la <strong>RECTIFICACIÓN</strong> de los datos inexactos.</li>
        <li>
          Derecho a solicitar su <strong>SUPRESIÓN</strong> cuando, entre otros motivos, los datos ya
          no sean necesarios para los fines que fueron recogidos.
        </li>
        <li>
          En determinadas circunstancias, podrás solicitar la <strong>LIMITACIÓN DEL TRATAMIENTO</strong>{" "}
          de tus datos, en cuyo caso únicamente los conservaremos para el ejercicio o la defensa de
          reclamaciones.
        </li>
        <li>
          En determinadas circunstancias y por motivos relacionados con su situación particular, los
          interesados podrán ejercitar su derecho de <strong>OPOSICIÓN</strong> al tratamiento de sus
          datos. Dejaremos de tratar los datos, salvo por motivos legítimos imperiosos, o el ejercicio
          o la defensa de posibles reclamaciones.
        </li>
        <li>
          En determinadas circunstancias y por motivos relacionados con tu situación particular,
          podrás solicitar su derecho a la <strong>PORTABILIDAD</strong> de los datos.
        </li>
      </ul>
      <p>
        Podrás ejercer tales derechos o solicitar información adicional dirigiendo una comunicación a
        la dirección postal situada en C/ Jaume I, 5, bajo, local 1, 43005 (Tarragona), o a través de
        la dirección de correo electrónico <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.
      </p>
      <p>
        Además, en caso de que se haya vulnerado cualquiera de tus derechos, el interesado tiene
        derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), en
        C/ Jorge Juan, 6, 28001 Madrid, o a través de la sede electrónica de la AEPD:{" "}
        <a href="https://sedeagpd.gob.es/sede-electronica-web/" target="_blank" rel="noopener noreferrer">
          https://sedeagpd.gob.es/sede-electronica-web/
        </a>.
      </p>
    </LegalPage>
  );
}
