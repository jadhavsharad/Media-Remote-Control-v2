import { useState, useEffect } from 'react';

export const useStorageItem = <T>(item: {
  getValue: () => Promise<T>;
  setValue: (value: T) => Promise<void>;
  watch: (callback: (value: T) => void) => () => void;
}) => {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    item.getValue().then(setValue);
    return item.watch((newVal: any) => setValue(newVal));
  }, []);

  return [value, item.setValue] as const;
  
};
