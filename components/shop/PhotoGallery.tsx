type Photo = { id: string; url: string };

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {photos.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          src={p.url}
          alt=""
          className="w-full aspect-square object-cover rounded"
        />
      ))}
    </div>
  );
}
