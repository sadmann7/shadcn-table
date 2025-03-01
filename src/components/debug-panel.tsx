import React from "react";
import { Table as TanstackTable } from "@tanstack/react-table";

export default function DebugPanel({ table }: { table: TanstackTable<any> }) {
  const [windowWidth, setWindowWidth] = React.useState<number>(0);
  const renderCountRef = React.useRef(0);
  const lastRenderTime = React.useRef<string>("");

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    lastRenderTime.current = new Date().toISOString();
    renderCountRef.current++;
  });

  const columnWidths = table.getAllColumns().reduce(
    (acc, column) => {
      acc[column.id] = column.getSize();
      return acc;
    },
    {} as Record<string, number>
  );

  const state = table.getState();

  const debugSections = [
    {
      title: "Widths",
      data: {
        pageWidth: windowWidth,
        tableWidth: table.getTotalSize(),
        isOverflowing: table.getTotalSize() > windowWidth,
        columnWidths,
      },
    },
    {
      title: "Sizing Info",
      data: {
        columnSizingInfo: state.columnSizingInfo,
        columnSizing: state.columnSizing,
      },
    },
    {
      title: "Table State",
      data: {
        rowCount: table.getRowModel().rows.length,
        columnCount: table.getAllColumns().length,
        isResizing: state.columnSizingInfo.isResizingColumn,
        currentResizingColumn: state.columnSizingInfo.columnSizingStart,
        sortedRow: state.sorting.reduce(
          (acc, curr) => {
            acc[curr.id] = curr.desc ? "desc" : "asc";
            return acc;
          },
          {} as Record<string, string>
        ),
      },
    },
    {
      title: "Performance",
      data: {
        renderCount: renderCountRef.current + 1,
        previousRenderTime: lastRenderTime.current || "Not rendered yet",
        isMemoized: table.getState().columnSizingInfo.isResizingColumn,
        info: "not showing the current render time cuz tht will inturn cause a rerender",
      },
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 mb-4 text-[10px] font-mono">
      {debugSections.map((section) => (
        <div
          key={section.title}
          className="bg-muted rounded-md p-2 overflow-auto max-h-[200px] border shadow-sm"
        >
          <div className="font-semibold bg-secondary mb-1 text-xs">
            {section.title}
          </div>
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(section.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
