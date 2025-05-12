import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Filters.css';

const Filters = ({ filters, onSearchChange, onFilterChange }) => {
  const [createdDateRange, setCreatedDateRange] = useState([null, null]);
  const [createdStart, createdEnd] = createdDateRange;

  const [updatedDateRange, setUpdatedDateRange] = useState([null, null]);
  const [updatedStart, updatedEnd] = updatedDateRange;

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value === "" || parseFloat(value) >= 0 ? value : 0;
    onFilterChange({ target: { name, value: sanitizedValue } });
  };

  const handleCreatedDateChange = (dates) => {
    setCreatedDateRange(dates);
    const [start, end] = dates;
    onFilterChange({ target: { name: 'created_after', value: start ? start.toISOString() : undefined } });
    onFilterChange({ target: { name: 'created_before', value: end ? end.toISOString() : undefined } });
  };

  const handleUpdatedDateChange = (dates) => {
    setUpdatedDateRange(dates);
    const [start, end] = dates;
    onFilterChange({ target: { name: 'updated_after', value: start ? start.toISOString() : undefined } });
    onFilterChange({ target: { name: 'updated_before', value: end ? end.toISOString() : undefined } });
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="search-product">Search Product</label>
        <input
          id="search-product"
          type="text"
          placeholder="Ex: Smartphone"
          value={filters.title || ""}
          onChange={onSearchChange}
        />
      </div>

      <div className="filter-group">
        <label>Created Period</label>
        <DatePicker
          selectsRange
          startDate={createdStart}
          endDate={createdEnd}
          onChange={handleCreatedDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select Date Range"
        />
      </div>

      <div className="filter-group">
        <label>Updated Period</label>
        <DatePicker
          selectsRange
          startDate={updatedStart}
          endDate={updatedEnd}
          onChange={handleUpdatedDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select Date Range"
        />
      </div>
    </div>
  );
};

export default Filters;
