export default function AuthenticationSideImage({ image, title, subtitle }) {
  return (
    <div className="hidden md:block w-[40%] flex-shrink-0 self-stretch relative overflow-hidden shadow-2xl">
      <img
        src={image}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="absolute inset-0 flex items-center justify-center px-8 z-10">
        <div className="text-center bg-black/30 backdrop-blur-sm rounded-2xl p-8">
          <h1 
            className="text-5xl font-serif font-bold leading-tight text-white max-w-xl"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-white text-lg mt-4 font-light"
              style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8), 0 0 15px rgba(0,0,0,0.5)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
