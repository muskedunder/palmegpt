import { useState } from 'react'
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import SearchBox from '@/components/SearchBox';
import SearchResult from '@/components/SearchResult';
import styles from '@/styles/Home.module.css'


function Search({ session }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResult, setSearchResult] = useState("")
    const [searchResultLoading, setSearchResultLoading] = useState(false)

    const setNewSearchResult = async () => {
        if (searchQuery !== "") {
            try {
                setSearchResultLoading(true)
                const res = await fetch(`/api/search?query_string=${searchQuery}`)
                const data = await res.json()

                if (data) {
                  setSearchResult(data.answer)
                    // setSearchResult(`user id = ${data.user_id}, n_questions_asked = ${data.n_questions_asked}, max_questions = ${data.max_questions} and the query string was ${data.search_query}`)
                }
            } catch (error) {
                alert('Error loading user data!')
                console.log(error)
            } finally {
                setSearchResultLoading(false)
            }
        }
    }

    const handleSearchBoxChange = (event) => {
      setSearchQuery(event.target.value)
      if (searchQuery === "") {
          setSearchResult("")
      }
    }

    const handleSearchKeyUp = async (event) => {
      if (event.key === 'Enter') {
        setNewSearchResult()
      }
    }

    return (
        <Box className={styles.pageContent} sx={{width: 500, maxWidth: '80%'}}>
          <Stack spacing={2}>
            <SearchBox onChange={handleSearchBoxChange} onKeyUp={handleSearchKeyUp}/>
            <SearchResult searchQuery={searchQuery} searchResult={searchResult} loading={searchResultLoading}/>
          </Stack>
        </Box>
    )
}

export default Search
