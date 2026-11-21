export function BlackFridayRibbon({ reverse = false }: { reverse?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none overflow-hidden bg-black py-1 text-white">
      <div className={`flex w-max items-center gap-5 whitespace-nowrap font-display text-lg leading-none tracking-widest ${reverse ? '-translate-x-20' : '-translate-x-4'}`}>
        {Array.from({ length: 24 }, (_, index) => (
          <span key={index} className="flex items-center gap-5">
            BLACK FRIDAY <span className="text-accent-red">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
