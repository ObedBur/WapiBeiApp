import React from 'react';
import { useParams, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import { fetchWithAuth } from '../../utils/api';

function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [rawEndpoint, setRawEndpoint] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const endpointBase = import.meta.env.VITE_BLOG_API || '/api/blogs';

    const fetchBySlug = async () => {
      try {
        const possibleBases = [import.meta.env.VITE_BLOG_API, '/api/blogs', '/api/products/blogs'].filter(Boolean);
        const token = (authService.getCurrentUser && authService.getCurrentUser()?.token) || null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let data = null;
        let usedBase = null;

        for (const base of possibleBases) {
          try {
            // Try RESTful /:slug
            let resData = null;
            try {
              resData = await fetchWithAuth(`${base}/${slug}`, { headers });
            } catch (e1) {
              try { resData = await fetchWithAuth(`${base}?slug=${encodeURIComponent(slug)}`, { headers }); } catch (e2) {
                try { resData = await fetchWithAuth(`${base}?limit=200`, { headers }); } catch (e3) { resData = null; }
              }
            }
            if (resData) { data = resData; usedBase = base; }
            if (data) break;
          } catch (e) {
            continue;
          }
        }

        let item = null;
        // handle common shapes
        if (Array.isArray(data)) item = data[0] || null;
        else if (data && data.data) {
          if (Array.isArray(data.data)) item = data.data[0] && (data.data[0].attributes || data.data[0]);
          else if (data.data.attributes) item = { id: data.data.id, ...data.data.attributes };
          else item = data.data;
        } else item = data;

        if (mounted) setPost(item);
        if (!item) {
          // If we failed to locate an item after trying bases, remember the last tried base
          setRawEndpoint(`${usedBase || import.meta.env.VITE_BLOG_API || '/api/blogs'}`);
          if (mounted) setError('Le CMS a renvoyé une réponse non-JSON ou l\'endpoint n\'a pas été trouvé. Vérifiez que `VITE_BLOG_API` pointe vers l\'API JSON du CMS.');
        } else {
          if (mounted) setPost(item);
        }
      } catch (err) {
        console.error('Failed to load blog article', err);
        if (mounted) setError(err.message || 'Erreur lors du chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBySlug();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-8">Chargement de l'article...</div>;
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="font-semibold text-red-700">Erreur de chargement de l'article</div>
        <div className="text-sm text-red-600 mt-2">{error}</div>
        {rawEndpoint && (
          <div className="mt-3">
            <a href={rawEndpoint} target="_blank" rel="noreferrer" className="text-emerald-600 underline">Ouvrir l'endpoint CMS ({rawEndpoint})</a>
          </div>
        )}
        <div className="mt-3 text-sm text-gray-600">Astuce: pour Strapi/Headless CMS utilisez l'API publique JSON (ex: <code>/api/posts</code>) et définissez `VITE_BLOG_API` dans `.env`.</div>
      </div>
    </div>
  );
  if (!post) return <div className="container mx-auto px-4 py-8 text-gray-500">Article introuvable</div>;

  const title = post.title || post.name || '';
  const author = post.author || post.authorName || (post.user && (post.user.nom || post.user.name)) || 'Équipe WapiBei';
  const date = post.date || post.published_at || post.created_at || '';
  const image = post.coverImage || post.image || post.thumbnail || '';
  const content = post.body || post.content || post.description || post.html || '';

  const safeContent = typeof content === 'string' ? content.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="text-emerald-600 mb-4 inline-block">← Retour</Link>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="text-sm text-gray-500 mb-6">{author} • {date}</div>
      {image && <img src={image} alt={title} className="w-full h-64 object-cover rounded-lg mb-6" loading="lazy" />}
      {safeContent ? (
        <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: safeContent }} />
      ) : (
        <p className="text-gray-700">{post.excerpt || post.summary || 'Aucun contenu disponible.'}</p>
      )}
    </div>
  );
}

export default BlogDetail; 