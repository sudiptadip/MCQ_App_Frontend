import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ClipboardList } from "lucide-react";
import type Tests from "../../../types/database/Tests";

interface Props {
  data: Partial<Tests>;
  onChange: (field: keyof Tests, value: string | number) => void;
}

const TestInfoCard = ({ data, onChange }: Props) => {
  return (
    <Card className="shadow-md border-primary/10 overflow-hidden">
      <div className="h-1 bg-primary w-full" />
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <ClipboardList size={20} className="text-primary" />
          1. Test Details
        </CardTitle>
        <CardDescription>Fill in the basic information for this test.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="sm:col-span-2">
          <Label htmlFor="test-name" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Test Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="test-name"
            placeholder="e.g. Chapter 5 Quiz"
            value={data.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            className="h-11"
          />
        </div>

        {/* Duration */}
        <div>
          <Label htmlFor="test-duration" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Duration (minutes) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="test-duration"
            type="number"
            min={1}
            placeholder="e.g. 30"
            value={data.duration_minutes || ""}
            onChange={(e) => onChange("duration_minutes", Number(e.target.value))}
            className="h-11"
          />
        </div>

        {/* Total Questions */}
        <div>
          <Label htmlFor="test-total" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Total Questions <span className="text-destructive">*</span>
          </Label>
          <Input
            id="test-total"
            type="number"
            min={1}
            placeholder="e.g. 20"
            value={data.total_questions || ""}
            onChange={(e) => onChange("total_questions", Number(e.target.value))}
            className="h-11"
          />
        </div>

        {/* Min Attempt */}
        <div>
          <Label htmlFor="test-min" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Min Questions to Attempt
          </Label>
          <Input
            id="test-min"
            type="number"
            min={1}
            placeholder="e.g. 15"
            value={data.min_no_of_question_attempt || ""}
            onChange={(e) => onChange("min_no_of_question_attempt", e.target.value)}
            className="h-11"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <Label htmlFor="test-desc" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Description
          </Label>
          <textarea
            id="test-desc"
            rows={3}
            placeholder="Optional description for this test..."
            value={data.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none h-24"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TestInfoCard;
