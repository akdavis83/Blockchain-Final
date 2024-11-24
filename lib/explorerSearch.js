const explorerSearch = (query) => {
  query = query.trim();
  // Check if the query is an address
  const address = /^[0-9a-f]{40}$/.test(query);
  // Check if the query is a hash
  const hash = /^[0-9a-f]{64}$/.test(query);
  // Check if the query is empty
  const empty = /^$/.test(query);

  if (empty) {
    return false;
  }

  if (address) {
    return `/explorer/addresses/${query.toString()}`;
  }

  // block hash
  if (query.startsWith("000")) {
    return `/explorer/blocks/${query.toString()}`;
  }

  // transaction hash
  if (hash) {
    return `/explorer/transactions/${query.toString()}`;
  }
};

export default explorerSearch;
