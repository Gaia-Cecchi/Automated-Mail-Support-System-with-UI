import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Building2, Mail } from 'lucide-react';
import { Department } from '../types/email';

interface QuickDepartmentsButtonProps {
  departments: Department[];
  language: 'en' | 'it';
}

export function QuickDepartmentsButton({ departments, language }: QuickDepartmentsButtonProps) {
  const t = {
    en: {
      departments: 'Departments',
      viewDepartments: 'View Departments',
      name: 'Name',
      description: 'Description',
      email: 'Email',
      totalDepts: 'department(s)'
    },
    it: {
      departments: 'Reparti',
      viewDepartments: 'Visualizza Reparti',
      name: 'Nome',
      description: 'Descrizione',
      email: 'Email',
      totalDepts: 'reparto/i'
    }
  };

  const translations = t[language];

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
      <DialogContent className="max-w-5xl sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{translations.viewDepartments}</DialogTitle>
          <DialogDescription>
            {departments.length} {translations.totalDepts}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translations.name}</TableHead>
                <TableHead>{translations.description}</TableHead>
                <TableHead>{translations.email}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{dept.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {dept.descrizione}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-blue-600 dark:text-blue-400">{dept.email}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
