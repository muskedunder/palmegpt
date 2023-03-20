import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn'

function Footer() {
    return (
      <footer>
          <div className="mx-auto w-full container p-4 sm:p-6">
            <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <div className="sm:flex sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">Built by Colin Nordin</span>
                <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
                    <a href="https://github.com/muskedunder/palmemordschatten" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <GitHubIcon/>
                        <span className="sr-only">GitHub page</span>
                    </a>
                    <a href="https://www.linkedin.com/in/colinordin/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <LinkedInIcon/>
                        <span className="sr-only">LinkedIn account</span>
                    </a>
                </div>
            </div>
          </div>
      </footer>
    )
  }
  
  export default Footer
  