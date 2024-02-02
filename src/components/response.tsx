export default ({assistantMessage, assistantImageSrc = 'https://randomuser.me/api/portraits/women/44.jpg'}: {assistantMessage : JSX.Element, assistantImageSrc? : string}) =>

    <div  class="flex items-end overflow-auto gap-1">
        <div class="avatar placeholder">
            <div class="text-neutral-content rounded-full w-8">
            <img src={assistantImageSrc} alt="Bot" class="rounded-full w-10 h-10" />
            </div>
        </div> 

        <div class="chat chat-start" >
            <div class="chat-bubble chat-bubble-info">{assistantMessage}</div>
        </div>
    </div>