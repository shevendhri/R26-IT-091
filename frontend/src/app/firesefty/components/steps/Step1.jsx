'use client';

import { useState } from 'react';

export function Step1({ buildingInfo, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    onChange({
      ...buildingInfo,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!buildingInfo.buildingName?.trim())
      newErrors.buildingName = 'Building name is required';

    if (!buildingInfo.address?.trim())
      newErrors.address = 'Address is required';

    if (!buildingInfo.ownerName?.trim())
      newErrors.ownerName = 'Owner name is required';

    if (!buildingInfo.ownerContact?.trim())
      newErrors.ownerContact = 'Contact number is required';

    if (!buildingInfo.squareFootage?.trim())
      newErrors.squareFootage = 'Square footage is required';

    if (!buildingInfo.numberOfFloors?.trim())
      newErrors.numberOfFloors = 'Number of floors is required';

    if (!buildingInfo.buildingType?.trim())
      newErrors.buildingType = 'Building type is required';

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

  const inputStyle = (hasError) => ({
    width: '100%',
    backgroundColor: '#0d1111',
    border: `1px solid ${hasError ? '#e74c3c' : '#2c3e50'}`,
    color: '#e8eaed',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s ease',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#e8eaed',
    fontSize: '14px',
    fontWeight: '600',
  };

  const errorStyle = {
    marginTop: '6px',
    fontSize: '12px',
    color: '#e74c3c',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Building Name */}
        <div>
          <label style={labelStyle}>
            Building Name *
          </label>

          <input
            type="text"
            name="buildingName"
            value={buildingInfo.buildingName}
            onChange={handleChange}
            placeholder="e.g., Colombo Business Tower"
            style={inputStyle(errors.buildingName)}
          />

          {errors.buildingName && (
            <p style={errorStyle}>
              {errors.buildingName}
            </p>
          )}
        </div>

        {/* Building Type */}
        <div>
          <label style={labelStyle}>
            Building Type *
          </label>

          <select
            name="buildingType"
            value={buildingInfo.buildingType}
            onChange={handleChange}
            style={inputStyle(errors.buildingType)}
          >
            <option value="">
              Select a building type
            </option>

            {buildingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {errors.buildingType && (
            <p style={errorStyle}>
              {errors.buildingType}
            </p>
          )}
        </div>

        {/* Address */}
        <div
          style={{
            gridColumn: '1 / -1',
          }}
        >
          <label style={labelStyle}>
            Address *
          </label>

          <input
            type="text"
            name="address"
            value={buildingInfo.address}
            onChange={handleChange}
            placeholder="e.g., 123 Galle Road, Colombo 3"
            style={inputStyle(errors.address)}
          />

          {errors.address && (
            <p style={errorStyle}>
              {errors.address}
            </p>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <label style={labelStyle}>
            Owner Name *
          </label>

          <input
            type="text"
            name="ownerName"
            value={buildingInfo.ownerName}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            style={inputStyle(errors.ownerName)}
          />

          {errors.ownerName && (
            <p style={errorStyle}>
              {errors.ownerName}
            </p>
          )}
        </div>

        {/* Contact */}
        <div>
          <label style={labelStyle}>
            Contact Number *
          </label>

          <input
            type="tel"
            name="ownerContact"
            value={buildingInfo.ownerContact}
            onChange={handleChange}
            placeholder="e.g., +94 11 234 5678"
            style={inputStyle(errors.ownerContact)}
          />

          {errors.ownerContact && (
            <p style={errorStyle}>
              {errors.ownerContact}
            </p>
          )}
        </div>

        {/* Square Footage */}
        <div>
          <label style={labelStyle}>
            Square Footage *
          </label>

          <input
            type="number"
            name="squareFootage"
            value={buildingInfo.squareFootage}
            onChange={handleChange}
            placeholder="e.g., 50000"
            style={inputStyle(errors.squareFootage)}
          />

          {errors.squareFootage && (
            <p style={errorStyle}>
              {errors.squareFootage}
            </p>
          )}
        </div>

        {/* Floors */}
        <div>
          <label style={labelStyle}>
            Number of Floors *
          </label>

          <input
            type="number"
            name="numberOfFloors"
            value={buildingInfo.numberOfFloors}
            onChange={handleChange}
            placeholder="e.g., 15"
            style={inputStyle(errors.numberOfFloors)}
          />

          {errors.numberOfFloors && (
            <p style={errorStyle}>
              {errors.numberOfFloors}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        style={{
          width: '100%',
          background: 'linear-gradient(90deg, #27ae60, #2ecc71)',
          color: '#0d1111',
          border: 'none',
          borderRadius: '14px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: '0.3s ease',
          boxShadow: '0 8px 20px rgba(39,174,96,0.25)',
        }}
      >
        Continue to Step 2
      </button>
    </form>
  );
}