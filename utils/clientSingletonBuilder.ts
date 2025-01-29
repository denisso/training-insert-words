function clientSingletonBuilder<TConstructor, Args>(
  name: string,
  Constructor: new (args: Args) => TConstructor,
  args: Args
): () => TConstructor {
  let inst: TConstructor | null = null;
  return () => {
    if (!inst) {
      if (typeof window === "undefined") {
        throw new Error(name + " is not available on the server.");
      }
      inst = new Constructor(args);
    }
    return inst as TConstructor;
  };
}

export default clientSingletonBuilder;
