import type { TaskStatus, Config } from '../types.js';
import { generateDefaultConfig } from '../config/defaults.js';

/** Map raw task markers to structured statuses */
export class StatusMapper {
  private mapping: Record<string, TaskStatus>;
  private columns: Config['columns'];

  constructor(config?: Config) {
    const defaults = generateDefaultConfig();
    this.mapping = config?.statusMapping ?? defaults.statusMapping;
    this.columns = config?.columns ?? defaults.columns;
  }

  /** Map a marker to a TaskStatus */
  mapStatus(marker: string): TaskStatus {
    // Exact match first
    if (this.mapping[marker] !== undefined) {
      return this.mapping[marker]!;
    }

    // Case-insensitive match
    const lowerMarker = marker.toLowerCase();
    for (const [key, value] of Object.entries(this.mapping)) {
      if (key.toLowerCase() === lowerMarker) {
        return value;
      }
    }

    // Default to 'todo' for unknown markers
    return 'todo';
  }

  /** Map a status to a column name */
  mapToColumn(status: TaskStatus): string {
    for (const col of this.columns) {
      if (col.patterns) {
        for (const pattern of col.patterns) {
          // Check if this column's patterns map to the given status
          for (const [marker, mappedStatus] of Object.entries(this.mapping)) {
            if (mappedStatus === status && col.patterns.includes(pattern)) {
              // Verify this pattern belongs to this column
              if (pattern.toUpperCase().includes(marker.toUpperCase()) || marker.toUpperCase().includes(pattern.toUpperCase())) {
                return col.name;
              }
            }
          }
        }
      }
    }

    // Fallback: find column by status mapping
    for (const col of this.columns) {
      if (col.patterns) {
        for (const pattern of col.patterns) {
          const mapped = this.mapping[pattern];
          if (mapped === status) {
            return col.name;
          }
        }
      }
    }

    return 'To Do'; // ultimate fallback
  }
}
