import {GLOSSARY_ENTRIES} from "@/data/glossary-data";
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
              <TableHead className="w-[100px]">Icon</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GLOSSARY_ENTRIES.map((entry) => (
              <TableRow key={entry.category}>
                <TableCell className="font-medium">
                  <div
                    className="w-10 h-10 border border-gray-300 rounded"
                    style={{
                      cursor: entry.icon,
                    }}
                    title={entry.category}
                  />
                </TableCell>
                <TableCell className="font-semibold">
                  {entry.category}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
