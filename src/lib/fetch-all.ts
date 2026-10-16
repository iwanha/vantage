// PostgREST caps every response at 1000 rows, so a plain select() silently
// truncates. Page with .range() until a short page comes back.
// ponytail: O(n) rows per call; move to a SQL aggregate (rpc) past ~10k rows.
export const PAGE_SIZE = 1000;

type Page<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

export async function fetchAll<T>(
  page: (from: number, to: number) => Page<T>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) return rows;
  }
}
