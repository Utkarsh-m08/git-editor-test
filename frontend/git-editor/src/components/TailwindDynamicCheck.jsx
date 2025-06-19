const colors = ["#f87171", "#60a5fa", "#34d399"];

return (
  <div className="flex gap-4">
    {colors.map((color, index) => (
      <div key={index} className={`w-16 h-16 rounded bg-[${color}]`}></div>
    ))}
  </div>
);

// inline works
export default function ColorBoxes() {
  return (
    <div className="flex gap-4 p-4">
      {colors.map((color, index) => (
        <div
          key={index}
          style={{ backgroundColor: color }}
          className="w-16 h-16 rounded shadow"
        />
      ))}
    </div>
  );
}


// evaluated at runtime, but Tailwind needs to know the exact value at build time.