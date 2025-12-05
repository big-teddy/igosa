'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
    schema: z.ZodSchema<T>;
    onSubmit: (data: T) => Promise<void> | void;
    defaultValues?: Partial<T>;
}

interface FormState<T> {
    values: Partial<T>;
    errors: Record<string, string>;
    isSubmitting: boolean;
    isValid: boolean;
}

/**
 * 폼 상태 관리 훅
 */
export function useForm<T extends Record<string, unknown>>({
    schema,
    onSubmit,
    defaultValues = {},
}: UseFormOptions<T>) {
    const [state, setState] = useState<FormState<T>>({
        values: defaultValues,
        errors: {},
        isSubmitting: false,
        isValid: false,
    });

    const setValue = useCallback((field: keyof T, value: unknown) => {
        setState((prev) => ({
            ...prev,
            values: { ...prev.values, [field]: value },
            errors: { ...prev.errors, [field as string]: '' },
        }));
    }, []);

    const setError = useCallback((field: keyof T, message: string) => {
        setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [field as string]: message },
        }));
    }, []);

    const validate = useCallback((): boolean => {
        const result = schema.safeParse(state.values);

        if (result.success) {
            setState((prev) => ({ ...prev, errors: {}, isValid: true }));
            return true;
        }

        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
            const path = err.path.join('.');
            if (!errors[path]) {
                errors[path] = err.message;
            }
        });

        setState((prev) => ({ ...prev, errors, isValid: false }));
        return false;
    }, [schema, state.values]);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!validate()) return;

        setState((prev) => ({ ...prev, isSubmitting: true }));

        try {
            await onSubmit(state.values as T);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setState((prev) => ({ ...prev, isSubmitting: false }));
        }
    }, [validate, onSubmit, state.values]);

    const reset = useCallback(() => {
        setState({
            values: defaultValues,
            errors: {},
            isSubmitting: false,
            isValid: false,
        });
    }, [defaultValues]);

    const register = useCallback((field: keyof T) => ({
        value: state.values[field] ?? '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = e.target.type === 'number'
                ? parseFloat(e.target.value) || 0
                : e.target.value;
            setValue(field, value);
        },
        onBlur: () => validate(),
    }), [state.values, setValue, validate]);

    return {
        values: state.values,
        errors: state.errors,
        isSubmitting: state.isSubmitting,
        isValid: state.isValid,
        setValue,
        setError,
        validate,
        handleSubmit,
        reset,
        register,
    };
}
