import React, { useLayoutEffect, useRef, memo, useCallback } from 'react';

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

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Calculate required height with safety margin for fonts/descenders
    el.style.height = 'auto';
    const computedLineHeight = 24;
    const minH = minRows * computedLineHeight + 12;
    const scrollH = el.scrollHeight;
    const finalH = Math.max(scrollH + 4, minH);
    el.style.height = `${finalH}px`;
  }, [minRows]);

  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      rows={minRows}
      className={`resize-none overflow-hidden block box-border leading-relaxed ${className}`}
      {...props}
    />
  );
});

export default AutoExpandingTextarea;
