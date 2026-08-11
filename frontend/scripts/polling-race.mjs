/**
 * Verifikasi algoritma anti-drop / anti-race pada usePolling.
 *
 * Project ini belum memiliki test framework React (react-test-renderer /
 * @testing-library/react / jsdom tidak tersedia) dan instruksi menegaskan
 * agar tidak menambah framework baru. File ini memodelkan ALGORITMA yang
 * sama persis dengan implementasi usePolling (refs busy/pending/inflight/
 * intent + re-run di finally) sebagai state machine deterministik, lalu
 * memverifikasi skenario race pada timeline:
 *
 *   fetch A sedang berjalan
 *   → fetchFn berubah ke B
 *   → B harus tetap dieksekusi (tidak di-drop)
 *   → response A tidak boleh menimpa state
 *
 * Catatan: ini model logika (bukan rendering React), dipakai sebagai
 * smoke test tambahan — bukan pengganti test renderer.
 *
 * Jalankan: `npm run smoke:polling`
 */
import assert from 'node:assert/strict'

function createPollingModel() {
  // Model refs — mencerminkan refs pada usePolling.
  let busy = false
  let pending = false
  let inflightFetchFn = null
  let intentFetchFn = null
  let enabled = true
  let latestLoad = null

  let fetchFn = null
  let data = null
  let error = null
  const started = []
  let currentOp = null

  const setFetchFn = (label) => {
    fetchFn = label
    latestLoad = load
  }

  const setEnabled = (value) => {
    enabled = value
  }

  const load = ({ silent = false } = {}) => {
    intentFetchFn = fetchFn

    if (busy) {
      if (fetchFn !== inflightFetchFn) pending = true
      else pending = false
      return undefined
    }

    busy = true
    inflightFetchFn = fetchFn

    if (!silent) {
      data = null
      error = null
    }

    started.push(fetchFn)
    currentOp = { fetchFn }
    return { label: fetchFn }
  }

  // Menyamai alur try/catch/finally pada usePolling:
  // state hanya diterapkan jika konteks masih yang terbaru, lalu re-run
  // fetch terbaru bila ada pending.
  const settle = (kind, value) => {
    const op = currentOp

    if (kind === 'resolve') {
      if (op.fetchFn === intentFetchFn) {
        data = value
        error = null
      }
    } else if (op.fetchFn === intentFetchFn) {
      error = value
    }

    busy = false
    inflightFetchFn = null

    const shouldRerun = pending && enabled
    pending = false
    if (shouldRerun) load({ silent: false })
  }

  return {
    get data() {
      return data
    },
    get error() {
      return error
    },
    get started() {
      return [...started]
    },
    get pending() {
      return pending
    },
    setFetchFn,
    setEnabled,
    load,
    settle,
  }
}

const tests = []
const t = (name, fn) => tests.push({ name, fn })

t('one-shot: fetchFn berubah selagi A berjalan → B tetap dieksekusi, response A dibuang', () => {
  const m = createPollingModel()
  m.setFetchFn('A')
  m.load()
  assert.equal(m.started.length, 1)
  assert.equal(m.started[0], 'A')

  m.setFetchFn('B')
  const dropped = m.load()
  assert.equal(dropped, undefined, 'B ditandai pending, bukan dieksekusi saat A berjalan')
  assert.equal(m.started.length, 1, 'B belum mulai (anti-overlap)')
  assert.equal(m.pending, true)

  m.settle('resolve', 'data-A')
  assert.equal(m.data, null, 'response A dibuang, tidak menimpa state')
  assert.equal(m.started.length, 2, 'B dieksekusi ulang setelah A selesai')
  assert.equal(m.started[1], 'B')

  m.settle('resolve', 'data-B')
  assert.equal(m.data, 'data-B', 'data terbaru menang')
  assert.equal(m.started.length, 2, 'tidak ada fetch tambahan')
})

t('StrictMode double-effect (fetchFn sama) → response pertama tetap diterapkan', () => {
  const m = createPollingModel()
  m.setFetchFn('A')
  m.load()
  const dup = m.load()
  assert.equal(dup, undefined)
  assert.equal(m.pending, false, 'konteks sama → tidak pending')
  m.settle('resolve', 'data-A')
  assert.equal(m.data, 'data-A')
  assert.equal(m.started.length, 1, 'tidak ada re-run')
})

t('A→B→A: kembali ke konteks berjalan → response A diterapkan tanpa re-run', () => {
  const m = createPollingModel()
  m.setFetchFn('A')
  m.load()
  m.setFetchFn('B')
  m.load()
  assert.equal(m.pending, true)
  m.setFetchFn('A')
  m.load()
  assert.equal(m.pending, false, 'kembali ke konteks yang berjalan → pending dibatalkan')
  m.settle('resolve', 'data-A')
  assert.equal(m.data, 'data-A')
  assert.equal(m.started.length, 1, 'tidak ada fetch tambahan')
})

t('polling anti-overlap: tick saat busy (konteks sama) di-skip, tanpa re-run', () => {
  const m = createPollingModel()
  m.setFetchFn('A')
  m.load()
  m.load({ silent: true })
  assert.equal(m.pending, false)
  assert.equal(m.started.length, 1)
  m.settle('resolve', 'data-A')
  assert.equal(m.data, 'data-A')
  assert.equal(m.started.length, 1)
})

t('error A yang sudah digantikan dibuang; B berhasil menggantikan', () => {
  const m = createPollingModel()
  m.setFetchFn('A')
  m.load()
  m.setFetchFn('B')
  m.load()
  m.settle('reject', new Error('A gagal'))
  assert.equal(m.error, null, 'error A dibuang karena konteks sudah berubah')
  assert.equal(m.started.length, 2)
  m.settle('resolve', 'data-B')
  assert.equal(m.data, 'data-B')
  assert.equal(m.error, null)
})

t('disabled saat pending → tidak ada re-run setelah request selesai', () => {
  const m = createPollingModel()
  m.setFetchFn('A')
  m.load()
  m.setFetchFn('B')
  m.load()
  m.setEnabled(false)
  m.settle('resolve', 'data-A')
  assert.equal(m.started.length, 1, 'tidak ada re-run karena disabled')
})

let failed = 0
for (const { name, fn } of tests) {
  try {
    fn()
    console.log(`  PASS  ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  FAIL  ${name}`)
    console.error(`        ${e && e.message ? e.message : e}`)
  }
}

console.log(`\n${tests.length - failed}/${tests.length} polling race checks passed`)
process.exit(failed > 0 ? 1 : 0)
