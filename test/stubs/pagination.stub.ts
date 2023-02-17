import { PaginationDto } from 'src/core/Constants/pagination';

export const PaginationStub = (): PaginationDto => {
  return {
    page: 1,
    limit: 10,
    pagination: true,
  };
};
