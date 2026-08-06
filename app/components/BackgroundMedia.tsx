export function BackgroundMedia({
  src,
  video = false,
  opacity = 0.9,
  overlay = 0.65,
  scale = 1,
}: {
  src: string;
  video?: boolean;
  opacity?: number;
  overlay?: number;
  scale?: number;
}) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-black">
      {video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ opacity, transform: `scale(${scale})` }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity, transform: `scale(${scale})` }}
        />
      )}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlay }}
      />
    </div>
  );
}