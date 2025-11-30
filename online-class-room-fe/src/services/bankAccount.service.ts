// src/services/bankAccount.service.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface BankAccountDto {
  bankName: string;
  accountNumber?: string; // optional on update
  accountHolderName: string;
  branch?: string | null;
  isPrimary?: boolean;
}

export interface BankAccountResp {
  bankAccountId: number;
  bankName: string;
  accountNumberMasked?: string;
  accountHolderName: string;
  branch?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export const bankAccountApi = createApi({
  reducerPath: 'bankAccountApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://qlkhtt-backend-production.up.railway.app/',
    prepareHeaders: (headers) => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          const accessToken = userData ? userData.accessToken : null;
          if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
        } catch (e) {
          // no-op
        }
      }
      return headers;
    },
  }),
  refetchOnMountOrArgChange: true,
  endpoints: (build) => ({
    // GET api/BankAccounts/me
    getMyBankAccounts: build.query<BankAccountResp[], void>({
      query: () => ({
        url: 'api/BankAccounts/me',
        method: 'get',
      }),
      transformResponse: (response: any) => {
        // backend sometimes wraps payload in { dataObject }
        if (response?.dataObject) return response.dataObject as BankAccountResp[];
        return response as BankAccountResp[];
      },
    }),

    // GET api/BankAccounts/{id}
    getBankAccountById: build.query<BankAccountResp, number>({
      query: (id: number) => `api/BankAccounts/${id}`,
      transformResponse: (response: any) => {
        if (response?.dataObject) return response.dataObject as BankAccountResp;
        return response as BankAccountResp;
      },
    }),

    // POST api/BankAccounts
    createBankAccount: build.mutation<BankAccountResp, BankAccountDto>({
      query: (body: BankAccountDto) => ({
        url: 'api/BankAccounts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        if (response?.dataObject) return response.dataObject as BankAccountResp;
        return response as BankAccountResp;
      },
    }),

    // PUT api/BankAccounts/{id}
    updateBankAccount: build.mutation<BankAccountResp, { id: number; body: BankAccountDto }>({
      query: ({ id, body }) => ({
        url: `api/BankAccounts/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => {
        if (response?.dataObject) return response.dataObject as BankAccountResp;
        return response as BankAccountResp;
      },
    }),

    // DELETE api/BankAccounts/{id}
    deleteBankAccount: build.mutation<void, number>({
      query: (id: number) => ({
        url: `api/BankAccounts/${id}`,
        method: 'DELETE',
      }),
      // no transformResponse needed
    }),
  }),
});

export const {
  useGetMyBankAccountsQuery,
  useGetBankAccountByIdQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankAccountApi;
