import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border border-border/30 rounded-full hover:bg-muted/50 transition-colors"
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage("es")}>Español</DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage("kn")}>ಕನ್ನಡ</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
