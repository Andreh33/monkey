import type { Locale } from "./storefront-routes";
const es = {
  cartLimit: "El carrito admite hasta 50 productos distintos. Finaliza este pedido antes de añadir más.", invalid: "Revisa los datos de contacto y la dirección de entrega.",
  cart: "Carrito", delivery: "Entrega", payment: "Pago", checkout: "Finalizar compra",
  add: "Añadir al carrito", quantity: "Cantidad", remove: "Quitar", close: "Cerrar carrito",
  empty: "Tu carrito está vacío", shop: "Ver tienda", continue: "Continuar con la entrega", keepShopping: "Seguir comprando",
  subtotal: "Productos", shipping: "Envío", total: "Total", included: "IVA incluido", perUnit: "por unidad",
  loading: "Comprobando precios y disponibilidad…", refresh: "Volver a calcular", customer: "Contacto y dirección de entrega",
  firstName: "Nombre", lastName: "Apellidos", email: "Correo electrónico", phone: "Teléfono",
  addressLine1: "Calle, número y piso", addressLine2: "Información adicional (opcional)", city: "Localidad", region: "Provincia / región", postalCode: "Código postal", country: "País",
  accept: "He leído y acepto las", conditions: "condiciones de compra", and: "y la", privacy: "política de privacidad",
  pay: "Continuar al pago", redirect: "Preparando el pago…", secure: "Pago seguro con Stripe. Revisa el importe antes de confirmar.",
  error: "No se ha podido continuar. Vuelve a intentarlo.", stockError: "Ha cambiado la disponibilidad. Revisa las cantidades del carrito.", countryError: "No podemos enviar este pedido al destino indicado. Contacta con la tienda.",
  changedError: "El pedido ha cambiado. Revisa los datos y vuelve a continuar.", unavailableError: "Uno de los productos ya no está disponible. Retíralo del carrito para continuar.",
  pendingTitle: "Estamos comprobando tu pago", pendingBody: "Tu pedido está registrado, pero el pago todavía no está confirmado. No repitas el pago. Puedes volver a consultar el estado desde esta página.",
  paidTitle: "Tu pedido se ha realizado correctamente", paidBody: "Hemos recibido el pago. Guarda el número de pedido para cualquier consulta.",
  failedTitle: "El pago no se ha completado", failedBody: "No hemos recibido un pago confirmado para este pedido. Puedes volver al carrito e intentarlo de nuevo.",
  expiredTitle: "La sesión de pago ha caducado", expiredBody: "La reserva de este pedido ha terminado. Vuelve al carrito para comprobar la disponibilidad y comenzar de nuevo.",
  orderNumber: "Número de pedido", checking: "Consultando el pedido…", refreshStatus: "Actualizar estado", confirmationError: "No podemos consultar este pedido. Comprueba el enlace o contacta con la tienda.",
  cancelled: "Has vuelto del pago. Tus productos siguen en el carrito; todavía no se ha confirmado la compra.",
  backCart: "Volver al carrito", summary: "Resumen del pedido", destination: "Destino del envío", shippingNotice: "El envío se calcula para cada unidad y se suma al total.",
  consent: "Acepta las condiciones de compra y la política de privacidad para continuar.", added: "Añadido al carrito", full: "Ya tienes todas las unidades disponibles en el carrito.", contact: "Contactar con la tienda",
};
export type CheckoutCopy = typeof es;
export const checkoutCopy: Record<Locale, CheckoutCopy> = {
  es,
  fr: {
    cartLimit: "Le panier accepte jusqu’à 50 produits différents. Finalisez cette commande avant d’en ajouter davantage.", invalid: "Vérifiez vos coordonnées et votre adresse de livraison.",
    cart: "Panier", delivery: "Livraison", payment: "Paiement", checkout: "Finaliser la commande",
    add: "Ajouter au panier", quantity: "Quantité", remove: "Retirer", close: "Fermer le panier",
    empty: "Votre panier est vide", shop: "Voir la boutique", continue: "Continuer vers la livraison", keepShopping: "Continuer mes achats",
    subtotal: "Produits", shipping: "Livraison", total: "Total", included: "TVA incluse", perUnit: "par unité",
    loading: "Vérification des prix et des disponibilités…", refresh: "Recalculer", customer: "Coordonnées et adresse de livraison",
    firstName: "Prénom", lastName: "Nom", email: "Adresse e-mail", phone: "Téléphone",
    addressLine1: "Rue, numéro et appartement", addressLine2: "Complément d’adresse (facultatif)", city: "Ville", region: "Département / région", postalCode: "Code postal", country: "Pays",
    accept: "J’ai lu et j’accepte les", conditions: "conditions de vente", and: "et la", privacy: "politique de confidentialité",
    pay: "Continuer vers le paiement", redirect: "Préparation du paiement…", secure: "Paiement sécurisé avec Stripe. Vérifiez le montant avant de confirmer.",
    error: "Impossible de continuer. Veuillez réessayer.", stockError: "La disponibilité a changé. Vérifiez les quantités du panier.", countryError: "Nous ne pouvons pas livrer cette commande à la destination indiquée. Contactez la boutique.",
    changedError: "La commande a changé. Vérifiez vos informations et recommencez.", unavailableError: "Un produit n’est plus disponible. Retirez-le du panier pour continuer.",
    pendingTitle: "Nous vérifions votre paiement", pendingBody: "Votre commande est enregistrée, mais le paiement n’est pas encore confirmé. Ne payez pas une deuxième fois. Vous pouvez consulter son état sur cette page.",
    paidTitle: "Votre commande a bien été passée", paidBody: "Nous avons reçu votre paiement. Conservez le numéro de commande pour toute question.",
    failedTitle: "Le paiement n’a pas été finalisé", failedBody: "Aucun paiement confirmé n’a été reçu pour cette commande. Vous pouvez revenir au panier et réessayer.",
    expiredTitle: "La session de paiement a expiré", expiredBody: "La réservation de cette commande a expiré. Revenez au panier pour vérifier la disponibilité et recommencer.",
    orderNumber: "Numéro de commande", checking: "Consultation de la commande…", refreshStatus: "Actualiser l’état", confirmationError: "Cette commande ne peut pas être consultée. Vérifiez le lien ou contactez la boutique.",
    cancelled: "Vous êtes revenu du paiement. Vos produits sont toujours dans le panier ; l’achat n’est pas encore confirmé.",
    backCart: "Revenir au panier", summary: "Récapitulatif de la commande", destination: "Destination de livraison", shippingNotice: "Les frais de livraison sont calculés par unité et ajoutés au total.",
    consent: "Acceptez les conditions de vente et la politique de confidentialité pour continuer.", added: "Ajouté au panier", full: "Toutes les unités disponibles sont déjà dans votre panier.", contact: "Contacter la boutique",
  },
  it: {
    cartLimit: "Il carrello può contenere fino a 50 prodotti diversi. Completa questo ordine prima di aggiungerne altri.", invalid: "Controlla i dati di contatto e l’indirizzo di consegna.",
    cart: "Carrello", delivery: "Consegna", payment: "Pagamento", checkout: "Completa l’acquisto",
    add: "Aggiungi al carrello", quantity: "Quantità", remove: "Rimuovi", close: "Chiudi il carrello",
    empty: "Il carrello è vuoto", shop: "Vai al negozio", continue: "Continua con la consegna", keepShopping: "Continua gli acquisti",
    subtotal: "Prodotti", shipping: "Spedizione", total: "Totale", included: "IVA inclusa", perUnit: "per unità",
    loading: "Verifica di prezzi e disponibilità…", refresh: "Ricalcola", customer: "Contatti e indirizzo di consegna",
    firstName: "Nome", lastName: "Cognome", email: "Indirizzo e-mail", phone: "Telefono",
    addressLine1: "Via, numero civico e interno", addressLine2: "Informazioni aggiuntive (facoltative)", city: "Città", region: "Provincia / regione", postalCode: "CAP", country: "Paese",
    accept: "Ho letto e accetto le", conditions: "condizioni di acquisto", and: "e l’", privacy: "informativa sulla privacy",
    pay: "Continua al pagamento", redirect: "Preparazione del pagamento…", secure: "Pagamento sicuro con Stripe. Controlla l’importo prima di confermare.",
    error: "Impossibile continuare. Riprova.", stockError: "La disponibilità è cambiata. Controlla le quantità nel carrello.", countryError: "Non possiamo spedire questo ordine alla destinazione indicata. Contatta il negozio.",
    changedError: "L’ordine è cambiato. Controlla i dati e continua di nuovo.", unavailableError: "Un prodotto non è più disponibile. Rimuovilo dal carrello per continuare.",
    pendingTitle: "Stiamo verificando il pagamento", pendingBody: "L’ordine è registrato, ma il pagamento non è ancora confermato. Non ripetere il pagamento. Puoi controllarne lo stato da questa pagina.",
    paidTitle: "Il tuo ordine è stato effettuato correttamente", paidBody: "Abbiamo ricevuto il pagamento. Conserva il numero d’ordine per qualsiasi richiesta.",
    failedTitle: "Il pagamento non è stato completato", failedBody: "Non abbiamo ricevuto un pagamento confermato per questo ordine. Puoi tornare al carrello e riprovare.",
    expiredTitle: "La sessione di pagamento è scaduta", expiredBody: "La prenotazione di questo ordine è terminata. Torna al carrello per verificare la disponibilità e ricominciare.",
    orderNumber: "Numero d’ordine", checking: "Verifica dell’ordine…", refreshStatus: "Aggiorna stato", confirmationError: "Non possiamo consultare questo ordine. Controlla il link o contatta il negozio.",
    cancelled: "Sei tornato dal pagamento. I prodotti sono ancora nel carrello; l’acquisto non è ancora confermato.",
    backCart: "Torna al carrello", summary: "Riepilogo dell’ordine", destination: "Destinazione della spedizione", shippingNotice: "La spedizione viene calcolata per ogni unità e aggiunta al totale.",
    consent: "Accetta le condizioni di acquisto e l’informativa sulla privacy per continuare.", added: "Aggiunto al carrello", full: "Hai già tutte le unità disponibili nel carrello.", contact: "Contatta il negozio",
  },
  pt: {
    cartLimit: "O carrinho permite até 50 produtos diferentes. Finalize esta encomenda antes de adicionar mais.", invalid: "Verifique os dados de contacto e a morada de entrega.",
    cart: "Carrinho", delivery: "Entrega", payment: "Pagamento", checkout: "Finalizar compra",
    add: "Adicionar ao carrinho", quantity: "Quantidade", remove: "Remover", close: "Fechar carrinho",
    empty: "O seu carrinho está vazio", shop: "Ver loja", continue: "Continuar para a entrega", keepShopping: "Continuar a comprar",
    subtotal: "Produtos", shipping: "Envio", total: "Total", included: "IVA incluído", perUnit: "por unidade",
    loading: "A verificar preços e disponibilidade…", refresh: "Recalcular", customer: "Contacto e morada de entrega",
    firstName: "Nome", lastName: "Apelidos", email: "Email", phone: "Telefone",
    addressLine1: "Rua, número e andar", addressLine2: "Informações adicionais (opcional)", city: "Localidade", region: "Distrito / região", postalCode: "Código postal", country: "País",
    accept: "Li e aceito as", conditions: "condições de compra", and: "e a", privacy: "política de privacidade",
    pay: "Continuar para o pagamento", redirect: "A preparar o pagamento…", secure: "Pagamento seguro com Stripe. Verifique o valor antes de confirmar.",
    error: "Não foi possível continuar. Tente novamente.", stockError: "A disponibilidade mudou. Verifique as quantidades no carrinho.", countryError: "Não podemos enviar esta encomenda para o destino indicado. Contacte a loja.",
    changedError: "A encomenda mudou. Verifique os dados e volte a continuar.", unavailableError: "Um produto já não está disponível. Remova-o do carrinho para continuar.",
    pendingTitle: "Estamos a verificar o pagamento", pendingBody: "A encomenda está registada, mas o pagamento ainda não foi confirmado. Não repita o pagamento. Pode consultar o estado nesta página.",
    paidTitle: "A sua encomenda foi efetuada com sucesso", paidBody: "Recebemos o pagamento. Guarde o número da encomenda para qualquer questão.",
    failedTitle: "O pagamento não foi concluído", failedBody: "Não recebemos um pagamento confirmado para esta encomenda. Pode voltar ao carrinho e tentar novamente.",
    expiredTitle: "A sessão de pagamento expirou", expiredBody: "A reserva desta encomenda terminou. Volte ao carrinho para verificar a disponibilidade e começar de novo.",
    orderNumber: "Número da encomenda", checking: "A consultar a encomenda…", refreshStatus: "Atualizar estado", confirmationError: "Não podemos consultar esta encomenda. Verifique o link ou contacte a loja.",
    cancelled: "Voltou do pagamento. Os produtos continuam no carrinho; a compra ainda não foi confirmada.",
    backCart: "Voltar ao carrinho", summary: "Resumo da encomenda", destination: "Destino do envio", shippingNotice: "O envio é calculado por unidade e somado ao total.",
    consent: "Aceite as condições de compra e a política de privacidade para continuar.", added: "Adicionado ao carrinho", full: "Já tem todas as unidades disponíveis no carrinho.", contact: "Contactar a loja",
  },
};
export function checkoutMoney(cents: number, locale: Locale) {
  return new Intl.NumberFormat({ es: "es-ES", fr: "fr-FR", it: "it-IT", pt: "pt-PT" }[locale], { style: "currency", currency: "EUR" }).format(cents / 100);
}
export function checkoutError(code: string | undefined, locale: Locale) {
  const d = checkoutCopy[locale];
  if (code && /STOCK|QUANTITY/.test(code)) return d.stockError;
  if (code && /COUNTRY|POSTAL|SHIPPING|DESTINATION/.test(code)) return d.countryError;
  if (code && /UNAVAILABLE|PRODUCT_NOT_FOUND|INACTIVE/.test(code)) return d.unavailableError;
  if (code && /CHANGED|CONFLICT|EXPIRED/.test(code)) return d.changedError;
  if (code === "INVALID_REQUEST") return d.invalid;
  return d.error;
}
