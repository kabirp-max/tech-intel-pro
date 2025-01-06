import { supabase } from '../../supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const { error } = await supabase
        .from('ArticleVisits')
        .insert({ article_id: articleId, ip_address: ipAddress });

      if (error) {
        console.error('Error logging visit:', error);
        return res.status(500).json({ error: 'Failed to log visit' });
      }

      return res.status(200).json({ message: 'Visit logged successfully' });
    } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
