interface createValidationErrorResponseContentReturn {
  result: string;
  validation_errors: {
    validation_error_field: string;
    validation_error_message: string;
  };
}

const createValidationErrorResponseContent = (
  validationError: any
): createValidationErrorResponseContentReturn => {
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

const validateFields = async (schema: any, body: any) => {
  try {
    return await schema.validateSync(body, { abortEarly: false });
  } catch (err) {
    const validationResponse = createValidationErrorResponseContent(err);

    return validationResponse;
  }
};

export { validateFields };
