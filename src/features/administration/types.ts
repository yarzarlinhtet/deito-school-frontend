export interface UserFilterValues {
  search: string
  status: string
  roleId: string
}

export const EMPTY_USER_FILTERS: UserFilterValues = {
  search: '',
  status: 'all',
  roleId: 'all',
}
