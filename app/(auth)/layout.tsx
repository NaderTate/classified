function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center z-10">
      {children}
    </div>
  );
}

export default layout;
