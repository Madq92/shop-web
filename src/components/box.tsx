export default function Box({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="bg-white p-6">{children}</div>;
}
