
export default function ErrorMessage({ errorMessage }) {
    return (
    <div className="rounded-md border-red-600 border p-5 mt-4 mb-6 mx-3 bg-red-300">
        <p className="leading-normal text-slate-700 sm:leading-7 text-center text-red-600">{errorMessage}</p>
    </div>
    )
}
