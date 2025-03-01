import React from "react";
import type {
  ColumnSizingState,
  ColumnSizingInfoState,
  Table,
} from "@tanstack/react-table";

interface ColumnConstraint {
  id: string;
  size: number;
  minSize: number;
  maxSize: number;
}

/**
 * Distributes pixels proportionally across columns based on their sizes and constraints.
 */
function distributePixelsProportionally(
  columnSizes: number[],
  pixelsToDistribute: number,
  constraints: ColumnConstraint[],
  useFloatPrecision: boolean = true,
  useAvailableSpace: boolean = true
): number[] {
  // Base conditions
  if (columnSizes.length === 0 || pixelsToDistribute === 0) {
    return columnSizes.map(() => 0);
  }

  // Scale up for precise float calculations (power of 2 to avoid precision issues)
  const precisionScale = useFloatPrecision ? 8192 : 1;
  const scaledPixels = pixelsToDistribute * precisionScale;

  // Calculate available space for growing or shrinking
  const availableSpace = columnSizes.map((size, i) => {
    if (pixelsToDistribute < 0) {
      return size - constraints[i]!.minSize;
    } else {
      return constraints[i]!.maxSize - size;
    }
  });

  // Determine basis for distribution (either available space or column sizes)
  const distributionBasis = useAvailableSpace ? availableSpace : columnSizes;
  const totalBasis = distributionBasis.reduce((sum, value) => sum + value, 0);

  // Calculate initial pixel distribution proportionally
  const initialChanges = distributionBasis.map((basis) =>
    totalBasis > 0 ? Math.floor((basis * scaledPixels) / totalBasis) : 0
  );

  // Apply constraints to ensure columns don't exceed min/max sizes
  const constrainedChanges = initialChanges.map((change, i) => {
    if (pixelsToDistribute < 0) {
      // Don't shrink below minimum size
      return Math.max(change, -availableSpace[i]! * precisionScale);
    } else {
      // Don't grow beyond maximum size
      return Math.min(change, availableSpace[i]! * precisionScale);
    }
  });

  // Calculate how much delta is left to distribute after applying constraints
  const distributedPixels = constrainedChanges.reduce(
    (sum, change) => sum + change,
    0
  );
  const remainingPixels = scaledPixels - distributedPixels;

  // If we have remaining pixels to distribute, allocate them to columns that can still grow
  let finalChanges = [...constrainedChanges];
  if (remainingPixels > 0) {
    // Find columns that can still grow
    const columnsWithCapacity = constrainedChanges
      .map((change, i) => ({
        index: i,
        remainingCapacity: availableSpace[i]! * precisionScale - change,
      }))
      .filter((col) => col.remainingCapacity > 0)
      .sort((a, b) => b.remainingCapacity - a.remainingCapacity);

    // Distribute remaining pixels
    let unallocatedPixels = remainingPixels;
    for (const column of columnsWithCapacity) {
      if (unallocatedPixels <= 0) break;
      const pixelsToAdd = Math.min(unallocatedPixels, column.remainingCapacity);
      finalChanges[column.index]! += pixelsToAdd;
      unallocatedPixels -= pixelsToAdd;
    }
  }

  // Scale back down if using float precision
  if (useFloatPrecision) {
    return finalChanges.map((change) => change / precisionScale);
  }

  return finalChanges;
}

