import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../contexts/NavigationContext';

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
            className="text-white text-center"
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
              className="text-7xl font-bold"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
