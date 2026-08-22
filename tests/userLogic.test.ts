import {
    findUserByPhone,
    normalizePhone,
} from '../libs/groupLogic';

import { User } from '../types';

const users: User[] = [
  {
    id: 'user-1',
    name: 'John',
    phone: '9876543210',
    available: true,
  },
  {
    id: 'user-2',
    name: 'Rahul',
    phone: '9876543211',
    available: false,
  },
];

describe('userLogic', () => {
  test('normalizes a phone number', () => {
    expect(
      normalizePhone(
        '+91 98765-43210'
      )
    ).toBe('919876543210');
  });

  test('finds a user by phone', () => {
    const user =
      findUserByPhone(
        users,
        '9876543210'
      );

    expect(user?.id).toBe(
      'user-1'
    );
  });

  test('finds a user when phone formatting differs', () => {
    const user =
      findUserByPhone(
        users,
        '98765 43210'
      );

    expect(user?.id).toBe(
      'user-1'
    );
  });

  test('returns undefined for unknown phone', () => {
    const user =
      findUserByPhone(
        users,
        '9999999999'
      );

    expect(user).toBeUndefined();
  });
});