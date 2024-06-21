import * as yup from "yup";

interface ValidationErrorResponse {
  result: string;
  validation_errors: {
    validation_error_field: string;
    validation_error_message: string;
  };
}

const createValidationErrorResponseContent = (
  validationError: any
): ValidationErrorResponse => {
  return {
    result: "validation_error",
    validation_errors: validationError.inner.map((err: any) => {
      return {
        validation_error_field: err.path,
        validation_error_message: err.message,
      };
    }),
  };
};

const validateFields = async (
  schema: yup.ObjectSchema<any>,
  body: any
): Promise<void | ValidationErrorResponse> => {
  try {
    await schema.validateSync(body, { abortEarly: false });
    return;
  } catch (error: unknown) {
    return createValidationErrorResponseContent(error);
  }
};

export { validateFields };
