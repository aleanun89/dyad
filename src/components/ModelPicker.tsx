import { type LargeLanguageModel } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useLocalModels } from "@/hooks/useLocalModels";
import { useLocalLMSModels } from "@/hooks/useLMStudioModels";
import { LocalModel } from "@/ipc/ipc_types";
import { useSettings } from "@/hooks/useSettings";
import { RefreshCw } from "lucide-react";

export function ModelPicker() {
  const { settings, updateSettings } = useSettings();
  const onModelSelect = (model: LargeLanguageModel) => {
    updateSettings({ selectedModel: model });
  };

  const [open, setOpen] = useState(false);

  // Ollama Models Hook
  const {
    models: ollamaModels,
    loading: ollamaLoading,
    error: ollamaError,
    loadModels: loadOllamaModels,
  } = useLocalModels();

  // LM Studio Models Hook
  const {
    models: lmStudioModels,
    loading: lmStudioLoading,
    error: lmStudioError,
    loadModels: loadLMStudioModels,
  } = useLocalLMSModels();

  // Load models when the dropdown opens
  useEffect(() => {
    if (open) {
      loadOllamaModels();
      loadLMStudioModels();
    }
  }, [open, loadOllamaModels, loadLMStudioModels]);

  // Get display name for the selected model
  const getModelDisplayName = () => {
    if (!settings?.selectedModel) return "Select Model";
    
    const selectedModel = settings.selectedModel;
    
    if (selectedModel.provider === "ollama") {
      return (
        ollamaModels.find(
          (model: LocalModel) => model.modelName === selectedModel.name,
        )?.displayName || selectedModel.name
      );
    }
    if (selectedModel.provider === "lmstudio") {
      return (
        lmStudioModels.find(
          (model: LocalModel) => model.modelName === selectedModel.name,
        )?.displayName || selectedModel.name
      );
    }

    // Fallback if not found
    return selectedModel.name;
  };

  // Determine availability of local models
  const hasOllamaModels =
    !ollamaLoading && !ollamaError && ollamaModels.length > 0;
  const hasLMStudioModels =
    !lmStudioLoading && !lmStudioError && lmStudioModels.length > 0;

  if (!settings) {
    return null;
  }

  const modelDisplayName = getModelDisplayName();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-8 max-w-[130px] px-1.5 text-xs-sm"
            >
              <span className="truncate">{modelDisplayName}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{modelDisplayName}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        className="w-64"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Local Models</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              loadOllamaModels();
              loadLMStudioModels();
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Ollama Models Section */}
        {ollamaLoading ? (
          <div className="text-xs text-center py-2 text-muted-foreground">
            Loading Ollama models...
          </div>
        ) : ollamaError ? (
          <div className="text-xs text-center py-2 text-muted-foreground">
            Ollama not available
          </div>
        ) : hasOllamaModels ? (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Ollama
            </div>
            {ollamaModels.map((model: LocalModel) => (
              <DropdownMenuItem
                key={`ollama-${model.modelName}`}
                className={
                  settings.selectedModel?.provider === "ollama" &&
                  settings.selectedModel?.name === model.modelName
                    ? "bg-secondary"
                    : ""
                }
                onClick={() => {
                  onModelSelect({
                    name: model.modelName,
                    provider: "ollama",
                  });
                  setOpen(false);
                }}
              >
                <span className="truncate">{model.displayName}</span>
              </DropdownMenuItem>
            ))}
            {hasLMStudioModels && <DropdownMenuSeparator />}
          </>
        ) : null}

        {/* LM Studio Models Section */}
        {lmStudioLoading ? (
          <div className="text-xs text-center py-2 text-muted-foreground">
            Loading LM Studio models...
          </div>
        ) : lmStudioError ? (
          <div className="text-xs text-center py-2 text-muted-foreground">
            LM Studio not available
          </div>
        ) : hasLMStudioModels ? (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              LM Studio
            </div>
            {lmStudioModels.map((model: LocalModel) => (
              <DropdownMenuItem
                key={`lmstudio-${model.modelName}`}
                className={
                  settings.selectedModel?.provider === "lmstudio" &&
                  settings.selectedModel?.name === model.modelName
                    ? "bg-secondary"
                    : ""
                }
                onClick={() => {
                  onModelSelect({
                    name: model.modelName,
                    provider: "lmstudio",
                  });
                  setOpen(false);
                }}
              >
                <span className="truncate">{model.displayName}</span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}

        {/* No models available message */}
        {!hasOllamaModels &&
          !hasLMStudioModels &&
          !ollamaLoading &&
          !lmStudioLoading && (
            <div className="text-xs text-center py-4 text-muted-foreground">
              <p className="mb-2">No local models available</p>
              <p className="text-xs">
                Install{" "}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Ollama
                </a>{" "}
                or{" "}
                <a
                  href="https://lmstudio.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  LM Studio
                </a>
              </p>
            </div>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
