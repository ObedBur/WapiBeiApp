import React from 'react';

export default function Socials() {
  const socials = [
    { name: 'Facebook', url: 'https://facebook.com', color: 'bg-blue-600' },
    { name: 'Instagram', url: 'https://instagram.com', color: 'bg-pink-500' },
    { name: 'TikTok', url: 'https://www.tiktok.com', color: 'bg-black' },
    { name: 'Twitter', url: 'https://twitter.com', color: 'bg-sky-500' },
  ];

  const open = (url) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      // fallback: navigate in same tab
      window.location.href = url;
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Suivez-nous</h1>
        <p className="text-gray-600 mb-6">Retrouvez-nous sur nos différents réseaux sociaux :</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socials.map((s) => (
            <div
              key={s.name}
              role="button"
              tabIndex={0}
              onClick={() => open(s.url)}
              onKeyDown={(e) => { if (e.key === 'Enter') open(s.url); }}
              className={`cursor-pointer rounded-xl p-4 shadow-md flex items-center justify-between ${s.color} text-white hover:opacity-95 transition`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">{s.name[0]}</div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm opacity-90">@WapiBei</div>
                </div>
              </div>
              <div className="text-sm opacity-90">Ouvrir</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


