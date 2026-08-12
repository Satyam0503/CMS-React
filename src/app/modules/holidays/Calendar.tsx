import React, { ChangeEvent, useEffect, useState } from 'react'
import CalendarSidebar from './components/CalendarSidebar'
import CalendarHeader from './components/CalendarHeader'
import CalendarDays from './components/CalendarDays'
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { usePageData } from '../../Context/PageDataProvider'
import { useIntl } from 'react-intl'
import { CalendarImportItem, CalendarItem, CalendarItemType, GetCalendarItemPayload } from './models'
import { getAllCalendarItem, importCalendarItems } from './calendarServices'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import { formatServerDate, hasModuleFeaturePermission } from '../../../utils/common'
import { ModulesName, Permission } from '../../../utils/enums'
import { useAppSelector } from '../../Redux/hooks'



export default function Calendar() {
    const { formatMessage: i } = useIntl();
    const { setPageTitle } = usePageData();
    const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
    const [category, setCategory] = useState<CalendarItemType>(0);
    const [, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
    const [importOpen, setImportOpen] = useState(false);
    const [importRows, setImportRows] = useState<CalendarImportItem[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const permissions = useAppSelector(state => state.user.userData?.modulePermission ?? []);
    const canImport = hasModuleFeaturePermission(ModulesName.Calendar, Permission.Create, permissions);

    const handleCategoryChange = (category: CalendarItemType) => {
        setCategory(category);
    };

    function handleRefresh() {
        setRefresh(!isRefresh)
    }

    const handleSelectedDateChange = (updatedDate: Dayjs | null) => {
        setSelectedDate(updatedDate ?? dayjs());
    }

    const readImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError(null);
        try {
            const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
            const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "", raw: false });
            const normaliseColumn = (value: unknown) => String(value).trim().toLowerCase().replace(/\s+/g, " ");
            const headerIndex = sheetRows.findIndex(row => {
                const columns = row.map(normaliseColumn);
                return columns.includes("date") && columns.some(column => ["name", "holiday/festival", "holiday / festival"].includes(column));
            });
            if (headerIndex === -1) throw new Error("Could not find the Date and Holiday/Festival or Name columns.");

            const headers = sheetRows[headerIndex].map(normaliseColumn);
            const dateColumn = headers.indexOf("date");
            const nameColumn = headers.findIndex(column => ["name", "holiday/festival", "holiday / festival"].includes(column));
            const typeColumn = headers.indexOf("type");
            const rows = sheetRows.slice(headerIndex + 1).filter(row => row.some(value => String(value).trim())).map((row, index) => {
                const rawDate = row[dateColumn];
                const formattedDate = rawDate instanceof Date
                    ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}-${String(rawDate.getDate()).padStart(2, "0")}`
                    : formatServerDate(String(rawDate), "YYYY-MM-DD");
                const name = String(row[nameColumn] ?? "").trim();
                const sourceType = typeColumn === -1 ? "" : String(row[typeColumn] ?? "").trim().toLowerCase();
                if (formattedDate === "NA" || !name) throw new Error(`Row ${headerIndex + index + 2}: Date and Holiday/Festival or Name are required.`);
                // Calendar holidays are date-only values. Sending local midnight as
                // UTC moves it to the previous day in India (UTC+05:30).
                return { name, date: formattedDate, type: (sourceType === "event" ? 2 : 1) as 1 | 2 };
            });
            if (!rows.length || rows.length > 500) throw new Error("The file must contain 1 to 500 rows.");
            setImportRows(rows);
        } catch (error) { setImportRows([]); setImportError(error instanceof Error ? error.message : "Unable to read the file."); }
        event.target.value = "";
    };

    const submitImport = async () => {
        setImporting(true);
        try { const { data } = await importCalendarItems(importRows); if (!data.success) throw new Error(data.message); toast.success(data.message || "Calendar items imported."); setImportOpen(false); setImportRows([]); handleRefresh(); }
        catch (error) { setImportError(error instanceof Error ? error.message : "Import failed."); }
        finally { setImporting(false); }
    };

    // fetch all the items for selected year
    useEffect(() => {
        setLoading(true);
        const payload: GetCalendarItemPayload = {
            type: category == 0 ? null : category,
            year: selectedDate ? selectedDate.year() : dayjs().year()
        };
        const fetchedHolidayData = async () => {
            try {
                const { data } = await getAllCalendarItem(payload);
                if (data.success) setCalendarItems(data.methodResults);
            } catch (error) {
                console.error((error as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchedHolidayData()
    }, [selectedDate?.year(), isRefresh, category]);

    useEffect(() => {
        setPageTitle(i({ id: "PAGE.CALENDAR" }))
    }, [])

    return (
        <>
            <Box component={'div'}
                className='main-holiday-calendar gap-4'
            >
                <CalendarSidebar
                    occasions={calendarItems}
                    selectedDate={selectedDate}
                    handleRefresh={handleRefresh}
                    isRefresh={isRefresh}
                />
                <Box component='div'
                    className='gap-4'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: 'auto',
                        minHeight: 0,
                        flex: 1,
                    }}>
                    <CalendarHeader
                        selectedDate={selectedDate}
                        handleSelectedDateChange={handleSelectedDateChange}
                        handleCategoryChange={handleCategoryChange}
                        category={category}
                        onImport={canImport ? () => { setImportError(null); setImportOpen(true); } : undefined}
                    />
                    <CalendarDays
                        selectedDate={selectedDate}
                        handleSelectedDateChange={handleSelectedDateChange}
                        occasions={calendarItems}
                        handleRefresh={handleRefresh}
                    />
                </Box>
            </Box>
            <Dialog open={importOpen} onClose={() => !importing && setImportOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ pb: 1 }}>Import holidays and events</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography color="text.secondary">Upload <b>Name</b>, <b>Date</b>, and <b>Type</b> (Holiday/Event). India holiday sheets are also supported: <b>Holiday/Festival</b> is used as Name, while S.No., Day, title rows, and other categories are ignored.</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip label="Name" color="primary" variant="outlined" /><Chip label="Date" color="primary" variant="outlined" /><Chip label="Type" color="primary" variant="outlined" /></Stack>
                        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}><Table size="small" aria-label="Calendar import example"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Date</TableCell><TableCell>Type</TableCell></TableRow></TableHead><TableBody><TableRow><TableCell>New Year's Day</TableCell><TableCell>01 January 2026</TableCell><TableCell>Holiday</TableCell></TableRow></TableBody></Table></Box>
                        <Divider />
                        <Button component="label" variant="contained" sx={{ alignSelf: "start" }}>Choose CSV or Excel file<input hidden type="file" accept=".csv,.xlsx,.xls" onChange={readImportFile} /></Button>
                        {importRows.length > 0 && <Alert severity="success">{importRows.length} valid row(s) ready to import. Existing matching items will be skipped.</Alert>}
                        {importError && <Alert severity="error">{importError}</Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setImportOpen(false)} disabled={importing}>Cancel</Button><Button variant="contained" onClick={submitImport} disabled={!importRows.length || importing}>{importing ? "Importing..." : `Import ${importRows.length} item(s)`}</Button></DialogActions>
            </Dialog>
        </>
    )
}
