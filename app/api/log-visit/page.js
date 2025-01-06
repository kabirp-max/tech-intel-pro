import { supabase } from '../../supabase';

export async function POST(req) {
  const { articleId } = await req.json();
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Avoid duplicates by checking for existing record
  const { data: existingVisit } = await supabase
    .from('ArticleVisits')
    .select('*')
    .eq('article_id', articleId)
    .eq('ip_address', ipAddress)
    .single();

  if (!existingVisit) {
    const { error } = await supabase.from('ArticleVisits').insert([
      { article_id: articleId, ip_address: ipAddress },
    ]);

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to log visit' }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
