import { GLOSSARY_ENTRIES } from "@/data/glossary-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/table";

export function Glossary() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Click-based Tracking Glossary</h2>
      <div className="pb-10 pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Icon</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-[1fr]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GLOSSARY_ENTRIES.map((entry) => (
              <TableRow key={entry.category}>
                <TableCell>
                  <img
                    src={entry.icon}
                    alt={entry.category}
                    className="w-6 h-6"
                  />
                </TableCell>
                <TableCell className="font-semibold">
                  {entry.category}
                </TableCell>
                <TableCell className="truncate">{entry.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
