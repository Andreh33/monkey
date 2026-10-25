"use client";
import { useState } from "react";
type Category = {
  slug: string;
  label: string;
  subs: { slug: string; label: string }[];
};
export function CategoryFields({
  categories,
  initialCategory,
  initialSubcategory,
  labels,
}: {
  categories: Category[];
  initialCategory: string;
  initialSubcategory: string;
  labels: { category: string; subcategory: string; all: string };
}) {
  const [category, setCategory] = useState(initialCategory),
    [sub, setSub] = useState(initialSubcategory);
  return (
    <>
      <label>
        <span className="label-base">{labels.category}</span>
        <select
          name="cat"
          className="input-base"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSub("");
          }}
        >
          <option value="">{labels.all}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label-base">{labels.subcategory}</span>
        <select
          className="input-base"
          name="sub"
          value={sub}
          onChange={(e) => setSub(e.target.value)}
        >
          <option value="">{labels.all}</option>
          {categories
            .find((c) => c.slug === category)
            ?.subs.map((s) => (
              <option value={s.slug} key={s.slug}>
                {s.label}
              </option>
            ))}
        </select>
      </label>
    </>
  );
}
