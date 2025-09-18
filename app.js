/* ==========================================================
   app.js – final version (includes Lumo‑styled sorting)
   ========================================================== */

const { useState, useEffect } = React;

/* -----------------------------------------------------------------
   0️⃣ Helper: alphabetical sort (case‑insensitive)
   ----------------------------------------------------------------- */
function sortAlphabetically(arr) {
  // Return a **new** array – never mutate the original state directly
  return [...arr].sort((a, b) =>
    a.text.toLowerCase().localeCompare(b.text.toLowerCase())
  );
}

/* -----------------------------------------------------------------
   1️⃣ ChecklistItem – renders a single todo (inline‑edit enabled)
   ----------------------------------------------------------------- */
function ChecklistItem({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(item.text);

  const saveEdit = () => {
    const trimmed = tempText.trim();
    if (trimmed && trimmed !== item.text) {
      onUpdate(item.id, trimmed);
    }
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submit
      saveEdit();
    } else if (e.key === "Escape") {
      setTempText(item.text);
      setEditing(false);
    }
  };

  return (
    <li className={item.done ? "completed" : ""}>
      <label>
        <input type="checkbox" checked={item.done} onChange={onToggle} />
        {editing ? (
          <input
            type="text"
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKey}
            autoFocus
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)}>{item.text}</span>
        )}
      </label>
      <button onClick={onDelete}>✕</button>
    </li>
  );
}

/* -----------------------------------------------------------------
   2️⃣ Checklist – parent component that holds the list
   ----------------------------------------------------------------- */
function Checklist() {
  // -------------------- persisted items --------------------
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("checklist");
    return stored ? JSON.parse(stored) : [];
  });

  // -------------------- UI state --------------------
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");          // all | active | completed
  const [isSorted, setIsSorted] = useState(false);     // alphabetical toggle

  // -------------------- side‑effects --------------------
  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(items));
  }, [items]);

  // -------------------- CRUD handlers --------------------
  const addItem = (e) => {
    e.preventDefault();
    const trimmed = newTask.trim();
    if (!trimmed) return;
    const newItem = { id: Date.now(), text: trimmed, done: false };
    setItems((prev) => [...prev, newItem]);
    setNewTask("");
  };

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id, newText) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, text: newText } : it))
    );
  };

  // -------------------- sorting & filtering --------------------
  const baseFiltered = items.filter((item) => {
    if (filter === "active") return !item.done;
    if (filter === "completed") return item.done;
    return true; // "all"
  });
  const filteredItems = isSorted ? sortAlphabetically(baseFiltered) : baseFiltered;

  // -------------------- UI render --------------------
  return (
    <div>
      <h1>My Checklist</h1>

      {/* ---------- FILTER + SORT BUTTONS ---------- */}
      <div className="filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "active" ? "active" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        {/* NEW SORT BUTTON */}
        <button
          className={isSorted ? "active" : ""}
          onClick={() => setIsSorted((prev) => !prev)}
        >
          Sort A→Z
        </button>
      </div>

      {/* ---------- INPUT FORM ---------- */}
      <form onSubmit={addItem}>
        <input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {/* ---------- LIST ---------- */}
      <ul>
        {filteredItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={() => toggleItem(item.id)}
            onDelete={() => deleteItem(item.id)}
            onUpdate={updateItem}
          />
        ))}
      </ul>
    </div>
  );
}

/* -----------------------------------------------------------------
   3️⃣ Render the app into the page
   ----------------------------------------------------------------- */
ReactDOM.createRoot(document.getElementById("root")).render(<Checklist />);