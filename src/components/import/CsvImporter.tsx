'use client'
import { useState, useTransition } from 'react'
import Papa from 'papaparse'
import { importTransactionsAction } from '@/lib/actions/import'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Account { id: string; name: string }
interface Props { accounts: Account[] }

type MappedRow = {
  date: string
  amount: string
  description: string
  type: 'income' | 'expense'
  account_id: string
}

const REQUIRED_FIELDS = ['date', 'amount', 'description', 'type'] as const

export function CsvImporter({ accounts }: Props) {
  const [isPending, startTransition] = useTransition()
  const [headers,   setHeaders]      = useState<string[]>([])
  const [rawRows,   setRawRows]      = useState<string[][]>([])
  const [filename,  setFilename]     = useState('')
  const [mapping,   setMapping]      = useState<Record<string, string>>({})
  const [accountId, setAccountId]    = useState(accounts[0]?.id ?? '')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    Papa.parse<string[]>(file, {
      complete: (result) => {
        const [headerRow, ...dataRows] = result.data.filter((r) => r.some((c) => c.trim()))
        setHeaders(headerRow ?? [])
        setRawRows(dataRows.slice(0, 200))
        setMapping({})
      },
      skipEmptyLines: true,
    })
  }

  function buildRows(): MappedRow[] | null {
    for (const field of REQUIRED_FIELDS) {
      if (!mapping[field]) return null
    }
    return rawRows.map((row) => ({
      date:        row[headers.indexOf(mapping['date']!)]?.trim() ?? '',
      amount:      row[headers.indexOf(mapping['amount']!)]?.trim() ?? '0',
      description: row[headers.indexOf(mapping['description']!)]?.trim() ?? '',
      type:        row[headers.indexOf(mapping['type']!)]?.trim().toLowerCase() === 'income'
        ? 'income'
        : 'expense',
      account_id:  accountId,
    }))
  }

  const preview   = buildRows()?.slice(0, 10) ?? null
  const canImport = preview !== null && preview.length > 0 && !!accountId

  function handleImport() {
    const rows = buildRows()
    if (!rows) return
    const fd = new FormData()
    fd.append('rows', JSON.stringify(rows))
    fd.append('filename', filename)
    startTransition(async () => {
      const result = await importTransactionsAction(fd)
      if (result.error) toast.error(result.error)
      else toast.success(`Imported ${result.data?.imported ?? 0} transactions`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="csv-file">Upload CSV file</Label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text hover:file:bg-border cursor-pointer"
        />
      </div>

      {headers.length > 0 && (
        <>
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Map columns</h3>
            <div className="grid grid-cols-2 gap-3">
              {REQUIRED_FIELDS.map((field) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs capitalize">{field}</Label>
                  <Select
                    value={mapping[field] ?? ''}
                    onValueChange={(v) => {
                      if (v != null) setMapping((m) => ({ ...m, [field]: v }))
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select column…" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Destination account</Label>
            <Select
              value={accountId}
              onValueChange={(v) => { if (v != null) setAccountId(v) }}
            >
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {preview && preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Preview (first {preview.length} rows)</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-surface">
                <tr>
                  {(['date','amount','description','type'] as const).map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-text-muted capitalize">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono">{row.date}</td>
                    <td className="px-3 py-1.5 font-mono">{row.amount}</td>
                    <td className="px-3 py-1.5 max-w-[160px] truncate">{row.description}</td>
                    <td className="px-3 py-1.5 capitalize">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted">{rawRows.length} rows total will be imported</p>
        </div>
      )}

      {canImport && (
        <Button onClick={handleImport} disabled={isPending} className="w-full">
          {isPending ? 'Importing…' : `Import ${rawRows.length} transactions`}
        </Button>
      )}
    </div>
  )
}
