import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Building2, Mail, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Department } from '../types/email';
import { useState } from 'react';
import { getDepartmentColor } from '../utils/colors';

interface QuickDepartmentsButtonProps {
  departments: Department[];
  language: 'en' | 'it';
  onUpdateDepartments?: (departments: Department[]) => void;
}

export function QuickDepartmentsButton({ departments, language, onUpdateDepartments }: QuickDepartmentsButtonProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedDept, setEditedDept] = useState<Department | null>(null);
  
  const t = {
    en: {
      departments: 'Departments',
      viewDepartments: 'View Departments',
      name: 'Name',
      description: 'Description',
      email: 'Email',
      totalDepts: 'department(s)',
      actions: 'Actions',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete'
    },
    it: {
      departments: 'Reparti',
      viewDepartments: 'Visualizza Reparti',
      name: 'Nome',
      description: 'Descrizione',
      email: 'Email',
      totalDepts: 'reparto/i',
      actions: 'Azioni',
      edit: 'Modifica',
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina'
    }
  };

  const translations = t[language];

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedDept({ ...departments[index] });
  };

  const handleSave = (index: number) => {
    if (editedDept && onUpdateDepartments) {
      const updatedDepartments = [...departments];
      updatedDepartments[index] = editedDept;
      onUpdateDepartments(updatedDepartments);
    }
    setEditingIndex(null);
    setEditedDept(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedDept(null);
  };

  const handleDelete = (index: number) => {
    if (onUpdateDepartments && confirm('Are you sure you want to delete this department?')) {
      const updatedDepartments = departments.filter((_, i) => i !== index);
      onUpdateDepartments(updatedDepartments);
    }
  };

  const handleFieldChange = (field: keyof Department, value: string) => {
    if (editedDept) {
      setEditedDept({ ...editedDept, [field]: value });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="w-4 h-4" />
          {translations.departments}
          <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            {departments.length}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-7xl"
        style={{ 
          width: '90vw', 
          maxWidth: '90vw', 
          height: '85vh', 
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px'
        }}
      >
        <DialogHeader className="shrink-0" style={{ marginBottom: '8px' }}>
          <DialogTitle>{translations.viewDepartments}</DialogTitle>
          <DialogDescription style={{ marginTop: '4px' }}>
            {departments.length} {translations.totalDepts}
          </DialogDescription>
        </DialogHeader>
        
        <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }} className="px-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{translations.name}</TableHead>
                <TableHead className="w-[350px]">{translations.description}</TableHead>
                <TableHead className="w-[250px]">{translations.email}</TableHead>
                <TableHead className="w-[150px] text-right">{translations.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell className="w-[200px]">
                    {editingIndex === index && editedDept ? (
                      <Input
                        value={editedDept.nome}
                        onChange={(e) => handleFieldChange('nome', e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getDepartmentColor(dept.nome, departments) }}
                        />
                        <span className="break-words">{dept.nome}</span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="w-[350px]">
                    {editingIndex === index && editedDept ? (
                      <Input
                        value={editedDept.descrizione}
                        onChange={(e) => handleFieldChange('descrizione', e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <span className="break-words text-sm line-clamp-2" title={dept.descrizione}>
                        {dept.descrizione}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell className="w-[250px]">
                    {editingIndex === index && editedDept ? (
                      <Input
                        type="email"
                        value={editedDept.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="text-blue-600 dark:text-blue-400 break-all">{dept.email}</span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="w-[150px]">
                    <div className="flex items-center justify-end gap-2">
                      {editingIndex === index ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSave(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
