function getPagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const requestedLimit =
    query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(requestedLimit) ||
    page < 1 ||
    requestedLimit < 1
  ) {
    return {
      error: "page and limit must be positive integers",
    };
  }

  const limit = Math.min(requestedLimit, 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function getMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function isValidId(id) {
  const value = Number(id);
  return Number.isInteger(value) && value > 0;
}

module.exports = {
  getPagination,
  getMeta,
  isValidId,
};