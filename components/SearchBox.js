import TextField from '@mui/material/TextField';


function SearchBox({ onChange, onKeyUp }) {
    return (
        <TextField
            fullWidth
            id="filled-search"
            label="Ställ din fråga"
            type="search"
            onChange={onChange}
            onKeyUp={onKeyUp}
            // InputProps={{
            //     endAdornment: (
            //       <InputAdornment>
            //         <IconButton onClick={getAnswer}>
            //           <SearchIcon/>
            //         </IconButton>
            //       </InputAdornment>
            //     )
            // }}
        />
    )
}

export default SearchBox
