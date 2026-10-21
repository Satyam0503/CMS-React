import { useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Box, Chip, FormControlLabel, Grid, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, alpha, useTheme } from '@mui/material';
import { AppButton, AppCheckbox, AppTextField } from '../../../shared/components/ui';
import { postRequest, deleteRequest } from '../../../../server/axios';
import { toast } from 'react-toastify';
import { currencyFormatter } from '../../../../utils/common';
import { PayrollDateField } from './PayrollDateField';
import { coversConfigurationWindow, currentComponentVersions } from './payrollConfigurationSelection';
import type { PayrollPayGroup } from './PayrollPayGroupsPanel';
import { calculateTemplate, type SalaryTemplate, type TemplateComponent } from './payrollTemplateCalculation';
import { ConfirmationModal } from '../../../shared/components/ConfirmModal';
import { useIsDark } from '../../theme/useIsDark';

type Definition = Omit<TemplateComponent, 'componentId' | 'value' | 'sortOrder'> & {
  id?: string; effectiveFrom: string; effectiveTo?: string | null; isActive: boolean; version: number;
};
type Props = { templates: SalaryTemplate[]; groups: PayrollPayGroup[]; components: Definition[]; canEdit: boolean; onSaved: () => Promise<void> };
const emptyDraft = (): SalaryTemplate => ({ name: '', effectiveFrom: dayjs().startOf('month').format('YYYY-MM-DD'), isActive: true, components: [] });
const amounts = [['basicPay', 'Basic pay'], ['hra', 'HRA'], ['lta', 'LTA'], ['otherAllowance', 'Other allowance'], ['bonus', 'Monthly bonus']] as const;

