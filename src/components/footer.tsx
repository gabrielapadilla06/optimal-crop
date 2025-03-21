import Link from 'next/link'

export function SiteFooter() {
   return (
      <footer>
         <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
            <div className="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
               <div className="mb-12 flex flex-col gap-4">
                  <Link href="/" className="flex items-center gap-2">
                     <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                        Crop AI
                     </span>
                  </Link>
                  <p className="max-w-xs">Smart crop planning and care with AI</p>
               </div>
               
            </div>
         </div>
      </footer>
   )
}
