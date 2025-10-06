import { useMemo, useState } from "react";
import { ArrowUpDown, InfoIcon, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useSettings } from "@/hooks/useSettings";
import { useContextPaths } from "@/hooks/useContextPaths";
import type { ContextPathResult } from "@/lib/schemas";

type ContextRule = ContextPathResult & {
  type: "include" | "autoInclude" | "exclude";
};

type SortKey = "tokens" | "files" | "rule";

type RuleFilter = "all" | ContextRule["type"];

const typeConfig: Record<ContextRule["type"], {
  label: string;
  badgeVariant: "default" | "secondary" | "destructive";
  tooltip: string;
  barClass: string;
}> = {
  include: {
    label: "Manual include",
    badgeVariant: "default",
    tooltip: "These paths are always available to the assistant. Smart Context considers them high priority manual context.",
    barClass: "bg-primary/70",
  },
  autoInclude: {
    label: "Auto-include",
    badgeVariant: "secondary",
    tooltip: "Smart Context always appends these paths to its automatically selected files.",
    barClass: "bg-sky-500/70",
  },
  exclude: {
    label: "Exclude",
    badgeVariant: "destructive",
    tooltip: "Smart Context never uses files that match this rule, even if they are relevant.",
    barClass: "bg-destructive/70",
  },
};

