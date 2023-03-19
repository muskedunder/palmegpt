import { useEffect, useRef } from 'react';


function SearchBox({ query, setQuery, handleSearch }) {

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus();
  }, [])


  const handleEnter = (e) => {
    if (e.key === 'Enter' && query) {
      handleSearch();
    } else {
      return;
    }
  };


    return (
        <div className="flex w-full max-w-xl items-center space-x-2">
            <input
                ref={inputRef}
                className="flex h-10 w-full ml-5 rounded-md border border-slate-700 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-black dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
                type="search"
                placeholder="Vem mördade Olof Palme?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleEnter}
            />
            <button
                onClick={handleSearch}
                className="active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 h-10 py-2 px-4"
            >
            Sök
            </button>
        </div>
    )
}

export default SearchBox
