export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const validateCode = (
  code: string, 
  validation: {
    requiredKeywords?: string[];
    forbiddenKeywords?: string[];
    mustContain?: string[];
    mustNotContain?: string[];
  }
): ValidationResult => {
  const codeText = code.toLowerCase().trim();
  
  // Check required keywords
  if (validation.requiredKeywords) {
    for (const keyword of validation.requiredKeywords) {
      if (!codeText.includes(keyword.toLowerCase())) {
        return {
          isValid: false,
          message: `Your code must use '${keyword}'`,
          type: 'error'
        };
      }
    }
  }
  
  // Check forbidden keywords (hardcoded answers)
  if (validation.forbiddenKeywords) {
    for (const keyword of validation.forbiddenKeywords) {
      if (codeText.includes(keyword.toLowerCase())) {
        return {
          isValid: false,
          message: `Don't hardcode the answer! Try to solve it step by step.`,
          type: 'warning'
        };
      }
    }
  }
  
  // Check must contain (exact patterns)
  if (validation.mustContain) {
    for (const pattern of validation.mustContain) {
      if (!code.includes(pattern)) {
        return {
          isValid: false,
          message: `Your code should include '${pattern}'`,
          type: 'error'
        };
      }
    }
  }
  
  // Check must not contain
  if (validation.mustNotContain) {
    for (const pattern of validation.mustNotContain) {
      if (code.includes(pattern)) {
        return {
          isValid: false,
          message: `Your code should not include '${pattern}'`,
          type: 'error'
        };
      }
    }
  }
  
  return {
    isValid: true,
    message: 'Code validation passed!',
    type: 'success'
  };
};