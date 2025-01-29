import React from "react";
function useConstructor<TConstructor, Args>(
  Constructor: new (args?: Args) => TConstructor,
  args?: Args
) {
  const ref = React.useRef<TConstructor | null>(null);
  if (ref.current === null) ref.current = new Constructor(args);
  return ref.current;
}

export default useConstructor;
