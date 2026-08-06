'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { Task } from '@/services/api';

// Register required AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface TaskGridProps {
  rowData: Task[];
}

export default function TaskGrid({ rowData }: TaskGridProps) {
  const columnDefs = useMemo<ColDef<Task>[]>(() => [
    { field: 'title', headerName: 'Task Description', flex: 2, sortable: true, filter: true },
    { field: 'dueDate', headerName: 'Due Date', flex: 1, sortable: true, filter: true },
    { field: 'creatorEmail', headerName: 'Created By', flex: 1.5, filter: true },
    { field: 'assignedToEmail', headerName: 'Assigned To', flex: 1.5, filter: true },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      cellClassRules: {
        'text-green-600 font-bold': (params: ValueGetterParams<Task>) => params.value === 'Completed',
        'text-amber-600': (params: ValueGetterParams<Task>) => params.value === 'Pending',
      }
    }
  ], []);

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact 
        rowData={rowData} 
        columnDefs={columnDefs} 
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
}