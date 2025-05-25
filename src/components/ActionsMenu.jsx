import React, { useState, useRef, useEffect } from 'react';
import './ActionsMenu.css';

const ActionsMenu = ({ children, label = 'Actions' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="actions-menu-dropdown" ref={dropdownRef}>
      <button className="actions-menu-button" onClick={toggleOpen}>
        {label}
      </button>
      {isOpen && (
        <div className="actions-menu-dropdown-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ActionsMenu;
