# Pagos y pedidos

El precio y el envío se editan en **Admin → Productos**. Cada unidad suma su propia tarifa de envío. Los cambios invalidan las páginas del catálogo; Stripe recibe siempre los importes actuales del servidor, sin crear enlaces manuales. Un pedido ya iniciado conserva sus importes originales.

**Admin → Pedidos** muestra contacto, dirección, productos, cantidades, envío, total y referencia de pago. El botón verde **WhatsApp** abre el chat del comprador con un mensaje de Angy preparado; el envío del mensaje es manual. Los números inválidos no generan un enlace.

El estado de pago lo determina Stripe. Sólo los pedidos pagados pueden prepararse, enviarse o entregarse. Un cobro tardío sin stock disponible sigue figurando como pagado y muestra **Revisar stock**: reponer existencias y usar esa acción antes de preparar el envío.

## Configuración del servidor

- `STRIPE_SECRET_KEY`: clave de la cuenta correspondiente al entorno; requiere crear, leer, listar y caducar Checkout Sessions.
- `STRIPE_WEBHOOK_SECRET`: firma del endpoint `/api/stripe/webhook`.
- `CHECKOUT_ORIGIN`: dominio de la tienda para volver de Stripe.
- `CHECKOUT_ENCRYPTION_KEY`: opcional; usa `NEXTAUTH_SECRET` si falta. Debe permanecer estable para recuperar solicitudes cuyo resultado inicial fue incierto.

El webhook recibe `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` y `checkout.session.expired`. Verifica firma, sesión, cuenta/entorno, moneda e importe antes de actualizar el pedido. Los duplicados no vuelven a descontar stock.

Las reservas duran 35 minutos. Cancelar Stripe libera la reserva tras verificar su caducidad. Las consultas del carrito recuperan reservas antiguas consultando Stripe; una caída del proveedor conserva la reserva hasta poder verificar el resultado. Nunca se da un pago por correcto sólo por visitar la página de confirmación.

## Despliegue

El build de Vercel ejecuta `scripts/migrate-checkout.mjs` antes de compilar. Aplica únicamente la migración aditiva del checkout, en una transacción con registro de ejecución; conserva productos y pedidos históricos. Requiere el esquema existente de la tienda. Las instalaciones nuevas deben inicializar primero el esquema completo con las migraciones habituales.

Usar claves de prueba y una base de datos aislada para simular cobros. Nunca cargar claves live en esa base de pruebas. Los datos de contacto no se guardan en el carrito del navegador.

El servicio independiente de matriculaciones conserva su proceso de pago.
