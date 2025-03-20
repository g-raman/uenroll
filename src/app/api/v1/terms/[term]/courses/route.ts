export const dynamic = 'force-static'

import supabase from '@/supabase/supabase'

type Params = Promise<{ term: string }>
export async function GET(req: Request, segmentData: { params: Params }) {
  const params = await segmentData.params

  if (!params.term) {
    return Response.json({
      error: 'Specify the term before searching all courses',
      data: null,
    })
  }

  const res = await supabase
    .from('courses')
    .select('course_code,course_title')
    .eq('term', params.term)
    .limit(3500)

  if (!res.data) {
    return Response.json({ error: 'No available courses', data: null })
  }

  return Response.json({ error: null, data: res.data })
}
