// PATTERN: Common UI Patterns

import React, { useState } from 'react';

function ModalToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Modal</button>
      {isOpen && (
        <div className="modal">
          <p>Modal Content</p>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

// PATTERN: Common UI Patterns

import React, { useState } from 'react';

function Accordion() {
  const [activeIndex, setActiveIndex] = useState(null);
  const items = ['Section 1', 'Section 2', 'Section 3'];

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <button onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
            {item}
          </button>
          {activeIndex === index && <p>Content for {item}</p>}
        </div>
      ))}
    </div>
  );
}

// PATTERN: Common UI Patterns

import React, { useState } from 'react';

function Tabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Home', 'Profile', 'Settings'];

  return (
    <div>
      <div>
        {tabs.map((tab, index) => (
          <button key={index} onClick={() => setActiveTab(index)}>
            {tab}
          </button>
        ))}
      </div>
      <div>
        <p>Content for {tabs[activeTab]}</p>
      </div>
    </div>
  );
}

// PATTERN: Common UI Patterns

import React, { useState, useEffect } from 'react';

function DebouncedInput() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    return () => clearTimeout(handler);
  }, [inputValue]);

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
      />
      <p>Debounced: {debouncedValue}</p>
    </div>
  );
}

// PATTERN: Common UI Patterns

import React, { useState, useEffect, useRef } from 'react';

function InfiniteScroll() {
  const [items, setItems] = useState(['Item 1', 'Item 2']);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setItems(prev => [...prev, `Item ${prev.length + 1}`]);
      }
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {items.map(item => <div key={item}>{item}</div>)}
      <div ref={sentinelRef}>Loading more...</div>
    </div>
  );
}