"use client";

import { useMemo } from "react";

/**
 * Confeti + serpentina + globos, 100% CSS (sin librerías).
 * Va detrás del contenido del overlay (z-index lo controla el padre).
 * Colores de marca visibles sobre fondo oscuro.
 */

const COLORES = ["#FFD60A", "#FF2A2A", "#FF003C", "#FFFFFF", "#FF8A00"];

// Math.random es seguro aquí: el componente solo se monta en cliente.
const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

export function Confeti() {
  const { cayendo, estallido, cintas, globos } = useMemo(() => {
    const cayendo = Array.from({ length: 70 }, () => ({
      left: `${rnd(0, 100)}%`,
      bg: pick(COLORES),
      delay: `${rnd(0, 4)}s`,
      dur: `${rnd(4, 8)}s`,
      rot: `${rnd(180, 1080)}deg`,
      w: `${rnd(5, 10)}px`,
      h: `${rnd(8, 16)}px`,
    }));

    // Estallido tipo "party popper" desde el centro (una sola vez).
    const estallido = Array.from({ length: 60 }, () => {
      const ang = rnd(0, Math.PI * 2);
      const dist = rnd(120, 520);
      return {
        bg: pick(COLORES),
        tx: `${Math.cos(ang) * dist}px`,
        ty: `${Math.sin(ang) * dist - 80}px`,
        dur: `${rnd(0.9, 1.6)}s`,
        rot: `${rnd(180, 720)}deg`,
        w: `${rnd(6, 11)}px`,
        h: `${rnd(8, 16)}px`,
      };
    });

    const cintas = Array.from({ length: 14 }, () => ({
      left: `${rnd(0, 100)}%`,
      bg: pick(COLORES),
      delay: `${rnd(0, 3)}s`,
      dur: `${rnd(5, 9)}s`,
      h: `${rnd(40, 80)}px`,
    }));

    const globos = Array.from({ length: 9 }, () => ({
      left: `${rnd(2, 96)}%`,
      bg: pick(COLORES),
      delay: `${rnd(0, 5)}s`,
      dur: `${rnd(7, 12)}s`,
      size: `${rnd(28, 46)}px`,
    }));

    return { cayendo, estallido, cintas, globos };
  }, []);

  return (
    <div className="ani-confeti" aria-hidden="true">
      {/* Estallido central */}
      {estallido.map((p, i) => (
        <i
          key={`b${i}`}
          className="ani-estallido"
          style={
            {
              background: p.bg,
              width: p.w,
              height: p.h,
              ["--tx" as string]: p.tx,
              ["--ty" as string]: p.ty,
              ["--rot" as string]: p.rot,
              animationDuration: p.dur,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Confeti cayendo */}
      {cayendo.map((p, i) => (
        <i
          key={`c${i}`}
          className="ani-pieza"
          style={
            {
              left: p.left,
              background: p.bg,
              width: p.w,
              height: p.h,
              animationDelay: p.delay,
              animationDuration: p.dur,
              ["--rot" as string]: p.rot,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Serpentina */}
      {cintas.map((p, i) => (
        <i
          key={`s${i}`}
          className="ani-cinta"
          style={
            {
              left: p.left,
              background: p.bg,
              height: p.h,
              animationDelay: p.delay,
              animationDuration: p.dur,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Globos subiendo */}
      {globos.map((p, i) => (
        <i
          key={`g${i}`}
          className="ani-globo"
          style={
            {
              left: p.left,
              background: p.bg,
              width: p.size,
              height: `calc(${p.size} * 1.2)`,
              animationDelay: p.delay,
              animationDuration: p.dur,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
