// group chats, with bets showing on top b/w people of the chat
export async function Conversation({params}: {params: Promise<{id: string}>}){
    const { id } = await params;
    return(
        <>
        {id}
        </>
    )
}