import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

// Country configuration (codes used in parcels table)
const COUNTRY_CONFIG = {
  US: { currency: 'USD', valueThreshold: 2500, htsLength: 10 },
  CA: { currency: 'CAD', valueThreshold: 3300, htsLength: 10 },
  DE: { currency: 'EUR', valueThreshold: 1000, htsLength: 10 },
  AE: { currency: 'AED', valueThreshold: 10000, htsLength: 8 }
};

// Map country codes to full names (for compliance-check)
const COUNTRY_MAP = {
  US: 'United States',
  CA: 'Canada',
  DE: 'Germany',
  AE: 'United Arab Emirates'
};

// Expanded options for item types
const ITEM_TYPE_OPTIONS = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'Lithium Batteries', label: 'Lithium Batteries' },
  { value: 'Perfume', label: 'Perfume' },
  { value: 'Chemicals', label: 'Chemicals' },
  { value: 'Food', label: 'Food' },
  { value: 'Alcohol', label: 'Alcohol' },
  { value: 'Perishables', label: 'Perishables' },
  { value: 'Dangerous Goods', label: 'Dangerous Goods' },
  { value: 'Fragile Items', label: 'Fragile Items' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Heavy Machinery', label: 'Heavy Machinery' },
  { value: 'Others', label: 'Others' }
];

// Options for new fields
const PURPOSE_OPTIONS = [
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Personal Effects', label: 'Personal Effects' },
  { value: 'Sample', label: 'Sample' }
];

const SHIPPING_TERMS_OPTIONS = [
  { value: 'DAP', label: 'DAP' },
  { value: 'DDP', label: 'DDP' },
  { value: 'EXW', label: 'EXW' },
  { value: 'FOB', label: 'FOB' },
  { value: 'Duties Paid by Sender', label: 'Duties Paid by Sender' },
  { value: 'Duties Paid by Receiver', label: 'Duties Paid by Receiver' }
];

const ORIGIN_COUNTRY_OPTIONS = Object.entries(COUNTRY_MAP).map(([code, fullName]) => ({
  value: code,
  label: fullName
}));

function ComplianceForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    sender: '',
    recipient: '',
    productDescription: '',
    itemType: '',
    quantity: '',
    weight: '',
    unit: 'kg',
    destination: '',
    declaredValue: '',
    currency: 'USD',
    htsCode: '',
    eccn: '',
    countrySpecificNotes: '',
    purposeOfShipment: '',
    shippingTerms: '',
    originCountry: ''
  });

  const [errors, setErrors] = useState({
    sender: '',
    recipient: '',
    productDescription: '',
    itemType: '',
    quantity: '',
    weight: '',
    destination: '',
    declaredValue: '',
    htsCode: '',
    restrictions: [],
    complianceNotes: [],
    purposeOfShipment: '',
    shippingTerms: '',
    originCountry: ''
  });

  const [countryRules, setCountryRules] = useState(null);
  const [touched, setTouched] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // New state: only true after compliance check has been performed
  const [complianceVerified, setComplianceVerified] = useState(false);

  // Real-time validation for individual fields
  const validateField = (name, value) => {
    const rules = {
      sender: val => !!val.trim() ? '' : 'Sender is required',
      recipient: val => !!val.trim() ? '' : 'Recipient is required',
      productDescription: val => !!val.trim() ? '' : 'Product description is required',
      itemType: val => !!val.trim() ? '' : 'Item type is required',
      quantity: val => Number(val) > 0 ? '' : 'Quantity must be positive',
      weight: val => Number(val) > 0 ? '' : 'Weight must be positive',
      destination: val => !!val.trim() ? '' : 'Destination is required',
      declaredValue: val => Number(val) > 0 ? '' : 'Value must be positive',
      htsCode: val => {
        if (!formData.destination) return '';
        const expectedLength = COUNTRY_CONFIG[formData.destination]?.htsLength || 10;
        return new RegExp(`^\\d{${expectedLength}}$`).test(val)
          ? ''
          : `Invalid HTS code (${expectedLength} digits required)`;
      },
      purposeOfShipment: val => !!val.trim() ? '' : 'Purpose of Shipment is required',
      shippingTerms: val => !!val.trim() ? '' : 'Shipping Terms are required'
    };

    return rules[name] ? rules[name](value) : '';
  };

  // Function to manually trigger compliance check
  const runComplianceCheck = () => {
    if (!formData.destination || !formData.itemType || !formData.declaredValue) {
      setSubmissionError('Please fill in destination, item type, and declared value to check compliance');
      return;
    }

    // Cancel any pending debounced checks
    checkCountryRules.cancel();
    
    // Run the check immediately
    performComplianceCheck();
  };

  // Separated the actual API call for reuse
  const performComplianceCheck = async () => {
    setIsChecking(true);
    setSubmissionError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.destination,
          itemType: formData.itemType,
          declaredValue: formData.declaredValue,
          htsCode: formData.htsCode,             
          un_number: formData.un_number || ""    
        })
      });
      
      if (!response.ok) {
        throw new Error('Compliance check failed');
      }

      const { restrictions, requirements } = await response.json();

      setErrors(prev => ({
        ...prev,
        restrictions,
        complianceNotes: requirements
      }));
      setCountryRules(requirements);
      setComplianceVerified(true);
    } catch (error) {
      console.error('Compliance check failed:', error);
      setSubmissionError('Failed to verify compliance. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  // Check country-specific compliance rules (debounced)
  const checkCountryRules = debounce(() => {
    if (!formData.destination || !formData.itemType || !formData.declaredValue) return;
    performComplianceCheck();
  }, 500);

  // Handle field changes
  const handleChange = (name, value) => {
    console.log(`Field ${name} updated to:`, value);
    setTouched(prev => ({ ...prev, [name]: true }));
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
    
    // If any field that affects compliance is updated, reset the verification flag.
    if (['destination', 'itemType', 'declaredValue', 'htsCode'].includes(name)) {
      setComplianceVerified(false);
    }
  };

  // Update currency when destination changes
  useEffect(() => {
    if (formData.destination && COUNTRY_CONFIG[formData.destination]) {
      setFormData(prev => ({
        ...prev,
        currency: COUNTRY_CONFIG[formData.destination].currency
      }));
    }
  }, [formData.destination]);

  const isFormValid = () => {
    // Check all standard validations first
    const standardErrors = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key !== 'eccn' && key !== 'countrySpecificNotes' && key !== 'un_number') {
        const error = validateField(key, value);
        acc[key] = error;
      }
      return acc;
    }, {});
    
    // Return false if any standard errors exist
    if (Object.values(standardErrors).some(error => error !== '')) {
      return false;
    }
    
    // All validation passed
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if form is valid
    if (!isFormValid()) {
      setSubmissionError('Please correct all errors before submitting');
      return;
    }
    
    // Check if compliance was verified
    if (!complianceVerified) {
      setSubmissionError('Please verify compliance before submitting');
      return;
    }
    
    setSubmitting(true);
    setSubmissionError(null);
    
    try {
      const status = errors.restrictions.length > 0 ? 'Rejected' : 'Compliant';
      const complianceNotes = errors.restrictions.concat(errors.complianceNotes).join(' | ');

      // Build payload including new fields
      const payload = {
        sender: formData.sender,
        recipient_address: formData.recipient,
        item_type: formData.itemType,
        weight: parseFloat(formData.weight),
        destination: formData.destination,
        declared_value: parseFloat(formData.declaredValue),
        hts_code: formData.htsCode,
        status,
        compliance_notes: complianceNotes,
        purpose_of_shipment: formData.purposeOfShipment,
        shipping_terms: formData.shippingTerms,
        origin_country: formData.originCountry
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('http://localhost:3000/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        try {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || 'Failed to submit shipment.');
        } catch (error) {
          console.error('Backend error:', error);
          throw new Error(error.message || 'Failed to submit shipment.');
        }
      }
      
      const result = await response.json();
      console.log('Shipment submitted:', result);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
      
      // Reset form fields
      setFormData({
        sender: '',
        recipient: '',
        productDescription: '',
        itemType: '',
        quantity: '',
        weight: '',
        unit: 'kg',
        destination: '',
        declaredValue: '',
        currency: 'USD',
        htsCode: '',
        eccn: '',
        countrySpecificNotes: '',
        purposeOfShipment: '',
        shippingTerms: '',
        originCountry: ''
      });
      setTouched({});
      setErrors({
        sender: '',
        recipient: '',
        productDescription: '',
        itemType: '',
        quantity: '',
        weight: '',
        destination: '',
        declaredValue: '',
        htsCode: '',
        restrictions: [],
        complianceNotes: [],
        purposeOfShipment: '',
        shippingTerms: '',
        originCountry: ''
      });
      setCountryRules(null);
      setComplianceVerified(false);
    } catch (error) {
      console.error(error);
      setSubmissionError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Export Compliance Verification</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender/Receiver Section */}
        <section className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Parties Information</h2>
          <InputField label="Sender Name" name="sender" value={formData.sender} onChange={handleChange} error={errors.sender} touched={touched.sender} required />
          <InputField label="Recipient Address" name="recipient" value={formData.recipient} onChange={handleChange} error={errors.recipient} touched={touched.recipient} textarea required />
        </section>
        {/* Product Details Section */}
        <section className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Product Details</h2>
          <InputField label="Product Description" name="productDescription" value={formData.productDescription} onChange={handleChange} error={errors.productDescription} touched={touched.productDescription} textarea required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Item Type" name="itemType" value={formData.itemType} options={ITEM_TYPE_OPTIONS} onChange={handleChange} error={errors.itemType} touched={touched.itemType} required />
            <InputField label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} error={errors.quantity} touched={touched.quantity} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Weight" name="weight" type="number" value={formData.weight} onChange={handleChange} error={errors.weight} touched={touched.weight} required suffix={
              <select name="unit" value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)} className="ml-2 p-2 border rounded">
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            } />
            <SelectField label="Destination Country" name="destination" value={formData.destination} options={Object.entries(COUNTRY_CONFIG).map(([code]) => ({
              value: code,
              label: code === 'US' ? 'United States' : code === 'CA' ? 'Canada' : code === 'DE' ? 'Germany' : 'United Arab Emirates'
            }))} onChange={handleChange} error={errors.destination} touched={touched.destination} required />
          </div>
        </section>
        {/* Commercial Information Section */}
        <section className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Commercial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Declared Value" name="declaredValue" type="number" value={formData.declaredValue} onChange={handleChange} error={errors.declaredValue} touched={touched.declaredValue} required prefix={<span className="mr-2">{formData.currency}</span>} />
            <InputField label="HTS Code" name="htsCode" value={formData.htsCode} onChange={handleChange} error={errors.htsCode} touched={touched.htsCode} required placeholder={`Enter ${COUNTRY_CONFIG[formData.destination]?.htsLength || 10}-digit code`} />
          </div>
          <InputField label="ECCN (Export Control Classification Number)" name="eccn" value={formData.eccn} onChange={handleChange} placeholder="Enter ECCN if applicable" />
        </section>
        {/* Additional Shipment Information Section */}
        <section className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Additional Shipment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Purpose of Shipment" name="purposeOfShipment" value={formData.purposeOfShipment} options={PURPOSE_OPTIONS} onChange={handleChange} error={errors.purposeOfShipment} touched={touched.purposeOfShipment} required />
            <SelectField label="Shipping Terms" name="shippingTerms" value={formData.shippingTerms} options={SHIPPING_TERMS_OPTIONS} onChange={handleChange} error={errors.shippingTerms} touched={touched.shippingTerms} required />
          </div>
          <SelectField label="Origin Country" name="originCountry" value={formData.originCountry} options={ORIGIN_COUNTRY_OPTIONS} onChange={handleChange} error={errors.originCountry} touched={touched.originCountry} required />
        </section>
        
        {/* Verify Compliance Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={runComplianceCheck}
            disabled={isChecking || !formData.destination || !formData.itemType || !formData.declaredValue}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              (!isChecking && formData.destination && formData.itemType && formData.declaredValue)
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isChecking ? 'Checking Compliance...' : 'Verify Compliance'}
          </button>
        </div>
        
        {/* Compliance Feedback Section */}
        <section className="space-y-4">
          {isChecking && (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
              Checking international compliance regulations...
            </div>
          )}
          {errors.restrictions.length > 0 && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              <h3 className="font-semibold mb-2">Compliance Restrictions:</h3>
              <ul className="list-disc pl-6">
                {errors.restrictions.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {countryRules && countryRules.length > 0 && (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
              <h3 className="font-semibold mb-2">Country Requirements:</h3>
              <ul className="list-disc pl-6">
                {countryRules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
          {complianceVerified && errors.restrictions.length === 0 && (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg">
              ✓ Shipment complies with all regulations
            </div>
          )}
          {submissionError && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg">
              {submissionError}
            </div>
          )}
        </section>
        <button
          type="submit"
          disabled={!isFormValid() || isChecking || submitting || !complianceVerified}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            (isFormValid() && complianceVerified && !isChecking && !submitting)
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Shipment'}
        </button>
      </form>
    </div>
  );
}

// Reusable Input Component
const InputField = ({ label, name, value, onChange, error, touched, type = 'text', textarea = false, prefix, suffix, required = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center gap-2">
      {prefix && <span>{prefix}</span>}
      {textarea ? (
        <textarea name={name} value={value} onChange={(e) => onChange(name, e.target.value)} className={`w-full p-2 border rounded-md focus:ring-2 ${error && touched ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`} rows="3" {...props} />
      ) : (
        <input type={type} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} className={`w-full p-2 border rounded-md focus:ring-2 ${error && touched ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`} {...props} />
      )}
      {suffix && <span>{suffix}</span>}
    </div>
    {error && touched && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Reusable Select Component
const SelectField = ({ label, name, value, options, onChange, error, touched, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <select name={name} value={value} onChange={(e) => onChange(name, e.target.value)} className={`w-full p-2 border rounded-md focus:ring-2 ${error && touched ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}>
      <option value="">Select {label}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>{option.label || option}</option>
      ))}
    </select>
    {error && touched && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default ComplianceForm;