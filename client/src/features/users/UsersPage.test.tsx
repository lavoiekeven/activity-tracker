import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsersPage } from './UsersPage';

const userRecords = [
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
  {
    _id: 'user-2',
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan@example.test',
    role: 'Reviewer',
    isActive: false,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  cleanup();
});

describe('UsersPage', () => {
  it('loads users and filters the list by name and email', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(userRecords)));
    const user = userEvent.setup();

    render(<UsersPage />);
    expect(await screen.findByText('Avery Morgan')).toBeTruthy();
    expect(screen.getByText('Jordan Lee')).toBeTruthy();

    await user.type(screen.getByRole('textbox', { name: 'Search users' }), 'jordan@');

    expect(screen.getByText('Jordan Lee')).toBeTruthy();
    expect(screen.queryByText('Avery Morgan')).toBeNull();
  });

  it('validates required fields before making a create request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(userRecords));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<UsersPage />);
    await screen.findByText('Avery Morgan');
    await user.click(screen.getByRole('button', { name: 'Add user' }));
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole('dialog', { name: 'Add user' })).toBeTruthy();
  });

  it('loads a user detail record in the view dialog', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      return Promise.resolve(jsonResponse(url.endsWith('/user-1') ? userRecords[0] : userRecords));
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<UsersPage />);
    await screen.findByText('Avery Morgan');
    const [firstViewButton] = screen.getAllByRole('button', { name: 'View' });
    if (!firstViewButton) throw new Error('Expected a user view button.');
    await user.click(firstViewButton);

    const detailsDialog = await screen.findByRole('dialog', { name: 'Avery Morgan' });
    expect(within(detailsDialog).getByText('avery@example.test')).toBeTruthy();
    expect(within(detailsDialog).getByText(/Last updated:/)).toBeTruthy();
  });
});