export function useResize() {
  // Reference to column sizes before resize starts
  const prevColumnSizes = React.useRef<ColumnSizingState>({});

  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnSizingInfo, setColumnSizingInfo] =
    React.useState<ColumnSizingInfoState>({
      isResizingColumn: false,
      columnSizingStart: [],
      deltaOffset: null,
      deltaPercentage: null,
      startOffset: null,
      startSize: null,
    });
  const [columnConstraints, setColumnConstraints] = React.useState<
    ColumnConstraint[]
  >([]);

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  // Update container width on mount and window resize
  React.useEffect(() => {
    const updateContainerWidth = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.clientWidth);
      }
    };
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // Update column constraints when columns change
  const updateColumnConstraints = React.useCallback((table: Table<any>) => {
    const newConstraints = table.getFlatHeaders().map((header) => ({
      id: header.id,
      size: header.getSize(),
      minSize: header.column.columnDef.minSize ?? 0,
      maxSize: header.column.columnDef.maxSize ?? 4800,
    }));
    setColumnConstraints(newConstraints);
  }, []);

  const initializeColumnSizing = React.useCallback(() => {
    if (containerWidth > 0 && columnConstraints.length > 0) {
      const currentTotalWidth = columnConstraints.reduce(
        (sum, column) => sum + column.size,
        0
      );

      // Calculate extra space to distribute among columns
      const extraSpace = Math.max(containerWidth - currentTotalWidth, 0);

      const sizeAdjustments = distributePixelsProportionally(
        columnConstraints.map((column) => column.size),
        extraSpace,
        columnConstraints,
        true, // Use float precision
        false // Use column sizes (not available space) for distribution
      );

      const newSizes: ColumnSizingState = {};
      columnConstraints.forEach((column, index) => {
        newSizes[column.id] = column.size + sizeAdjustments[index]!;
      });

      setColumnSizing(newSizes);
      prevColumnSizes.current = newSizes;
    }
  }, [containerWidth, columnConstraints]);

  // Initialize sizing when container width or constraints change
  React.useEffect(() => {
    initializeColumnSizing();
  }, [containerWidth, columnConstraints, initializeColumnSizing]);

  // Store column sizes when resizing ends
  React.useEffect(() => {
    if (!columnSizingInfo.isResizingColumn) {
      prevColumnSizes.current = columnSizing;
    }
  }, [columnSizingInfo.isResizingColumn, columnSizing]);

  const handleColumnSizing = React.useCallback(
    (
      updaterOrValue:
        | ColumnSizingState
        | ((old: ColumnSizingState) => ColumnSizingState)
    ) => {
      // Handle non-resizing updates (direct state updates)
      if (!columnSizingInfo.isResizingColumn || !columnSizingInfo.deltaOffset) {
        const newSizing =
          typeof updaterOrValue === "function"
            ? updaterOrValue(columnSizing)
            : updaterOrValue;
        setColumnSizing(newSizing);
        return;
      }

      // Handle active column resizing
      const resizingColumnId = columnSizingInfo.isResizingColumn;
      let pixelDelta = Math.round(columnSizingInfo.deltaOffset);
      let updatedSizing = { ...prevColumnSizes.current };

      // Find the index of the column being resized
      const resizingColumnIndex = columnConstraints.findIndex(
        (c) => c.id === resizingColumnId
      );
      const rightColumns = columnConstraints.slice(resizingColumnIndex + 1);

      // Calculate total width of all columns before resizing
      const totalTableWidth = columnConstraints.reduce(
        (sum, column) => sum + prevColumnSizes.current[column.id]!,
        0
      );

      // Process columns to the left of the resizing column (including the resizing column itself)
      let remainingDelta = pixelDelta;
      if (remainingDelta !== 0) {
        // Start from the resizing column and work leftward
        for (let i = resizingColumnIndex; i >= 0 && remainingDelta !== 0; i--) {
          const column = columnConstraints[i]!;
          const currentSize = prevColumnSizes.current[column.id]!;
          const targetSize = currentSize + remainingDelta;

          // Apply min/max constraints
          const constrainedSize = Math.min(
            Math.max(targetSize, column.minSize),
            column.maxSize
          );
          updatedSizing[column.id] = constrainedSize;

          // Calculate remaining delta that couldn't be applied due to constraints
          remainingDelta = targetSize - constrainedSize;
        }
      }

      // Adjust delta based on unallocated pixels
      let adjustedDelta = pixelDelta;
      if (remainingDelta !== 0) {
        adjustedDelta = pixelDelta - remainingDelta;
      }

      // Handle right columns resizing based on table width constraints
      if (totalTableWidth > containerWidth) {
        // When table is wider than container, adjust delta for overflow
        adjustedDelta = adjustedDelta + (totalTableWidth - containerWidth);
        if (adjustedDelta > 0) {
          adjustedDelta = 0; // Don't allow growth when table already exceeds container
        }
      } else if (adjustedDelta > 0) {
        // If growing, ensure we don't shrink right columns below their minimum
        const availableShrinkSpace = rightColumns.reduce((sum, column) => {
          return sum + prevColumnSizes.current[column.id]! - column.minSize;
        }, 0);
        adjustedDelta = Math.min(availableShrinkSpace, adjustedDelta);
      }

      // Apply changes to columns on the right of the resizing column
      if (rightColumns.length > 0 && adjustedDelta !== 0) {
        const rightColumnSizes = rightColumns.map(
          (column) => prevColumnSizes.current[column.id]!
        );

        // Distribute the delta proportionally among right columns (negative delta)
        const rightColumnChanges = distributePixelsProportionally(
          rightColumnSizes,
          -adjustedDelta, // Negative because we're doing the opposite of the main column
          rightColumns
        );

        // Apply the changes to the right columns
        rightColumns.forEach((column, index) => {
          updatedSizing[column.id] =
            prevColumnSizes.current[column.id]! + rightColumnChanges[index]!;
        });
      }

      setColumnSizing(updatedSizing);
    },
    [columnSizingInfo, containerWidth, columnConstraints]
  );

  return {
    columnSizing,
    setColumnSizing: handleColumnSizing,
    columnSizingInfo,
    setColumnSizingInfo,
    tableContainerRef,
    updateColumnConstraints,
    containerWidth,
  };
}