export function PayrollSalaryTemplatesPanel({ templates, groups, components, canEdit, onSaved }: Props) {
  const theme = useTheme();
  const isDark = useIsDark();
  const [draft, setDraft] = useState<SalaryTemplate>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [retiring, setRetiring] = useState<SalaryTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<SalaryTemplate | null>(null);

  const deleteTemplate = async (template: SalaryTemplate) => {
    if (!canEdit || !template.id || busy) return;
    setBusy(true); setMessage('');
    try {
      const { data } = await deleteRequest<{ success: boolean; message?: string }>(
        `api/payroll/configuration/salary-templates/${encodeURIComponent(template.id)}?version=${template.version ?? 1}`
      );
      if (!data.success) {
        toast.error(data.message || 'Unable to delete salary template.');
        return;
      }
      setTemplateToDelete(null);
      toast.success(`Salary template "${template.name}" deleted.`);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete salary template.');
    } finally {
      setBusy(false);
    }
  };
  const calculation = calculateTemplate(draft);
  const datesValid = Boolean(draft.effectiveFrom && dayjs(draft.effectiveFrom).isValid()) &&
    (!draft.effectiveTo || (dayjs(draft.effectiveTo).isValid() && draft.effectiveTo >= draft.effectiveFrom));
  const groupValid = !draft.payGroupId || groups.some(group => group.id === draft.payGroupId && coversConfigurationWindow(group, draft.effectiveFrom, draft.effectiveTo));
  const available = currentComponentVersions(components, draft.effectiveFrom).filter(component => component.id && component.isActive &&
    !['BASIC', 'BASIC_PAY', 'HRA', 'LTA', 'OTHER_ALLOWANCE', 'BONUS'].includes(component.code.toUpperCase()));
  const componentsValid = (draft.components ?? []).every(item => available.some(component => component.id === item.componentId));
  const patch = (value: Partial<SalaryTemplate>) => setDraft(current => ({ ...current, ...value }));
  const revise = (template: SalaryTemplate) => {
    const baseName = template.name.replace(/\s*\(revision(?:\s+\d+)?\)\s*$/i, "").trim();
    setDraft({ ...template, id: undefined, version: undefined, isRetired: false, isActive: true, name: `${baseName} (revision)`,
      effectiveFrom: dayjs(template.effectiveFrom).format('YYYY-MM-DD'), effectiveTo: template.effectiveTo ? dayjs(template.effectiveTo).format('YYYY-MM-DD') : '',
      sourceTemplateId: template.id, sourceTemplateVersion: template.version ?? 1,
      components: (template.components ?? []).map(component => ({ ...component })) });
    setMessage('');
  };
  const retire = async () => {
    if (!canEdit || !retiring?.id || busy) return;
    setBusy(true); setMessage('');
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        `api/payroll/configuration/salary-templates/retire?templateId=${encodeURIComponent(retiring.id)}&version=${retiring.version ?? 1}`, {});
      if (!data.success) { setMessage(data.message || 'Unable to retire this template.'); return; }
      setRetiring(null);
      toast.success('Template retired. Existing employee assignments are unchanged.');
      await onSaved();
    } catch { setMessage('Unable to retire or refresh this template. Refresh the list before retrying.'); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!canEdit || busy || !draft.name.trim() || !datesValid || !groupValid || !componentsValid || !calculation.success) return;
    setBusy(true); setMessage('');
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>('api/payroll/configuration/salary-templates', {
        ...draft, id: undefined, name: draft.name.trim(), payGroupId: draft.payGroupId || undefined,
        effectiveFrom: `${draft.effectiveFrom}T00:00:00`, effectiveTo: draft.effectiveTo ? `${draft.effectiveTo}T00:00:00` : undefined,
      });
      if (!data.success) { setMessage(data.message || 'Unable to save the salary template.'); return; }
      setDraft(emptyDraft());
      toast.success('Salary template saved. Existing employee assignments are unchanged.');
      await onSaved();
    } catch { setMessage('Unable to save or refresh the salary templates. Refresh the list before retrying.'); }
    finally { setBusy(false); }
  };
  return <Stack spacing={3} sx={{ minWidth: 0 }}>
    <Alert severity="info">Templates are reusable starting points. A new revision does not change existing employee assignments or approved salaries. Assign the new template explicitly when needed.</Alert>
    {canEdit && (
      <Box
        component="section"
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 0.9)",
          bgcolor: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(248, 250, 252, 0.75)",
          boxShadow: isDark ? "0 4px 16px rgba(0, 0, 0, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.03)",
        }}
      >
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>{draft.sourceTemplateId ? 'Create template revision' : 'Create salary template'}</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><AppTextField fullWidth label="Template name" required value={draft.name} onChange={event => patch({ name: event.target.value })} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><AppTextField fullWidth select label="Pay group (optional)" value={draft.payGroupId || ''} onChange={event => patch({ payGroupId: event.target.value })} helperText="Use an unbound template for more than one pay group.">
            <MenuItem value="">Unbound template</MenuItem>
            {groups.filter(group => coversConfigurationWindow(group, draft.effectiveFrom, draft.effectiveTo)).map(group => <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>)}
            {!groupValid && <MenuItem value={draft.payGroupId} disabled>Unavailable for these dates</MenuItem>}
          </AppTextField></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><PayrollDateField label="Effective from" required value={draft.effectiveFrom} onChange={value => patch({ effectiveFrom: value })} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><PayrollDateField label="Effective to (optional)" value={draft.effectiveTo || ''} minDate={draft.effectiveFrom} onChange={value => patch({ effectiveTo: value })} helperText="Leave blank for an open-ended template." /></Grid>
        </Grid>
        <Typography variant="subtitle2">Monthly earnings</Typography>
        <Grid container spacing={2}>
          {amounts.map(([key, label]) => <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}><AppTextField fullWidth type="number" label={label} value={draft[key] ?? ''} inputProps={{ min: 0, step: 'any' }} onChange={event => patch({ [key]: event.target.value === '' ? undefined : Number(event.target.value) })} /></Grid>)}
        </Grid>
        <Typography variant="subtitle2">Additional earnings and deductions</Typography>
        {!available.length && <Typography variant="body2" color="text.secondary">No enabled custom components for the selected start date.</Typography>}
        <Grid container spacing={2}>
          {available.map(definition => {
            const selected = draft.components?.find(component => component.componentId === definition.id);
            return <Grid key={definition.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControlLabel label={`${definition.name} (${definition.kind.toLowerCase()})`} control={<AppCheckbox checked={Boolean(selected)} onChange={event => patch({ components: event.target.checked ? [...(draft.components ?? []), {
                componentId: definition.id, code: definition.code, name: definition.name, kind: definition.kind, calculationType: definition.calculationType,
                baseComponentCode: definition.baseComponentCode, isTaxable: definition.isTaxable, value: 0, sortOrder: (draft.components?.length ?? 0) + 100,
              }] : draft.components?.filter(component => component.componentId !== definition.id) })} />}/>
              {selected && <AppTextField fullWidth type="number" label={`${definition.name} ${definition.calculationType === 'FIXED' ? 'amount' : 'rate (%)'}`} value={selected.value} inputProps={{ min: 0, step: 'any' }} onChange={event => patch({ components: draft.components?.map(component => component.componentId === definition.id ? { ...component, value: Number(event.target.value) } : component) })} />}
            </Grid>;
          })}
        </Grid>
        {!componentsValid && <Alert severity="warning">
          Some copied components are unavailable for this date. Choose the current definitions or reset the form; amounts will not be silently discarded.
          {(draft.components ?? []).filter(item => !available.some(component => component.id === item.componentId)).map(item => <Box key={item.code} sx={{ mt: 1 }}>
            <Typography variant="body2">{item.name}: {item.value} ({item.calculationType === 'FIXED' ? 'amount' : 'rate'})</Typography>
            <AppButton variant="text" onClick={() => patch({ components: draft.components?.filter(component => component.code !== item.code) })}>Remove unavailable {item.name}</AppButton>
          </Box>)}
        </Alert>}
        {(!datesValid || !groupValid || !calculation.success) && <Alert severity="warning">{!datesValid ? 'Enter a valid effective date range.' : !groupValid ? 'The pay group must cover the complete template date range.' : !calculation.success ? calculation.errorMessage : ''}</Alert>}
        {message && <Alert severity="error">{message}</Alert>}
        <Box
          sx={{
            p: 2,
            bgcolor: isDark ? "rgba(11, 92, 171, 0.12)" : "rgba(11, 92, 171, 0.05)",
            borderRadius: "10px",
            border: "1px solid",
            borderColor: alpha("#0B5CAB", 0.2),
          }}
        >
          <Typography variant="body2" fontWeight={650}>
            {calculation.success
              ? `Gross ${currencyFormatter(calculation.gross)} · Deductions ${currencyFormatter(calculation.deductions)} · Net before statutory deductions ${currencyFormatter(calculation.net)}`
              : 'Resolve the calculation errors before saving.'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Excludes attendance adjustments and statutory deductions. This is not take-home pay.
          </Typography>
        </Box>
        <Box
          sx={{
            pt: 2,
            borderTop: "1px dashed",
            borderColor: "divider",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
          }}
        >
          <FormControlLabel
            label={<Typography variant="body2" fontWeight={650}>Available for new assignments</Typography>}
            control={<AppCheckbox checked={draft.isActive} onChange={event => patch({ isActive: event.target.checked })} />}
          />
          <Stack direction="row" spacing={1.5}>
            <AppButton
              variant="outlined"
              disabled={busy}
              onClick={() => { setDraft(emptyDraft()); setMessage(''); }}
              sx={{ height: 38, px: 2, textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
            >
              Reset form
            </AppButton>
            <AppButton
              variant="contained"
              disabled={busy || !draft.name.trim() || !datesValid || !groupValid || !componentsValid || !calculation.success}
              onClick={() => void save()}
              sx={{
                height: 38,
                px: 2.5,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                bgcolor: "#0B5CAB",
                boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                "&:hover": {
                  bgcolor: "#094a8a",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(11, 92, 171, 0.35)",
                },
                transition: "all 0.15s ease",
              }}
            >
              {busy ? 'Saving…' : draft.sourceTemplateId ? 'Save new revision' : 'Save template'}
            </AppButton>
          </Stack>
        </Box>
      </Stack>
    </Box>)}
    {!templates.length ? (
      <Alert severity="info">No salary templates yet. Create a reusable package above.</Alert>
    ) : (
      <TableContainer
        sx={{
          overflowX: 'auto',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
          borderRadius: '12px',
          boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(241, 245, 249, 0.85)' }}>
            <TableRow>
              {['Template', 'Pay group', 'Effective dates', 'Monthly gross', 'Deductions', 'Status', 'Actions'].map((label, idx) => (
                <TableCell
                  key={label}
                  align={idx === 6 ? 'right' : 'left'}
                  sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map(template => {
              const totals = calculateTemplate(template);
              return (
                <TableRow key={template.id || template.name} hover sx={{ '&:hover': { bgcolor: alpha('#0B5CAB', 0.03) } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{template.name}</Typography>
                    {template.sourceTemplateId && <Typography variant="caption" color="text.secondary">Separate revision</Typography>}
                  </TableCell>
                  <TableCell>{groups.find(group => group.id === template.payGroupId)?.name || 'Unbound'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {dayjs(template.effectiveFrom).format('DD MMM YYYY')} → {template.effectiveTo ? dayjs(template.effectiveTo).format('DD MMM YYYY') : 'Open-ended'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{totals.success ? currencyFormatter(totals.gross) : 'Invalid structure'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{totals.success ? currencyFormatter(totals.deductions) : '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={template.isRetired ? 'Retired' : template.isActive ? 'Active' : 'Inactive'}
                      color={template.isActive && !template.isRetired ? 'success' : 'default'}
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px' }}
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <AppButton
                          size="small"
                          variant="outlined"
                          disabled={busy || !template.id}
                          onClick={() => revise(template)}
                          sx={{ height: 28, fontSize: '0.75rem', textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                        >
                          Create revision
                        </AppButton>
                        {!template.isRetired && (
                          <AppButton
                            size="small"
                            variant="outlined"
                            color="warning"
                            disabled={busy || !template.id}
                            onClick={() => setRetiring(template)}
                            sx={{ height: 28, fontSize: '0.75rem', textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                          >
                            Retire
                          </AppButton>
                        )}
                        <AppButton
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={busy || !template.id}
                          onClick={() => setTemplateToDelete(template)}
                          sx={{ height: 28, fontSize: '0.75rem', textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                        >
                          Delete
                        </AppButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )}
    {retiring && <ConfirmationModal open title="Retire salary template?" content={`Retire ${retiring.name} from new selections? Existing employee assignments, approved salaries, and payroll history remain unchanged. Create a revision if you need a replacement.`} ok_btn confirming={busy} handleClose={() => { if (!busy) setRetiring(null); }} handleConfirmation={result => { if (result === 'ok') void retire(); }} />}
    {templateToDelete && (
      <ConfirmationModal
        open
        title="Delete salary template?"
        content={`Permanently delete "${templateToDelete.name}"? If any employees are assigned to this template, deletion will be blocked and you should retire it instead.`}
        ok_btn
        confirming={busy}
        handleClose={() => { if (!busy) setTemplateToDelete(null); }}
        handleConfirmation={result => { if (result === 'ok') void deleteTemplate(templateToDelete); }}
      />
    )}
  </Stack>;
}
