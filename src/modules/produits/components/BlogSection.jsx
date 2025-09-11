import React from 'react';

export default function BlogSection({ posts, onOpenPost, isModalOpen, modalPost, isModalLoading, modalError, BlogModalComponent }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>Blog & Conseils</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Conseils et actualités</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Découvrez nos articles pour optimiser vos achats et découvrir les tendances alimentaires</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={{ ...post, onOpen: (p) => onOpenPost(p) }} />
          ))}
          <BlogModalComponent isOpen={isModalOpen} post={modalPost} isLoading={isModalLoading} error={modalError} onClose={() => { if (typeof onOpenPost === 'function') onOpenPost(null); }} />
        </div>
      </div>
    </section>
  );
} 