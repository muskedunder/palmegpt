import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn'

function Footer() {
    return (
      <footer>
          <div class="mx-auto w-full container p-4 sm:p-6">
            <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <div class="sm:flex sm:items-center sm:justify-between">
                <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">Built by Colin Nordin</span>
                <div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
                    <a href="https://github.com/muskedunder/palmemordschatten" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <GitHubIcon/>
                        <span class="sr-only">GitHub page</span>
                    </a>
                    <a href="https://www.linkedin.com/in/colinordin/" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <LinkedInIcon/>
                        <span class="sr-only">LinkedIn account</span>
                    </a>
                </div>
            </div>
          </div>
      </footer>
    )
  }
  
  export default Footer
  