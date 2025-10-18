import { z } from 'zod';

/**
 * Validation schemas for user inputs to prevent injection attacks and data corruption
 */

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

// Password validation - strong requirements
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(128, { message: 'Password must be less than 128 characters' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' });

// Name validation
export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z\s'-]+$/, { message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });

// Price threshold validation
export const priceThresholdSchema = z
  .number()
  .positive({ message: 'Price must be positive' })
  .max(10000, { message: 'Price must be less than $10,000' })
  .multipleOf(0.01, { message: 'Price must be a valid currency amount' });

// Destination ID validation
export const uuidSchema = z
  .string()
  .uuid({ message: 'Invalid ID format' });

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .min(1, { message: 'Subject is required' })
    .max(200, { message: 'Subject must be less than 200 characters' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(2000, { message: 'Message must be less than 2000 characters' }),
});

// Signup validation
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

// Add destination validation
export const addDestinationSchema = z.object({
  destinationId: uuidSchema,
  priceThreshold: priceThresholdSchema,
});

// Update threshold validation
export const updateThresholdSchema = z.object({
  id: uuidSchema,
  threshold: priceThresholdSchema,
});

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize URL to prevent open redirect attacks
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '/';
    }
    return url;
  } catch {
    return '/';
  }
}

/**
 * Encode data for safe URL usage
 */
export function encodeForUrl(data: string): string {
  return encodeURIComponent(data);
}
