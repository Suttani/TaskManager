
import { ReactNode } from "react";
import { Header } from "@/components/Header";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <div className="container mx-auto px-4">
          TaskMaster &copy; {new Date().getFullYear()} - Gerenciador de Tarefas
        </div>
      </footer>
    </div>
  );
};
