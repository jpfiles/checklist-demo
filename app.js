// We can use ES6+ features because Babel will transpile them.
const { useState, useEffect } = React;

// ----- ChecklistItem component -----
function ChecklistItem({ item, onToggle, onDelete }) {
  return (
    <li className={item.done ? "completed" : ""}>
      <label>
        <input
          type="checkbox"
          checked={item.done}
          onChange={onToggle}
        />
        <span>{item.text}</span>
      </label>
      <button onClick={onDelete}>✕</button>
    </li>
  );
}

// ----- Main Checklist component -----
function Checklist() {
  // State holds an array of objects: { id, text, done }
  const [items, setItems] = useState(() => {
    // Load from localStorage if present (so data survives refresh)
    const stored = localStorage.getItem('checklist');
    return stored ? JSON.parse(stored) : [];
  });

  const [newText, setNewText] = useState('');

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newText.trim(),
      done: false,
    };
    setItems([...items, newItem]);
    setNewText('');
  };

  const toggleItem = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  };

  const deleteItem = (id) => {
    setItems(items.filter(it => it.id !== id));
  };

  return (
    <section>
      <h1>My Checklist</h1>
      <form onSubmit={addItem}>
        <input
          type="text"
          placeholder="Add a new task…"
          value={newText}
          onChange={e => setNewText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={() => toggleItem(item.id)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </ul>
    </section>
  );
}

// Render the whole app into the #root div
ReactDOM.createRoot(document.getElementById('root')).render(<Checklist />);