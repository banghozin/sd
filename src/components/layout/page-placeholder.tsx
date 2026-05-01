import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
};

export function PagePlaceholder({ icon: Icon, title, description, bullets }: Props) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <section className="flex flex-col gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bullets.map((text, i) => (
          <Card
            key={i}
            className="border-dashed bg-muted/30 transition-colors hover:bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="text-center text-xs text-muted-foreground md:text-sm">
        화면 뼈대입니다. 다음 단계에서 실제 데이터와 차트가 채워집니다.
      </p>
    </div>
  );
}
