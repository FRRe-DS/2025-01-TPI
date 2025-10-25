import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../contexts/NavigationContext';
import { ThemeToggle } from './ThemeToggle';

export function GlobalTransition() {
  const { isTransitioning, transitionDirection, endTransition } = useNavigation();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(135deg, #032d70 0%, #02244f 100%)'
          }}
          onAnimationComplete={() => {
            // End transition after the text animation completes
            setTimeout(() => {
              endTransition();
            }, 1000);
          }}
        >
          <motion.div
            className="text-white text-center relative"
            initial={{ 
              x: transitionDirection === 'left' ? '-100%' : '100%', 
              opacity: 0 
            }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            exit={{ 
              x: transitionDirection === 'left' ? '100%' : '-100%', 
              opacity: 0,
              transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2
              }
            }}
          >
            <motion.div
              className="text-7xl font-bold relative"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              Shipper
            </motion.div>
            
            {/* Toggle de tema al lado del logo */}
            <motion.div
              className="absolute -right-16 top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.3, duration: 0.4 }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                transition: { duration: 0.2 }
              }}
            >
              <ThemeToggle 
                size="lg" 
                showLabel={true}
                className="shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
