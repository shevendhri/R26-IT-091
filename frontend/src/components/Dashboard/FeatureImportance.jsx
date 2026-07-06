import React from 'react';
import FeatureImportancePanel from '../Recommendation/FeatureImportancePanel';

/**
 * FeatureImportance – Dashboard wrapper for the FeatureImportancePanel.
 * Expects `data` prop (report data) and extracts the `feature_importance` array.
 */
export default function FeatureImportance({ data }) {
  const features = data?.feature_importance || [];
  return <FeatureImportancePanel features={features} />;
}
