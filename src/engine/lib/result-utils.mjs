function success(value) {
  return { isSuccess: true, isFailure: false, value, error: null };
}

function fail(message, code) {
  return { isSuccess: false, isFailure: true, value: null, error: { message, code } };
}

export const ResultUtils = {
  success,
  fail,
};
