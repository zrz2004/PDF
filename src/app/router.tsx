import type { ToolCategoryId } from '@/features/tools/categories'

export type AppRoute =
  | { name: 'home'; category?: ToolCategoryId }
  | { name: 'tool'; toolId: string; fromCategory?: ToolCategoryId }
  | { name: 'history' }
  | { name: 'settings' }

export const homeRoute: AppRoute = { name: 'home', category: 'popular' }
