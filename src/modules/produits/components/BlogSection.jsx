import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BlogSection({
  posts,
  onOpenPost,
  isModalOpen,
  modalPost,
  isModalLoading,
  modalError,
  BlogModalComponent,
  onSubscribe,
  onExplore,
  onFollow,
  onSubscribeNewsletter,
}) {
  const navigate = useNavigate();
  // Remove duplicate posts by id
  const uniquePosts = Array.isArray(posts)
    ? posts.filter(
        (post, idx, arr) =>
          post &&
          post.id &&
          arr.findIndex((p) => p && p.id === post.id) === idx
      )
    : [];
  const hasPosts = uniquePosts.length > 0;

  return (
    <section className="py-20 bg-white bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-0 pointer-events-none">
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              fill="none"
              className="opacity-05 animate-pulse"
            >
              <ellipse cx="50" cy="15" rx="45" ry="15" fill="#a5b4fc" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50 text-blue-700 px-6 py-2 rounded-full text-base font-bold mb-4 shadow-md border border-blue-200 relative z-10">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
              />
            </svg>
            <span>Blog & Conseils</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6 tracking-tight drop-shadow-sm">
            Conseils et actualités
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto mb-2">
            Découvrez nos articles pour optimiser vos achats et découvrir les tendances alimentaires
          </p>
        </div>
        {!hasPosts ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] py-20">
            <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl p-10 shadow-xl border border-blue-100 max-w-50 w-full text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-14 h-14 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                Aucun article à afficher pour le moment
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Notre équipe prépare du contenu exclusif : conseils nutritionnels, recettes saisonnières et astuces pour des achats malins. Restez connecté pour découvrir nos prochains articles !
              </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={() => {
                    if (typeof onSubscribeNewsletter === 'function') return onSubscribeNewsletter();
                    try { window.dispatchEvent(new Event('open-newsletter')); } catch(e){}
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  S'abonner à la newsletter
                </button>
                <button
                  onClick={() => {
                    if (typeof onFollow === 'function') return onFollow();
                    try { navigate('/socials'); } catch(e) { window.open('https://facebook.com', '_blank'); }
                  }}
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                >
                  Suivre nos réseaux
                </button>
              </div>
              <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">En attendant, découvrez :</h4>
                <ul className="text-gray-600 space-y-2">
                  <li className="llex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Nos conseils nutritionnels
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Recettes saisonnières
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Astuces pour des achats malins
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {uniquePosts.map((post) => (
              <BlogCard
                key={post.id}
                post={{ ...post, onOpen: (p) => onOpenPost(p) }}
              />
            ))}
            <BlogModalComponent
              isOpen={isModalOpen}
              post={modalPost}
              isLoading={isModalLoading}
              error={modalError}
              onClose={() => {
                if (typeof onOpenPost === 'function') onOpenPost(null);
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
