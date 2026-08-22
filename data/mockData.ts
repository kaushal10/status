import { Group, User } from '../types';

export const users: User[] = [
  {
    id: 'me',
    name: 'Kaushal',
    phone: '9999999999',
    available: false,
  },
  {
    id: '1',
    name: 'John',
    phone: '9876543210',
    available: true,
  },
  {
    id: '2',
    name: 'Rahul',
    phone: '9876543211',
    available: false,
  },
  {
    id: '3',
    name: 'Amit',
    phone: '9876543212',
    available: true,
  },
  {
    id: '4',
    name: 'Priya',
    phone: '9876543213',
    available: false,
  },
];

export const groups: Group[] = [
  {
    id: '1',
    name: 'Football',
    memberIds: ['me', '1', '2', '3'],
  },
  {
    id: '2',
    name: 'Weekend',
    memberIds: ['me', '1', '4'],
  },
  {
    id: '3',
    name: 'Goa Trip',
    memberIds: ['2', '4'],
  },
];

export const CURRENT_USER_ID = 'me';