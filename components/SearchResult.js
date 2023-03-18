
function SearchResult({ session, answer, loading }) {
  return (
    <>
      {!session && answer.length > 0 ? (
        <div>
          <p className="leading-normal text-slate-700 sm:leading-7">Du behöver logga in för att kunna ställa frågor</p>
        </div>
      ) : (
        <>
          {loading && (
            <div className="mt-3">
              <>
                <div className="animate-pulse mt-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              </>
            </div>
          )}
          {!loading && answer.length > 0 && (
            <>
              <div className="rounded-md border-neutral-300 border p-5 mt-4">
                <h2 className="text-xl font-bold leading-[1.1] tracking-tighter text-center">Svar</h2>
                <p className="leading-normal text-slate-700 sm:leading-7 mt-3">{answer}</p>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

export default SearchResult
