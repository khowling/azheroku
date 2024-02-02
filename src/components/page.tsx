import { html } from '@elysiajs/html'


const Header = ({title}: {title : string}) => 
    <header class="z-1 relative bg-base-100 navbar pt-3">
                        
        <div class="flex-1">
            <a class="btn btn-ghost text-xl" hx-get="/reset">{title}</a>
        </div>

        <div class="flex-none gap-8 mr-5">

            <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <div class="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span class="badge badge-sm indicator-item">2</span>
                </div>
            </div>
            <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow">
                <div class="card-body">
                <span class="font-bold text-lg">Items</span>
                <span class="text-info">Subtotal: £</span>
                <div class="card-actions">

                
                </div>
                </div>
            </div>
            </div>

            <label class="swap swap-rotate">
            <input type="checkbox" class="theme-controller" value="dark" />
            <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
            <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
            </label>

            <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                <img alt="Tailwind CSS Navbar component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                </div>
            </div>


            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                <a class="justify-between">
                    Profile
                    <span class="badge">New</span>
                </a>
                </li>
                <li><a>Settings</a></li>
                <li><a>Logout</a></li>
            </ul>
            </div>
        </div>
    </header>


export const HTMLPage = ({children}: {children?: any}) =>
    <html data-theme="winter">
    <head>
        <title>UI Store</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="stylesheets/style.css" rel="stylesheet" type="text/css" />
        <link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.20/dist/full.min.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@1.9.9" integrity="sha384-QFjmbokDn2DjBjq+fM+8LUIVrAgqcNW2s0PjAxHETgRn9l4fvX31ZxDxvwQnyMOX" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/sse.js"></script>
    </head>
    <body>
            {children}
    </body>
    </html>


export default ({children, title}: {children?: any, title : string }) => 
    <HTMLPage>
        <div class="absolute h-full w-full flex z-0">
            <div id="chatContainer" class="flex  relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  >
                <div id="scroller" class="pt-28 -z-1 sm:px-16" hx-trigger="load" hx-get="/explore" hx-swap="beforebegin show:bottom" hx-target="#messages">
                {children}

                <div class="h-24" id="messages"></div>
                </div>
            </div>

            <div id="cib-action-bar" class="absolute bottom-0 flex w-full  bg-base-100 transition-opacity mr-10">
        
                <div class="sm:px-16 px-4 mb-6 mt-4 w-full">
        
                    <form class="w-full" autocomplete="off" {...{ 'hx-on::after-request': 'this.reset()' }} hx-post="/api/input" hx-target="#messages" hx-swap="beforebegin show:bottom">   

                        <div class="relative  w-full">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input  id="question" name="question" type="text" class="block w-full p-4 ps-10 leading-5 rounded-full border input-bordered focus:outline-none  focus:border-primary focus:border-2 font-semibold" placeholder="For help, type /help" />
                            <button type="button" class="absolute end-5 bottom-2.5 btn btn-primary !bg-blue-600 min-h-fit h-auto p-2" hx-trigger="click" hx-get="/help" hx-target="#messages" hx-swap="beforebegin show:bottom">/help</button>
                        

                            <div id="cmd-dropdown" class="invisible transition transition-opacity duration-300 absolute left-8 bottom-16 z-10 mt-2 w-4/5 p-2 origin-bottom-left rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                                <div class="py-1" role="none">

                                </div>
                            </div>

                        </div>
                    </form>

                </div>
            </div>
            
        </div>
        <Header title={title}/>
    </HTMLPage>
