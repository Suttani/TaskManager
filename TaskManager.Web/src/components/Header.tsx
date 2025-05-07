
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export const Header = () => {
  return (
    <header className="py-4 px-4 bg-background border-b">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">TaskMaster</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
