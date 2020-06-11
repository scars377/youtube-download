import { useState } from 'react';

const types = ['audio', 'video'];

export default function useType() {
  const [type, setType] = useState(types[0]);
  return { type, setType, types };
}
