import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest){
    const supabase = await createClient();

    const userId = request.nextUrl.searchParams.get('user_id');
    //const { data: { user } } = await supabase.auth.getUser();

    /* commenting this out temorarily for testing
    if(!user){
        return NextResponse.json(
            { error: 'Unauthorized'},
            {status: 401}
        ); */

    if(!userId){
        return NextResponse.json(
            { error: 'user_id is required' },
            { status: 400 }
        );
    }
        
    const { data, error } = await supabase
    .rpc('get_collaborators', 
        { current_user_id: userId}
    );

    if(error){
        return NextResponse.json(
            { error: error.message},
            { status: 500 }
        );
    }
    return NextResponse.json(data);
}