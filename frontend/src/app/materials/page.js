"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaterialsRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/materials/form');
  }, []);
  return null;
}
