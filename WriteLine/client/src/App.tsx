import { Route, Switch } from "wouter";
import HomePage from "./pages/HomePage";
import StoryPage from "./pages/StoryPage";
import TimelinePage from "./pages/TimelinePage";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-2xl font-bold">WriteLine</span>
            </a>
            <nav className="flex items-center gap-4">
              <a href="/" className="text-muted-foreground hover:text-foreground">Explore</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">My Stories</a>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                New Story
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/story/:id" component={StoryPage} />
          <Route path="/timeline/:id" component={TimelinePage} />
          <Route component={() => <div>404 Not Found</div>} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
