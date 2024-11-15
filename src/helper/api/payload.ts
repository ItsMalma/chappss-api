/**
 * Type untuk struktur response body dari API.
 * Terdapat dua properti, yaitu `data` dan `error`.
 *
 * Karena API hanya mengembalikan dua kemungkinan, yaitu sukses atau tidak sukses.
 * Maka, di satu kemungkinan, hanya salah satu properti yang akan memiliki nilai, sedangkan yang lainnya `null`.
 *
 * Jika sukses, maka properti `data` yang memiliki nilai, sedangkan `error` `null`.
 * Jika tidak sukses, maka properti `error` yang memiliki nilai, sedangkan `data` `null`.
 *
 * @example
 * ```typescript
 * // Sukses
 * const response: Payload<{ id: number }, null> = {
 *   data: { id: 1 },
 *   error: null,
 * };
 *
 * // Tidak sukses
 * const response: Payload<null, string> = {
 *   data: null,
 *   error: "Not found",
 * };
 *
 * // Never
 * const response: Payload<null, null> = {
 *   data: null,
 *   error: null,
 * };
 * ```
 *
 * @template Data Tipe data yang diharapkan dari API.
 * @template Err Tipe error yang diharapkan dari API.
 */
type Payload<Data, Err = unknown> = Data extends null
  ? Err extends null
    ? never
    : {
        /**
         * Kembalian data dari API.
         *
         * Karena error (tidak sukses), maka tidak ada data yang dikembalikan.
         */
        data: null;

        /**
         * Kembalian error dari API.
         */
        error: Err;
      }
  : Err extends null
    ? {
        /**
         * Kembalian data dari API.
         */
        data: Data;

        /**
         * Kembalian error dari API.
         *
         * Karena sukses, maka tidak ada error yang dikembalikan.
         */
        error: null;
      }
    : never;

/**
 * Function untuk membuat response sukses dari API.
 *
 * @param data Data yang dikembalikan dari API.
 * @returns
 */
export function ok<Data>(data: Data): Payload<Data, null> {
  return {
    data,
    error: null,
  } as Payload<Data, null>;
}

/**
 * Function untuk membuat response tidak sukses dari API.
 *
 * @param err Error yang dikembalikan dari API.
 * @returns
 */
export function err<Err>(err: Err): Payload<null, Err> {
  return {
    data: null,
    error: err,
  } as Payload<null, Err>;
}
