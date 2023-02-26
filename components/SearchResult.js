import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';

function SearchResult({ searchQuery, searchResult, loading }) {
    return (
        loading ? <LinearProgress/> :
        <div>
            {searchQuery !== "" && searchResult !== "" && (
                <Paper elevation={6}>
                    {searchResult}
                </Paper>
            )}
        </div>
    )
}

export default SearchResult
