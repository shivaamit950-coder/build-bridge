import BottomNav from "@/components/BottomNav";

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
