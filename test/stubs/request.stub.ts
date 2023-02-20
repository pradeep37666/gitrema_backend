import mongoose from 'mongoose';

export const RequestStub = () => {
  return {
    user: {
      userId: new mongoose.Types.ObjectId('63d299a9a6948cecdab48901'),
      supplierId: new mongoose.Types.ObjectId('63d299a9a6948cecdab48901'),
    },
  };
};
export const TokenStub = () => {
  return {
    token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1bWl0MUBnbWFpbC5jb20iLCJ1c2VySWQiOiI2M2QyYzdiZWI2MmI5YzM2MzBkNGNmZjEiLCJzdXBwbGllcklkIjoiNjNkMmM3YmRiNjJiOWMzNjMwZDRjZmVkIiwicm9sZUlkIjoiNjNkMmM3OTViNjJiOWMzNjMwZDRjZmU5IiwiaWF0IjoxNjc0NzU4MDg5fQ.cyWsHljvpvjI_qZg-axvNFbod1sWkmfCptBhP3OSioo',
  };
};
