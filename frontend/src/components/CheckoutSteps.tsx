// src/components/CheckoutSteps.tsx
import { useLocation } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface Step {
  id: CheckoutStep;
  label: string;
  path: string;
}

const steps: Step[] = [
  { id: 'cart', label: 'Revisar Carrito', path: '/shopcart' },
  { id: 'shipping', label: 'Forma de Envío', path: '/shopcart/shipping' },
  { id: 'payment', label: 'Pago', path: '/shopcart/payment' },
  { id: 'confirmation', label: 'Confirmación', path: '/shopcart/confirmation' },
];

const stepOrder: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation'];

export function CheckoutSteps() {
  const location = useLocation();
  const { isDark } = useTheme();

  const getCurrentStep = (): CheckoutStep => {
    if (location.pathname.includes('/confirmation')) return 'confirmation';
    if (location.pathname.includes('/payment')) return 'payment';
    if (location.pathname.includes('/shipping')) return 'shipping';
    return 'cart';
  };

  const currentStep = getCurrentStep();
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const isStepCompleted = (stepIndex: number): boolean => {
    return stepIndex < currentStepIndex;
  };

  const isStepActive = (stepIndex: number): boolean => {
    return stepIndex === currentStepIndex;
  };

  const getStepColor = (stepIndex: number): string => {
    if (isStepCompleted(stepIndex)) {
      return isDark ? 'text-blue-400' : 'text-blue-600';
    }
    if (isStepActive(stepIndex)) {
      return isDark ? 'text-blue-400' : 'text-blue-600';
    }
    return isDark ? 'text-gray-500' : 'text-gray-400';
  };

  const getStepBgColor = (stepIndex: number): string => {
    if (isStepCompleted(stepIndex)) {
      return isDark ? 'bg-blue-400' : 'bg-blue-600';
    }
    if (isStepActive(stepIndex)) {
      return isDark ? 'bg-blue-400' : 'bg-blue-600';
    }
    return isDark ? 'bg-gray-600' : 'bg-gray-300';
  };

  const getConnectorColor = (stepIndex: number): string => {
    if (stepIndex < currentStepIndex) {
      return isDark ? 'bg-blue-400' : 'bg-blue-600';
    }
    return isDark ? 'bg-gray-600' : 'bg-gray-300';
  };

  return (
    <div className={`w-full py-6 ${isDark ? 'bg-slate-900' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = isStepCompleted(index);
            const isActive = isStepActive(index);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted || isActive
                          ? getStepBgColor(index)
                          : isDark
                          ? 'bg-gray-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            isActive
                              ? 'text-white'
                              : isDark
                              ? 'text-gray-300'
                              : 'text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${getStepColor(index)}`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-4 h-0.5 relative">
                    <div
                      className={`h-full transition-all duration-300 ${getConnectorColor(index)}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

