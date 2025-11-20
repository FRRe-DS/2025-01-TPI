import { useState, forwardRef } from 'react';
import type { FormEvent } from 'react';

/**
 * Formulario de entrega para el checkout
 * Recolecta la dirección de entrega y el método de transporte
 */

export interface DireccionEntrega {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: "AR";
}

export type Transporte = "camion" | "avion" | "barco" | "tren";

export interface DeliveryFormData {
  direccionEntrega: DireccionEntrega;
  transporte: Transporte;
}

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => void;
  isLoading?: boolean;
}

const DeliveryForm = forwardRef<HTMLFormElement, DeliveryFormProps>(
  ({ onSubmit, isLoading = false }, ref) => {
  const [formData, setFormData] = useState<DeliveryFormData>({
    direccionEntrega: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'AR'
    },
    transporte: 'camion'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DireccionEntrega | 'transporte', string>>>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.direccionEntrega.street.trim()) {
      newErrors.street = 'La calle es requerida';
    }

    if (!formData.direccionEntrega.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.direccionEntrega.state.trim()) {
      newErrors.state = 'La provincia es requerida';
    }

    if (!formData.direccionEntrega.postal_code.trim()) {
      newErrors.postal_code = 'El código postal es requerido';
    } else if (!/^\d{4,8}$/.test(formData.direccionEntrega.postal_code)) {
      newErrors.postal_code = 'El código postal debe tener entre 4 y 8 dígitos';
    }

    if (!formData.transporte) {
      newErrors.transporte = 'Debe seleccionar un método de transporte';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateDireccion = (field: keyof DireccionEntrega, value: string) => {
    setFormData(prev => ({
      ...prev,
      direccionEntrega: {
        ...prev.direccionEntrega,
        [field]: value
      }
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Dirección de Entrega</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Calle y Número *
            </label>
            <input
              type="text"
              id="street"
              value={formData.direccionEntrega.street}
              onChange={(e) => updateDireccion('street', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.street
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Av. Corrientes 1234"
              disabled={isLoading}
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-500">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                id="city"
                value={formData.direccionEntrega.city}
                onChange={(e) => updateDireccion('city', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.city
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Buenos Aires"
                disabled={isLoading}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                Provincia *
              </label>
              <input
                type="text"
                id="state"
                value={formData.direccionEntrega.state}
                onChange={(e) => updateDireccion('state', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.state
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="CABA"
                disabled={isLoading}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal *
            </label>
            <input
              type="text"
              id="postal_code"
              value={formData.direccionEntrega.postal_code}
              onChange={(e) => updateDireccion('postal_code', e.target.value.replace(/\D/g, ''))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.postal_code
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="1234"
              maxLength={8}
              disabled={isLoading}
            />
            {errors.postal_code && (
              <p className="mt-1 text-sm text-red-500">{errors.postal_code}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              id="country"
              value={formData.direccionEntrega.country}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500">Solo disponible para Argentina</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Método de Transporte</h2>
        
        <div className="space-y-3">
          {(['camion', 'avion', 'barco', 'tren'] as Transporte[]).map((transporte) => (
            <label
              key={transporte}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.transporte === transporte
                  ? 'border-blue-900 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="transporte"
                value={transporte}
                checked={formData.transporte === transporte}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, transporte: e.target.value as Transporte }));
                  if (errors.transporte) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.transporte;
                      return newErrors;
                    });
                  }
                }}
                className="mr-3 w-4 h-4 text-blue-900 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-lg font-medium text-gray-800 capitalize">
                {transporte === 'camion' && '🚚 Camión'}
                {transporte === 'avion' && '✈️ Avión'}
                {transporte === 'barco' && '🚢 Barco'}
                {transporte === 'tren' && '🚂 Tren'}
              </span>
            </label>
          ))}
          {errors.transporte && (
            <p className="mt-1 text-sm text-red-500">{errors.transporte}</p>
          )}
        </div>
      </div>
    </form>
  );
});

DeliveryForm.displayName = 'DeliveryForm';

export default DeliveryForm;

