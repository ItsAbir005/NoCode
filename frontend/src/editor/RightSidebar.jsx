import { Sparkles, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RightSidebar() {
  return (
    <div className="h-full flex flex-col bg-card">
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <div className="border-b border-border">
          <TabsList className="w-full justify-start rounded-none h-11 bg-transparent p-0">
            <TabsTrigger
              value="properties"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Settings2 className="w-4 h-4 mr-1.5" />
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI Tips
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties" className="flex-1 m-0 p-4">
          <div className="text-sm text-muted-foreground text-center py-8">
            <Settings2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Select a component to view properties</p>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-1 m-0 p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Quick Actions
            </h4>
            <div className="space-y-2">
              {[
                "Add a form with validation",
                "Create a navigation menu",
                "Add a data table",
                "Set up page routing",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-3 py-2.5 text-sm bg-muted/50 hover:bg-muted rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
