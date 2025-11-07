import React, { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const ToastWithProgress = ({ id, title, description, action, duration = 1000, ...props }) => {
  const [progress, setProgress] = useState(100);
  const { dismiss } = useToast();

  useEffect(() => {
    if (!duration) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          // Dismiss toast khi progress bar chạy hết
          setTimeout(() => dismiss(id), 50);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, dismiss, id]);

  // Determine progress bar color based on toast variant/className
  const getProgressColor = () => {
    if (props.className?.includes('border-l-green')) return 'bg-green-500';
    if (props.className?.includes('border-l-blue')) return 'bg-blue-500';
    if (props.className?.includes('border-l-orange')) return 'bg-orange-500';
    if (props.className?.includes('border-l-red')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <Toast {...props} className={`${props.className} relative overflow-hidden`}>
      <div className="grid gap-1 flex-1">
        {title && <ToastTitle className="text-sm font-semibold">{title}</ToastTitle>}
        {description && (
          <ToastDescription className="text-xs text-muted-foreground">{description}</ToastDescription>
        )}
      </div>
      {action}
      <ToastClose className="opacity-70 hover:opacity-100 transition-opacity" />
      
      {/* Progress Bar */}
      {duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Toast>
  );
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, duration, ...props }) {
        return (
          <ToastWithProgress 
            key={id} 
            id={id}
            title={title}
            description={description}
            action={action}
            duration={duration}
            {...props} 
            className={`shadow-lg border-l-4 backdrop-blur-sm ${props.className || ''}`}
          />
        );
      })}
      <ToastViewport 
        className="fixed z-[100] flex flex-col p-4 max-w-sm gap-2"
        style={{
          top: '16px',
          right: '16px',
          bottom: 'auto',
          left: 'auto'
        }}
      />
    </ToastProvider>
  );
}
