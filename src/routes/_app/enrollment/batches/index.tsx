import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/enrollment/batches/')({
  beforeLoad: () => {
    throw redirect({ to: '/enrollment/intake-batch' })
  },
  component: () => null,
})
