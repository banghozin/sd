import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type GuideItem = {
  heading: string;
  body: string;
};

type Props = {
  title: string;
  items: GuideItem[];
};

export function GuideSection({ title, items }: Props) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 md:gap-6">
          {items.map((item, i) => (
            <article key={i} className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground md:text-base">
                {item.heading}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-7">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
