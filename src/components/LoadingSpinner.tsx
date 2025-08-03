import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;