import { Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface CheckoutStepperProps {
  currentStep: number;
  steps: Step[];
}

export function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-gray-200" />

        {/* Progress Bar Fill */}
        <div
          className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-primary transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div
              key={step.title}
              className="flex flex-col items-center gap-2 bg-white px-2"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-primary bg-primary text-white'
                    : isCurrent
                      ? 'border-primary bg-white text-primary'
                      : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="size-6" />
                ) : (
                  <span className="font-bold">{stepNumber}</span>
                )}
              </div>
              <div className="hidden text-center md:block">
                <p
                  className={`text-sm font-bold ${
                    isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
