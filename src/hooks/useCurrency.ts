import { useTenantStore } from '#/stores/tenantStore'

const FALLBACK_CURRENCY = 'MMK'

export function useCurrency() {
  const currencyCode = useTenantStore(
    (s) => s.tenant?.schoolConfig?.currencyCode ?? FALLBACK_CURRENCY,
  )

  function formatAmount(n?: number | null): string {
    if (n == null) return '—'
    return n.toLocaleString()
  }

  return { currencyCode, formatAmount }
}
