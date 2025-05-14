import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} BingoMultiplayer
          </p>
          <div className="flex items-center mt-2 sm:mt-0">
            <span className="text-gray-600 text-sm flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> using React, Supabase & Socket.io
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;