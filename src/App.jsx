import { useEffect, useState } from 'react';
import TimeForm from './components/timeForm';

const images = ['/c2.jpg', '/c4.jpg', '/c5.jpg', '/c6.jpg'];

function App() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('${images[currentImage]}')`,
          filter: 'blur(8px)',
          transition: 'background-image 2s ease-in-out',
        }}
      ></div>
      <div className="relative z-10">
        <TimeForm />
      </div>
    </main>
  );
}

export default App;
