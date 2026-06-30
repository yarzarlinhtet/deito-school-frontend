import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/users-access/')({
  beforeLoad: () => {
    throw redirect({ to: '/users-access/user-list' })
  },
})
