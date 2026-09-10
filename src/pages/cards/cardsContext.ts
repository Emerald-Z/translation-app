import { useOutletContext } from 'react-router-dom'
import type { Book } from '../../lib/books'
import type { Card } from '../../lib/cards'

export interface CardsContext {
  cards: Card[]
  books: Book[]
  loading: boolean
  togglePin: (card: Card) => Promise<void>
  reload: () => Promise<void>
}

/** Cards and books loaded once by CardsLayout and shared with its child routes. */
export const useCards = () => useOutletContext<CardsContext>()
