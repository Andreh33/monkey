export function BlackFridayRibbon({ reverse = false }: { reverse?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none overflow-hidden bg-black py-0.5 text-white sm:py-1">
      <div className="flex w-max items-center whitespace-nowrap font-display text-xs leading-none tracking-widest motion-safe:animate-marquee sm:text-lg" style={{ animationDirection: reverse ? 'reverse' : 'normal' }}>
        {[0, 1].map(copy => (
          <div key={copy} className="flex min-w-[100vw] shrink-0 items-center justify-between gap-5 pr-5">
            {Array.from({ length: 16 }, (_, index) => (
              <span key={index} className="flex shrink-0 items-center gap-5">
                BLACK FRIDAY <span className="text-accent-red">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
