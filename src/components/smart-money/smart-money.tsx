"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KrInsider } from "./kr-insider";
import { Us13F } from "./us-13f";

export function SmartMoney() {
  return (
    <Tabs defaultValue="KR" className="flex flex-col gap-5 md:gap-6">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-2xl bg-muted p-1.5 md:max-w-md">
        <TabsTrigger
          value="KR"
          className="h-auto whitespace-nowrap rounded-xl px-2 py-2.5 text-sm font-medium leading-tight data-[state=active]:bg-background md:px-4 md:py-2 md:text-sm"
        >
          🇰🇷 한국 내부자
        </TabsTrigger>
        <TabsTrigger
          value="US"
          className="h-auto whitespace-nowrap rounded-xl px-2 py-2.5 text-sm font-medium leading-tight data-[state=active]:bg-background md:px-4 md:py-2 md:text-sm"
        >
          🇺🇸 미국 13F
        </TabsTrigger>
      </TabsList>

      <TabsContent value="KR" className="mt-0">
        <KrInsider />
      </TabsContent>

      <TabsContent value="US" className="mt-0">
        <Us13F />
      </TabsContent>
    </Tabs>
  );
}
