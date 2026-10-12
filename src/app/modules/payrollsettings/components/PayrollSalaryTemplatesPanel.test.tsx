import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../../../server/axios', () => ({ postRequest: post }));
vi.mock('./PayrollDateField', () => ({ PayrollDateField: ({ label, value }: { label: string; value: string }) => <input aria-label={label} value={value} readOnly /> }));
vi.mock('../../../shared/components/ConfirmModal', () => ({ ConfirmationModal: ({ handleConfirmation, handleClose }: { handleConfirmation: (result: string) => void; handleClose: () => void }) => <div><button onClick={() => handleConfirmation('ok')}>Confirm retirement</button><button onClick={handleClose}>Cancel retirement</button></div> }));
import { PayrollSalaryTemplatesPanel } from './PayrollSalaryTemplatesPanel';
import type { SalaryTemplate } from './payrollTemplateCalculation';
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let container: HTMLDivElement;
const template: SalaryTemplate = { id: 'original', version: 4, name: 'Engineer', basicPay: 30000, effectiveFrom: '2026-10-01', isActive: true,
  components: [{ componentId: 'meal', code: 'MEAL', name: 'Meal', kind: 'EARNING', calculationType: 'FIXED', value: 2000, isTaxable: true, sortOrder: 100 }] };
const definition = { id: 'meal', code: 'MEAL', name: 'Meal', kind: 'EARNING' as const, calculationType: 'FIXED' as const, isTaxable: true, effectiveFrom: '2026-10-01', isActive: true, version: 1 };
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); post.mockReset(); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
const button = (text: string) => Array.from(container.querySelectorAll('button')).find(item => item.textContent === text)!;
describe('Salary template lifecycle UI', () => {
  it('requires confirmation and sends the template version when retiring', async () => {
    post.mockResolvedValue({ data: { success: true } });
    const refresh = vi.fn().mockResolvedValue(undefined);
    await act(async () => root.render(<PayrollSalaryTemplatesPanel templates={[template]} groups={[]} components={[definition]} canEdit onSaved={refresh} />));
    await act(async () => button('Retire').click());
    expect(post).not.toHaveBeenCalled();
    await act(async () => button('Confirm retirement').click());
    expect(post).toHaveBeenCalledWith('api/payroll/configuration/salary-templates/retire?templateId=original&version=4', {});
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('does not offer another retirement for a retired template', async () => {
    await act(async () => root.render(<PayrollSalaryTemplatesPanel templates={[{ ...template, isActive: false, isRetired: true }]} groups={[]} components={[definition]} canEdit onSaved={vi.fn()} />));
    expect(container.textContent).toContain('Retired');
    expect(button('Retire')).toBeUndefined();
  });
  it('shows custom earnings in the persisted template total', async () => {
    await act(async () => root.render(<PayrollSalaryTemplatesPanel templates={[template]} groups={[]} components={[definition]} canEdit={false} onSaved={vi.fn()} />));
    expect(container.textContent).toContain('32,000');
    expect(button('Create revision')).toBeUndefined();
  });
  it('saves a separate revision with source identity and copied amounts', async () => {
    post.mockResolvedValue({ data: { success: true } });
    const refresh = vi.fn().mockResolvedValue(undefined);
    await act(async () => root.render(<PayrollSalaryTemplatesPanel templates={[template]} groups={[]} components={[definition]} canEdit onSaved={refresh} />));
    await act(async () => button('Create revision').click());
    expect(container.textContent).toContain('Create template revision');
    await act(async () => button('Save new revision').click());
    expect(post).toHaveBeenCalledWith('api/payroll/configuration/salary-templates', expect.objectContaining({ id: undefined, sourceTemplateId: 'original', sourceTemplateVersion: 4, basicPay: 30000, components: template.components }));
    expect(refresh).toHaveBeenCalledOnce();
    expect(template.name).toBe('Engineer');
  });
  it('retains the revision form and displays an API rejection', async () => {
    post.mockResolvedValue({ data: { success: false, message: 'Source changed; refresh it.' } });
    await act(async () => root.render(<PayrollSalaryTemplatesPanel templates={[template]} groups={[]} components={[definition]} canEdit onSaved={vi.fn()} />));
    await act(async () => button('Create revision').click());
    await act(async () => button('Save new revision').click());
    expect(container.textContent).toContain('Source changed; refresh it.');
    expect(container.textContent).toContain('Create template revision');
  });
  it('blocks a copied revision when its component is unavailable', async () => {
    await act(async () => root.render(<PayrollSalaryTemplatesPanel templates={[template]} groups={[]} components={[]} canEdit onSaved={vi.fn()} />));
    await act(async () => button('Create revision').click());
    expect((button('Save new revision') as HTMLButtonElement).disabled).toBe(true);
    expect(container.textContent).toContain('amounts will not be silently discarded');
    expect(post).not.toHaveBeenCalled();
  });
});
