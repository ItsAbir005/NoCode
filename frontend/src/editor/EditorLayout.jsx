import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { TopBar } from "./TopBar";
import { LeftSidebar } from "./LeftSidebar";
import { MainCanvas } from "./MainCanvas";
import { RightSidebar } from "./RightSidebar";
import { AIChatPanel } from "./AIChatPanel";
import { toast } from "sonner";

export function EditorLayout() {
  const [projectName, setProjectName] = useState("My Project");
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handlePreview = () => {
    toast.info("Preview mode coming soon!");
  };

  const handlePublish = () => {
    toast.success("Project published successfully!");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
      />

      <div className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar */}
          <ResizablePanel
            defaultSize={18}
            minSize={15}
            maxSize={25}
            className="border-r border-border"
          >
            <LeftSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Canvas */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <MainCanvas />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Sidebar */}
          <ResizablePanel
            defaultSize={22}
            minSize={18}
            maxSize={30}
            className="border-l border-border"
          >
            <RightSidebar />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* AI Chat Panel */}
        <AIChatPanel isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      </div>
    </div>
  );
}
