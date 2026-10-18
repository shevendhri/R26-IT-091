'use client';

import { useState } from 'react';

export function Step1({ buildingInfo, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...buildingInfo, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!buildingInfo.buildingName?.trim()) newErrors.buildingName = 'Building name is required';
    if (!buildingInfo.address?.trim()) newErrors.address = 'Address is required';
    if (!buildingInfo.ownerName?.trim()) newErrors.ownerName = 'Owner name is required';
    if (!buildingInfo.ownerContact?.trim()) newErrors.ownerContact = 'Contact number is required';
    if (!buildingInfo.squareFootage?.trim()) newErrors.squareFootage = 'Square footage is required';
    if (!buildingInfo.numberOfFloors?.trim()) newErrors.numberOfFloors = 'Number of floors is required';
    if (!buildingInfo.buildingType?.trim()) newErrors.buildingType = 'Building type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const buildingTypes = [
    'Residential',
    'Commercial Office',
    'Retail',
    'Industrial',
    'Hospital',
    'School',
    'Hotel',
    'Mixed-Use',
    'Other',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Building Name *
          </label>
          <input
            type="text"
            name="buildingName"
            value={buildingInfo.buildingName}
            onChange={handleChange}
            placeholder="e.g., Colombo Business Tower"
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.buildingName ? 'border-destructive' : 'border-border'
            }`}
          />
          {errors.buildingName && (
            <p className="mt-1 text-xs text-destructive">{errors.buildingName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Building Type *
          </label>
          <select
            name="buildingType"
            value={buildingInfo.buildingType}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.buildingType ? 'border-destructive' : 'border-border'
            }`}
          >
            <option value="">Select a building type</option>
            {buildingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.buildingType && (
            <p className="mt-1 text-xs text-destructive">{errors.buildingType}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={buildingInfo.address}
            onChange={handleChange}
            placeholder="e.g., 123 Galle Road, Colombo 3"
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.address ? 'border-destructive' : 'border-border'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-destructive">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            name="ownerName"
            value={buildingInfo.ownerName}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.ownerName ? 'border-destructive' : 'border-border'
            }`}
          />
          {errors.ownerName && (
            <p className="mt-1 text-xs text-destructive">{errors.ownerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Contact Number *
          </label>
          <input
            type="tel"
            name="ownerContact"
            value={buildingInfo.ownerContact}
            onChange={handleChange}
            placeholder="e.g., +94 11 234 5678"
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.ownerContact ? 'border-destructive' : 'border-border'
            }`}
          />
          {errors.ownerContact && (
            <p className="mt-1 text-xs text-destructive">{errors.ownerContact}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Square Footage *
          </label>
          <input
            type="number"
            name="squareFootage"
            value={buildingInfo.squareFootage}
            onChange={handleChange}
            placeholder="e.g., 50000"
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.squareFootage ? 'border-destructive' : 'border-border'
            }`}
          />
          {errors.squareFootage && (
            <p className="mt-1 text-xs text-destructive">{errors.squareFootage}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Number of Floors *
          </label>
          <input
            type="number"
            name="numberOfFloors"
            value={buildingInfo.numberOfFloors}
            onChange={handleChange}
            placeholder="e.g., 15"
            className={`w-full rounded-lg border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.numberOfFloors ? 'border-destructive' : 'border-border'
            }`}
          />
          {errors.numberOfFloors && (
            <p className="mt-1 text-xs text-destructive">{errors.numberOfFloors}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Continue to Step 2
      </button>
    </form>
  );
}
