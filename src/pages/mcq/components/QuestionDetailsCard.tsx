
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';

interface Props {
    questionText: string;
    setQuestionText: (val: string) => void;
    difficulty: string;
    setDifficulty: (val: string) => void;
}

export const QuestionDetailsCard = ({ questionText, setQuestionText, difficulty, setDifficulty }: Props) => {
    return (
        <Card className="shadow-md border-primary/10 overflow-hidden">
            <div className="h-1 bg-primary w-full" />
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-xl flex items-center justify-between">
                    <span>2. Question Details</span>
                    <div className="w-48">
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger className="h-9 bg-background">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
                <CardDescription>Enter the question text and set its difficulty.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    <Label htmlFor="question" className="text-sm font-semibold text-foreground/80">Question Text</Label>
                    <textarea
                        id="question"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="What is the capital of France?"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-y"
                    />
                </div>
            </CardContent>
        </Card>
    );
};
