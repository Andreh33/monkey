"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonkeyWalker = dynamic(() => import("./MonkeyWalker"), {
  ssr: false,
});

/**
 * Difiere el mono 3D hasta que la página ha cargado o el usuario interactúa.
 *
 * Motivo (Lighthouse móvil): el chunk de three.js + el GLB de ~6,9 MB se
 * descargaban nada más hidratar (useGLTF.preload a nivel de módulo) y
 * saturaban la red compitiendo con la imagen del hero → LCP de 33 s y ~6 MB
 * de peso inicial. Montándolo tras `load` + margen (o al primer gesto del
 * usuario) el hero pinta primero y el mono sigue apareciendo igual.
 */
export default function MonkeyWalkerLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart", "scroll"];

    const activate = () => {
      if (done) return;
      done = true;
      events.forEach((e) => window.removeEventListener(e, activate));
      setReady(true);
    };

    events.forEach((e) => window.addEventListener(e, activate, { once: true, passive: true }));

    // Tras el evento load (o si ya pasó), espera un margen para no pisar el LCP.
    const afterLoad = () => timeouts.push(setTimeout(activate, 2500));
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    // Red de seguridad por si `load` tarda demasiado (páginas muy pesadas).
    timeouts.push(setTimeout(activate, 9000));

    return () => {
      events.forEach((e) => window.removeEventListener(e, activate));
      window.removeEventListener("load", afterLoad);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  if (!ready) return null;
  return <MonkeyWalker />;
}
