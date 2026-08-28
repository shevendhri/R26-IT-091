"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the original AiHint without SSR
const AiHint = dynamic(() => import('./AiHint'), { ssr: false });

export default function LazyAiHint(props) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);
  return show ? <AiHint {...props} /> : null;
}
