export function BlackFridayRibbon({ reverse = false }: { reverse?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none overflow-hidden bg-black py-0.5 text-white sm:py-1">
      <div className={`flex w-max items-center gap-5 whitespace-nowrap font-display text-xs leading-none tracking-widest sm:text-lg ${reverse ? '-translate-x-20' : '-translate-x-4'}`}>
        {Array.from({ length: 24 }, (_, index) => (
          <span key={index} className="flex items-center gap-5">
            BLACK FRIDAY <span className="text-accent-red">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
