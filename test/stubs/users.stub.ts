import { UserCreateDto } from 'src/users/users.dto';

export const UserCreateStub = (): UserCreateDto => {
  return {
    name: 'Sumit',
    phoneNumber: '1234567890',
  };
};
