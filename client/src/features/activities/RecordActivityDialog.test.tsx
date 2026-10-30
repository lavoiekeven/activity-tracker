import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordActivityDialog } from './RecordActivityDialog';

const users = [
  {
    _id: 'user-1',
    firstName: 'Avery',
    lastName: 'Morgan',
    email: 'avery@example.test',
    role: 'Manager',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  cleanup();
});

describe('RecordActivityDialog', () => {
  it('defaults the date and time to now and submits the configured time as UTC', async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      const input = JSON.parse(String(init?.body)) as {
        userId: string;
        activityType: string;
        description: string;
        timestamp: string;
      };
      return Promise.resolve(
        jsonResponse({
          ...input,
          _id: 'activity-1',
        }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const onCreated = vi.fn();
    const user = userEvent.setup();
    const beforeOpen = new Date();

    render(
      <RecordActivityDialog
        open
        users={users}
        projects={[]}
        onClose={vi.fn()}
        onCreated={onCreated}
      />,
    );

    const dateTimeInput = document.querySelector<HTMLInputElement>('input[type="datetime-local"]');
    if (!dateTimeInput) throw new Error('Date and time input was not rendered.');
    const initialDateTime = new Date(dateTimeInput.value);
    expect(initialDateTime.getTime()).toBeGreaterThanOrEqual(beforeOpen.getTime() - 60_000);
    expect(initialDateTime.getTime()).toBeLessThanOrEqual(Date.now() + 60_000);

    fireEvent.change(dateTimeInput, { target: { value: '2026-02-03T04:05' } });
    await user.click(screen.getByRole('combobox', { name: 'User' }));
    await user.click(screen.getByRole('option', { name: 'Avery Morgan' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Planning session');
    await user.click(screen.getByRole('button', { name: 'Record activity' }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledOnce();
    });
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      timestamp: string;
    };
    expect(requestBody.timestamp).toBe(new Date('2026-02-03T04:05').toISOString());
  });
});
