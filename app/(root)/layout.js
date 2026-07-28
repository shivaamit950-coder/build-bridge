import BottomNav from "@/BottomNav";

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
