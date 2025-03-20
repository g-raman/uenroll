import { useSearchResults } from '@/contexts/SearchResultsContext'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export const DeleteSearchResultsButton = () => {
  const { state, dispatch } = useSearchResults()

  return (
    <button
      onClick={() => dispatch({ type: 'reset_courses' })}
      className="flex h-full w-full cursor-pointer items-center justify-center gap-1 rounded-xs border border-slate-400 px-2 py-3 text-black hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
      disabled={state.courses.length === 0}
    >
      <FontAwesomeIcon className="size-4" icon={faTrash} />
      <p className="text-xs">Delete</p>
    </button>
  )
}
