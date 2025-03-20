import supabase from '@/supabase/supabase'

export async function GET() {
  const { data, error } = await supabase.from('available_terms').select('term,value')

  if (error) {
    console.log(error.message)
    return Response.json({ error: 'Something went wrong', data: null })
  }

  return Response.json({ error: null, data })
}
