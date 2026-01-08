import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BackendErrorResponse } from '../models/api.models';

/**
 * Handles backend validation errors and applies them to form fields
 * @param error The HTTP error response
 * @param form The form group to apply errors to
 * @returns true if validation errors were found and applied, false otherwise
 */
export function handleFormValidationErrors(
  error: unknown,
  form: FormGroup
): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  // Check if it's a 400 Bad Request with validation errors
  if (error.status !== 400 || !error.error) {
    return false;
  }

  const errorResponse = error.error as BackendErrorResponse;

  // Check if the error response has validation errors
  if (!errorResponse.errors || !Array.isArray(errorResponse.errors)) {
    return false;
  }

  let hasErrors = false;

  // Apply each validation error to the corresponding form field
  for (const validationError of errorResponse.errors) {
    const fieldName = validationError.field;
    const errorMessage = validationError.defaultMessage;

    if (fieldName && form.contains(fieldName)) {
      const control = form.get(fieldName);
      if (control) {
        // Merge server error with existing errors
        const existingErrors = control.errors || {};
        control.setErrors({
          ...existingErrors,
          serverError: errorMessage
        });
        // Mark as touched so the error displays
        control.markAsTouched();
        hasErrors = true;
      }
    }
  }

  return hasErrors;
}
