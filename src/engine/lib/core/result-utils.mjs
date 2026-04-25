function success(value) {
  const result = { isSuccess: true, isFailure: false, value, error: null };
  return result;
}

function fail(message, code) {
  const result = {
    isSuccess: false,
    isFailure: true,
    value: null,
    error: { message, code },
  };

  return result;
}

export const ResultUtils = {
  success,
  fail,
};
