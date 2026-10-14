const SearchBar = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  categories,
  sort,
  setSort,
  onReset,
}) => {
  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search products by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input search-input"
        />
      </div>

      <div className="filter-selects">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="filter-select"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>

        {(searchTerm || category !== "All" || sort !== "newest") && (
          <button onClick={onReset} className="btn btn-outline btn-reset">
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
