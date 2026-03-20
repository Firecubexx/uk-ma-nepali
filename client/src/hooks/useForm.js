import { useState, useCallback } from 'react';

/**
 * useForm — controlled form state with validation
 *
 * Usage:
 *   const { values, errors, set, validate, reset } = useForm(
 *     { email: '', password: '' },
 *     {
 *       email:    (v) => !v ? 'Required' : !/\S+@\S+/.test(v) ? 'Invalid email' : null,
 *       password: (v) => v.length < 6 ? 'Min 6 characters' : null,
 *     }
 *   );
 */
export function useForm(initialValues = {}, rules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }, [errors]);

  const setAll = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  const touch = useCallback((key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    // Validate on blur
    if (rules[key]) {
      const err = rules[key](values[key]);
      setErrors((prev) => ({ ...prev, [key]: err }));
    }
  }, [rules, values]);

  const validate = useCallback(() => {
    const newErrors = {};
    let valid = true;
    Object.entries(rules).forEach(([key, rule]) => {
      const err = rule(values[key]);
      if (err) { newErrors[key] = err; valid = false; }
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])));
    return valid;
  }, [rules, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, set, setAll, touch, validate, reset };
}

/**
 * Common validation rules
 */
export const rules = {
  required: (label = 'This field') => (v) => (!v || !String(v).trim()) ? `${label} is required` : null,
  email:    () => (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email address' : null,
  minLen:   (n, label = 'Password') => (v) => v && v.length < n ? `${label} must be at least ${n} characters` : null,
  maxLen:   (n, label = 'Field') => (v) => v && v.length > n ? `${label} must be at most ${n} characters` : null,
  match:    (other, label = 'Passwords') => (v) => v !== other ? `${label} do not match` : null,
  number:   (label = 'Value') => (v) => v && isNaN(Number(v)) ? `${label} must be a number` : null,
  positive: (label = 'Value') => (v) => v && Number(v) <= 0 ? `${label} must be positive` : null,
};
