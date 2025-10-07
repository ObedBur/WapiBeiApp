import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { postJson } from '../utils/api';

function AdminBlogEditor() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [body, setBody] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!currentUser || !currentUser.token) {
      // not logged in
      navigate('/connexion');
      return;
    }
    // check role
    const role = currentUser.role || (currentUser.user && currentUser.user.role);
    if (!role || (role !== 'admin' && role !== 'vendeur')) {
      setError('Accès refusé: vous n\'êtes pas autorisé à créer des articles.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !slug) return setError('Titre et slug requis');
    setLoading(true);
    try {
      const data = await postJson('/api/blogs', { title, slug, excerpt, body, coverImage, author: currentUser.user ? currentUser.user.nom || currentUser.user.name : currentUser.email, published_at: new Date().toISOString() });
      // navigate to blog detail
      navigate(`/blog/${data.slug || data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (error) return (<div className="container mx-auto px-4 py-8 text-red-500">{error}</div>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Créer un article</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug (url)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Résumé</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contenu (HTML ou markdown)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL image de couverture</label>
          <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-md">{loading ? 'Création...' : 'Créer'}</button>
          <button type="button" onClick={() => navigate('/')} className="px-4 py-2 rounded-md border">Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default AdminBlogEditor; 