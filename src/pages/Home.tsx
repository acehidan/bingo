import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, Trophy, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary-500" />,
      title: 'Multiplayer Experience',
      description: 'Play bingo together with friends and family in real-time no matter where they are.',
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-primary-500" />,
      title: 'Automated Number Calling',
      description: 'Let the system handle number calling while you focus on the game and having fun.',
    },
    {
      icon: <Trophy className="h-6 w-6 text-primary-500" />,
      title: 'Win Recognition',
      description: 'Automatic pattern detection for winning combinations. No more manual verification needed!',
    },
  ];

  useEffect(() => {
    if (user) {
      // If user is already logged in, redirect to lobby
      navigate('/lobby');
    }
  }, [user, navigate]);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900">
          <span className="block">Play Bingo Together</span>
          <span className="block text-primary-600">Anytime, Anywhere</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Join the fun with our multiplayer bingo game. Create rooms, invite friends, and experience the thrill of bingo online!
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/register"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="ml-3 px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
          >
            Login
          </Link>
        </div>
      </motion.section>

      <section className="py-12 bg-primary-50 rounded-lg my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for online bingo
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Our platform makes it easy to host and play bingo games with anyone, anywhere.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white overflow-hidden my-12 rounded-lg shadow-lg">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-12 lg:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Ready to play Bingo?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Sign up now and start playing with friends and family right away.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Start Playing Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;