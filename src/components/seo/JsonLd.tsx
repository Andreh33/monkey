/**
 * Inyecta uno o varios bloques JSON-LD (schema.org) como <script type="application/ld+json">.
 * Acepta un objeto o un array de objetos (renderiza un script por cada uno).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
