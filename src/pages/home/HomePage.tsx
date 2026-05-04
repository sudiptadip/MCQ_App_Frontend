import { storage } from "../../utils/storage";
import type { User } from "../../features/auth/types";


const HomePage = () => {
  const user = storage.get<User>("user") || ({} as User);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name || "User"}!</h1>
        <p className="text-muted-foreground mt-2">
          Here is what's happening with your exams today.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Total Exams</h3>
          <p className="text-4xl font-bold text-primary">0</p>
        </div>
        <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Completed</h3>
          <p className="text-4xl font-bold text-green-500">0</p>
        </div>
        <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Pending</h3>
          <p className="text-4xl font-bold text-orange-500">0</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
