import { Search, SlidersHorizontal } from "lucide-react";
import type { JSX } from "react";
import type { ProductCategory, ProductSortOption } from "../../domain/types";
import { getUiDictionary, type UiDictionary } from "../../i18n";

export interface ProductFilterBarProps {
  readonly categories: readonly ProductCategory[];
  readonly q?: string;
  readonly categoryId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sort?: ProductSortOption;
  readonly dict?: UiDictionary;
}

export function ProductFilterBar({
  categories,
  q = "",
  categoryId = "",
  minPrice,
  maxPrice,
  sort = "recommended",
  dict = getUiDictionary("th"),
}: ProductFilterBarProps): JSX.Element {
  return (
    <form
      action="/products"
      method="get"
      aria-label={dict.catalog.filtersTitle}
      className="space-y-2.5 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-3.5 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
    >
      <div className="relative">
        <label htmlFor="catalog-q" className="sr-only">
          {dict.catalog.keyword}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#4A4A45] dark:text-[#D4D4CE]"
          aria-hidden="true"
        />
        <input
          id="catalog-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={dict.nav.searchPlaceholder}
          className="min-h-[44px] w-full rounded-2xl bg-white pr-3 pl-10 text-sm font-medium text-[#111111] placeholder:text-[#4A4A45] focus:outline-2 focus:outline-[#111111] dark:bg-[#111111] dark:text-white dark:placeholder:text-[#D4D4CE]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="catalog-category" className="sr-only">
            {dict.catalog.category}
          </label>
          <select
            id="catalog-category"
            name="category"
            defaultValue={categoryId}
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-bold text-[#111111] dark:bg-[#111111] dark:text-white"
          >
            <option value="">{dict.catalog.allCategoriesOpt}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-sort" className="sr-only">
            {dict.catalog.sortBy}
          </label>
          <select
            id="catalog-sort"
            name="sort"
            defaultValue={sort}
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-bold text-[#111111] dark:bg-[#111111] dark:text-white"
          >
            <option value="recommended">{dict.catalog.sortRecommended}</option>
            <option value="newest">{dict.catalog.sortNewest}</option>
            <option value="price_asc">{dict.catalog.sortPriceAsc}</option>
            <option value="price_desc">{dict.catalog.sortPriceDesc}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="catalog-min" className="sr-only">
            {dict.catalog.minPrice}
          </label>
          <input
            id="catalog-min"
            name="minPrice"
            type="number"
            min={0}
            defaultValue={minPrice}
            placeholder={`${dict.catalog.minPrice} ฿`}
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-semibold text-[#111111] placeholder:text-[#4A4A45] dark:bg-[#111111] dark:text-white dark:placeholder:text-[#D4D4CE]"
          />
        </div>
        <div>
          <label htmlFor="catalog-max" className="sr-only">
            {dict.catalog.maxPrice}
          </label>
          <input
            id="catalog-max"
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={maxPrice}
            placeholder={`${dict.catalog.maxPrice} ฿`}
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-semibold text-[#111111] placeholder:text-[#4A4A45] dark:bg-[#111111] dark:text-white dark:placeholder:text-[#D4D4CE]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#111111] px-3 text-xs font-extrabold text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{dict.catalog.applyFilter}</span>
        </button>
      </div>
    </form>
  );
}
