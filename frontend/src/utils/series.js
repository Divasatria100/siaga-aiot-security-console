/**
 * Downsampling deret record dengan sampling merata agar tetap menjaga
 * bentuk tren pada rentang yang besar, tanpa membuang titik secara
 * sembarangan. Selalu mempertahankan record pertama dan terakhir.
 * Mengembalikan array baru bila jumlah record melebihi `maxPoints`,
 * sebaliknya mengembalikan array asli.
 *
 * @param {T[]} records Deret record yang sudah diurutkan berdasarkan waktu
 * @param {number} maxPoints Batas maksimum titik yang dipertahankan
 * @returns {T[]}
 * @template T
 */
export function downsampleRecords(records, maxPoints) {
  if (!Array.isArray(records) || records.length <= maxPoints || maxPoints < 2) {
    return records
  }
  const result = []
  const step = (records.length - 1) / (maxPoints - 1)
  for (let i = 0; i < maxPoints; i++) {
    result.push(records[Math.round(i * step)])
  }
  return result
}