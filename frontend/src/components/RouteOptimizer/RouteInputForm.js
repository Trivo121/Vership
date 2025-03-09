import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const routeOptimizerSchema = z.object({
  originCountry: z.string().min(2, "Country is required"),
  originCity: z.string().min(2, "City is required"),
  originAddressType: z.enum(['Port', 'Airport']),
  destinationCountry: z.string().min(2, "Country is required"),
  destinationCity: z.string().min(2, "City is required"),
  destinationAddressType: z.enum(['Port', 'Airport']),
  weight: z.number().min(0.1, "Weight must be positive"),
  priority: z.enum(['Economy', 'Standard', 'Express'])
});

// Simple mapping function to convert form data to a location code
const getLocationCode = (country, city, addressType) => {
  if (country === 'IN' && city.toLowerCase() === 'mumbai') {
    return addressType === 'Airport' ? 'BOM' : 'INBOM';
  }
  if (country === 'GB' && city.toLowerCase() === 'london') {
    return addressType === 'Airport' ? 'LHR' : 'GBROY';
  }
  if (country === 'SG' && city.toLowerCase() === 'singapore') {
    return addressType === 'Airport' ? 'SIN' : 'SGSIN';
  }
  return '';
};

const RouteInputForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(routeOptimizerSchema),
    mode: 'onChange'
  });

  const submitHandler = (data) => {
    const originCode = getLocationCode(data.originCountry, data.originCity, data.originAddressType);
    const destinationCode = getLocationCode(data.destinationCountry, data.destinationCity, data.destinationAddressType);

    if (!originCode || !destinationCode) {
      alert('Invalid location selection. Please check your inputs.');
      return;
    }

    // Build payload including priority
    const payload = {
      origin: originCode,
      destination: destinationCode,
      weight: data.weight,
      priority: data.priority
    };

    onSubmit(payload);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 flex items-center">
        Route Optimizer
      </h1>
      
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        {/* Origin Section */}
        <section className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Origin Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label>Origin Country (Code: IN)</label>
              <input
                type="text"
                {...register('originCountry')}
                placeholder="IN"
                className="w-full p-2 border rounded"
              />
              {errors.originCountry && <p className="text-red-500">{errors.originCountry.message}</p>}
            </div>
            <div>
              <label>Origin City (e.g., Mumbai)</label>
              <input
                type="text"
                {...register('originCity')}
                placeholder="Mumbai"
                className="w-full p-2 border rounded"
              />
              {errors.originCity && <p className="text-red-500">{errors.originCity.message}</p>}
            </div>
            <div>
              <label>Address Type</label>
              <select 
                {...register('originAddressType')}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Type</option>
                <option value="Airport">Airport</option>
                <option value="Port">Port</option>
              </select>
              {errors.originAddressType && <p className="text-red-500">{errors.originAddressType.message}</p>}
            </div>
          </div>
        </section>

        {/* Destination Section */}
        <section className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Destination Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label>Destination Country (Code: GB or SG)</label>
              <input
                type="text"
                {...register('destinationCountry')}
                placeholder="GB"
                className="w-full p-2 border rounded"
              />
              {errors.destinationCountry && <p className="text-red-500">{errors.destinationCountry.message}</p>}
            </div>
            <div>
              <label>Destination City (e.g., London or Singapore)</label>
              <input
                type="text"
                {...register('destinationCity')}
                placeholder="London"
                className="w-full p-2 border rounded"
              />
              {errors.destinationCity && <p className="text-red-500">{errors.destinationCity.message}</p>}
            </div>
            <div>
              <label>Address Type</label>
              <select 
                {...register('destinationAddressType')}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Type</option>
                <option value="Airport">Airport</option>
                <option value="Port">Port</option>
              </select>
              {errors.destinationAddressType && <p className="text-red-500">{errors.destinationAddressType.message}</p>}
            </div>
          </div>
        </section>

        {/* Package Weight Section */}
        <section className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Package Details</h2>
          <div>
            <label>Weight (kg)</label>
            <input
              type="number"
              {...register('weight', { valueAsNumber: true })}
              placeholder="e.g., 100"
              className="w-full p-2 border rounded"
            />
            {errors.weight && <p className="text-red-500">{errors.weight.message}</p>}
          </div>
        </section>

        {/* Priority Selection Section */}
        <section className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Priority Selection</h2>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" value="Economy" {...register('priority')} className="mr-2" />
              Economy (Lowest Cost)
            </label>
            <label className="flex items-center">
              <input type="radio" value="Standard" {...register('priority')} className="mr-2" />
              Standard (Balanced)
            </label>
            <label className="flex items-center">
              <input type="radio" value="Express" {...register('priority')} className="mr-2" />
              Express (Fastest Time)
            </label>
          </div>
          {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
        </section>

        <button 
          type="submit" 
          disabled={!isValid}
          className={`w-full py-3 rounded-lg ${isValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Calculate Routes
        </button>
      </form>
    </div>
  );
};

export default RouteInputForm;
