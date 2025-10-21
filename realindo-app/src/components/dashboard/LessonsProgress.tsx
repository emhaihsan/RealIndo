import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LessonsProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Bahasa Banjar 01</p>
            <p className="text-xs text-muted-foreground">Sapaan & Makanan</p>
          </div>
          <div className="text-sm text-muted-foreground">0/3 videos</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Flashcards</p>
            <p className="text-xs text-muted-foreground">Vocabulary practice</p>
          </div>
          <div className="text-sm text-muted-foreground">0/10 reviewed</div>
        </div>
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-900">
            💡 <strong>Tip:</strong> Complete videos and flashcards to earn EXP!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
