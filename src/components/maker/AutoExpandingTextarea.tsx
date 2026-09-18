import React, { useLayoutEffect, useRef, memo } from 'react';

export interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minRows?: number;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const AutoExpandingTextarea = memo(function AutoExpandingTextarea({
  value,
  minRows = 1,
  className = '',
  onChange,
  placeholder,
  ...props
}: AutoExpandingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Fast sizing with minimal forced reflow
    el.style.height = 'auto';
    const targetHeight = Math.max(el.scrollHeight, minRows * 24);
    el.style.height = `${targetHeight}px`;
  }, [value, minRows]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={`overflow-hidden resize-none [field-sizing:content] ${className}`}
      {...props}
    />
  );
});

export default AutoExpandingTextarea;