export function ContextFilesPicker() {
  const { settings } = useSettings();
  const {
    contextPaths,
    smartContextAutoIncludes,
    excludePaths,
    updateContextPaths,
    updateSmartContextAutoIncludes,
    updateExcludePaths,
    sortKey,
    sortDirection,
    ruleFilter,
    setSortKey,
    setSortDirection,
    setRuleFilter,
  } = useContextPaths();
  const [isOpen, setIsOpen] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newAutoIncludePath, setNewAutoIncludePath] = useState("");
  const [newExcludePath, setNewExcludePath] = useState("");

  const rules = useMemo<ContextRule[]>(
    () => [
      ...contextPaths.map((rule) => ({ ...rule, type: "include" as const })),
      ...smartContextAutoIncludes.map((rule) => ({
        ...rule,
        type: "autoInclude" as const,
      })),
      ...excludePaths.map((rule) => ({ ...rule, type: "exclude" as const })),
    ],
    [contextPaths, smartContextAutoIncludes, excludePaths],
  );

  const totals = useMemo(
    () => ({
      totalTokens: rules.reduce((sum, rule) => sum + (rule.tokens || 0), 0),
      totalFiles: rules.reduce((sum, rule) => sum + (rule.files || 0), 0),
    }),
    [rules],
  );

  const filteredRules = useMemo(
    () =>
      ruleFilter === "all"
        ? rules
        : rules.filter((rule) => rule.type === ruleFilter),
    [ruleFilter, rules],
  );

  const sortedRules = useMemo(() => {
    const data = [...filteredRules];
    const direction = sortDirection === "asc" ? 1 : -1;
    data.sort((a, b) => {
      if (sortKey === "tokens")
        return direction * ((a.tokens || 0) - (b.tokens || 0));
      if (sortKey === "files")
        return direction * ((a.files || 0) - (b.files || 0));
      if (sortKey === "rule") {
        const order: ContextRule["type"][] = ["include", "autoInclude", "exclude"];
        return direction * (order.indexOf(a.type) - order.indexOf(b.type));
      }
      return 0;
    });
    return data;
  }, [filteredRules, sortDirection, sortKey]);

  const metricKey: SortKey = sortKey === "rule" ? "tokens" : sortKey;

  const addPath = () => {
    if (
      newPath.trim() === "" ||
      contextPaths.find((p: ContextPathResult) => p.globPath === newPath)
    ) {
      setNewPath("");
      return;
    }
    const newPaths = [
      ...contextPaths.map(({ globPath }: ContextPathResult) => ({ globPath })),
      {
        globPath: newPath,
      },
    ];
    updateContextPaths(newPaths);
    setNewPath("");
  };

  const removePath = (pathToRemove: string) => {
    const newPaths = contextPaths
      .filter((p: ContextPathResult) => p.globPath !== pathToRemove)
      .map(({ globPath }: ContextPathResult) => ({ globPath }));
    updateContextPaths(newPaths);
  };

  const addAutoIncludePath = () => {
    if (
      newAutoIncludePath.trim() === "" ||
      smartContextAutoIncludes.find(
        (p: ContextPathResult) => p.globPath === newAutoIncludePath,
      )
    ) {
      setNewAutoIncludePath("");
      return;
    }
    const newPaths = [
      ...smartContextAutoIncludes.map(({ globPath }: ContextPathResult) => ({
        globPath,
      })),
      {
        globPath: newAutoIncludePath,
      },
    ];
    updateSmartContextAutoIncludes(newPaths);
    setNewAutoIncludePath("");
  };

  const removeAutoIncludePath = (pathToRemove: string) => {
    const newPaths = smartContextAutoIncludes
      .filter((p: ContextPathResult) => p.globPath !== pathToRemove)
      .map(({ globPath }: ContextPathResult) => ({ globPath }));
    updateSmartContextAutoIncludes(newPaths);
  };

  const addExcludePath = () => {
    if (
      newExcludePath.trim() === "" ||
      excludePaths.find((p: ContextPathResult) => p.globPath === newExcludePath)
    ) {
      setNewExcludePath("");
      return;
    }
    const newPaths = [
      ...excludePaths.map(({ globPath }: ContextPathResult) => ({ globPath })),
      {
        globPath: newExcludePath,
      },
    ];
    updateExcludePaths(newPaths);
    setNewExcludePath("");
  };

  const removeExcludePath = (pathToRemove: string) => {
    const newPaths = excludePaths
      .filter((p: ContextPathResult) => p.globPath !== pathToRemove)
      .map(({ globPath }: ContextPathResult) => ({ globPath }));
    updateExcludePaths(newPaths);
  };

  const handleRemoveRule = (rule: ContextRule) => {
    if (rule.type === "include") removePath(rule.globPath);
    if (rule.type === "autoInclude") removeAutoIncludePath(rule.globPath);
    if (rule.type === "exclude") removeExcludePath(rule.globPath);
  };

  const isSmartContextEnabled =
    settings?.enableDyadPro && settings?.enableProSmartFilesContextMode;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="has-[>svg]:px-2"
              size="sm"
              data-testid="codebase-context-button"
            >
              <Settings2 className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Codebase Context</TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-[420px] max-h-[80vh] overflow-y-auto"
        align="start"
      >
        <div className="relative space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Codebase Context</h3>
            <p className="text-sm text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help">
                      Select the files to use as context.{" "}
                      <InfoIcon className="size-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    {isSmartContextEnabled ? (
                      <p>
                        With Smart Context, Dyad uses the most relevant files as
                        context.
                      </p>
                    ) : (
                      <p>By default, Dyad uses your whole codebase.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Sort by</span>
                <Select
                  value={sortKey}
                  onValueChange={(value) => setSortKey(value as SortKey)}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokens">Tokens</SelectItem>
                    <SelectItem value="files">Files</SelectItem>
                    <SelectItem value="rule">Rule type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className={`size-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
              </Button>
              <div className="flex items-center gap-2">
                <span>Filter</span>
                <Select
                  value={ruleFilter}
                  onValueChange={(value) => setRuleFilter(value as RuleFilter)}
                >
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue placeholder="Rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All rules</SelectItem>
                    <SelectItem value="include">Manual includes</SelectItem>
                    <SelectItem value="autoInclude">Auto-includes</SelectItem>
                    <SelectItem value="exclude">Excludes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <div>
                <span className="block text-muted-foreground/70">Rules</span>
                <span className="text-sm font-medium text-foreground">
                  {rules.length.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground/70">Tracked files</span>
                <span className="text-sm font-medium text-foreground">
                  {totals.totalFiles.toLocaleString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-muted-foreground/70">Tracked tokens</span>
                <span className="text-sm font-medium text-foreground">
                  {totals.totalTokens.toLocaleString()}
                </span>
              </div>
            </div>

            <TooltipProvider>
              {sortedRules.length > 0 ? (
                <div className="space-y-3">
                  {sortedRules.map((rule) => {
                    const tokenPercent =
                      totals.totalTokens > 0
                        ? Math.min(
                            100,
                            (rule.tokens / totals.totalTokens) * 100,
                          )
                        : 0;
                    const filePercent =
                      totals.totalFiles > 0
                        ? Math.min(100, (rule.files / totals.totalFiles) * 100)
                        : 0;
                    const metricPercent =
                      metricKey === "tokens" ? tokenPercent : filePercent;
                    return (
                      <div
                        key={`${rule.type}-${rule.globPath}`}
                        className="flex items-start justify-between gap-3 rounded-md border p-3"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant={typeConfig[rule.type].badgeVariant}>
                                  {typeConfig[rule.type].label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[260px] text-xs">
                                {typeConfig[rule.type].tooltip}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate font-mono text-sm text-foreground">
                                  {rule.globPath}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{rule.globPath}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded bg-muted">
                            <div
                              className={`h-full ${typeConfig[rule.type].barClass}`}
                              style={{ width: `${metricPercent}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              ~{rule.tokens.toLocaleString()} tokens ({tokenPercent.toFixed(1)}%)
                            </span>
                            <span>
                              {rule.files.toLocaleString()} files ({filePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRule(rule)}
                          data-testid="context-rule-remove-button"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  {isSmartContextEnabled
                    ? "Dyad will use Smart Context to automatically find the most relevant files to use as context."
                    : "Dyad will use the entire codebase as context."}
                </div>
              )}
            </TooltipProvider>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">Add manual include</h4>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  data-testid="manual-context-files-input"
                  type="text"
                  placeholder="src/**/*.tsx"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addPath();
                    }
                  }}
                />
                <Button
                  type="submit"
                  onClick={addPath}
                  data-testid="manual-context-files-add-button"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Exclude paths</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                          <InfoIcon className="size-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p>
                          Exclude paths take precedence. Files that match both include and exclude patterns are removed from context.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  data-testid="exclude-context-files-input"
                  type="text"
                  placeholder="node_modules/**/*"
                  value={newExcludePath}
                  onChange={(e) => setNewExcludePath(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addExcludePath();
                    }
                  }}
                />
                <Button
                  type="submit"
                  onClick={addExcludePath}
                  data-testid="exclude-context-files-add-button"
                >
                  Add
                </Button>
              </div>
            </div>

            {isSmartContextEnabled && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Smart Context auto-includes</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                            <InfoIcon className="size-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>
                            Auto-include files are always added to the context in addition to the files selected by Smart Context.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    data-testid="auto-include-context-files-input"
                    type="text"
                    placeholder="src/**/*.config.ts"
                    value={newAutoIncludePath}
                    onChange={(e) => setNewAutoIncludePath(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addAutoIncludePath();
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    onClick={addAutoIncludePath}
                    data-testid="auto-include-context-files-add-button"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
