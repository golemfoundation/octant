// import { RegenStakerService } from '@golemfoundation/octant-v2-sdk';
// import { useMutation } from '@tanstack/react-query';
// import { addMinutes } from 'date-fns';
// import { erc20Abi, Hash, parseSignature, TransactionReceipt } from 'viem';
// import { usePublicClient, useWalletClient } from 'wagmi';
//
// import env from 'env';
// import { useTokenPermitStandard } from 'hooks/useTokenPermitStandard';
//
// import { useSignPermitMessageMutation } from './useSignPermitMessageMutation';
//
// type UseStakeMutationParams = {
//   depositAmount: bigint;
//   stakeTokenAddress: Hash;
// };
//
// // Return type inherited from useMutation
// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export const useStakeMutation = () => {
//   const { regenStakerContractAddress } = env;
//
//   const publicClient = usePublicClient();
//   const { data: walletClient } = useWalletClient();
//
//   const { getTokenPermitStandard } = useTokenPermitStandard();
//   const { mutateAsync: signPermitMessageMutationAsync } = useSignPermitMessageMutation();
//
//   return useMutation({
//     mutationFn: ({ depositAmount, stakeTokenAddress }: UseStakeMutationParams) =>
//       // eslint-disable-next-line no-async-promise-executor
//       new Promise<TransactionReceipt>(async (resolve, reject) => {
//         if (!walletClient) {
//           reject(new Error('walletClient is undefined'));
//           return;
//         }
//
//         if (!publicClient) {
//           reject(new Error('publicClient is undefined'));
//           return;
//         }
//
//         const regenStakerService = new RegenStakerService(
//           regenStakerContractAddress,
//           walletClient,
//           publicClient,
//         );
//
//         if (!regenStakerService) {
//           reject(new Error('regenStakerService is undefined'));
//           return;
//         }
//
//         const delegatee = walletClient.account.address;
//
//         try {
//           const allowance = await publicClient.readContract({
//             abi: erc20Abi,
//             address: stakeTokenAddress,
//             args: [walletClient.account.address, regenStakerContractAddress],
//             functionName: 'allowance',
//           });
//
//           const tokenPermitStandard = await getTokenPermitStandard(stakeTokenAddress);
//
//           if (depositAmount > allowance) {
//             // if (tokenPermitStandard === 'EIP-2612') {
//             //   // Deadline for off-chain signature validity (60 minutes)
//             //   const deadline = BigInt(Math.floor(addMinutes(new Date(), 60).getTime() / 1000));
//             //
//             //   const permitSignature = await signPermitMessageMutationAsync({
//             //     deadline,
//             //     depositAmount,
//             //     stakeTokenAddress,
//             //   });
//             //   const { v, r, s } = parseSignature(permitSignature);
//             //
//             //   const permitAndStakeTransactionHash = await regenStakerService.permitAndStake({
//             //     amount: depositAmount,
//             //     claimer: delegatee,
//             //     deadline,
//             //     delegatee,
//             //     r,
//             //     s,
//             //     v: Number(v),
//             //   });
//             //
//             //   const permitAndStakeTransactionReceipt = await publicClient.waitForTransactionReceipt(
//             //     {
//             //       hash: permitAndStakeTransactionHash,
//             //     },
//             //   );
//             //
//             //   resolve(permitAndStakeTransactionReceipt);
//             //   return;
//             // }
//
//             await walletClient.writeContract({
//               abi: erc20Abi,
//               address: stakeTokenAddress,
//               args: [regenStakerContractAddress, depositAmount],
//               functionName: 'approve',
//             });
//           }
//
//           const stakeTransactionHash = await regenStakerService.stake(depositAmount, delegatee);
//           const stakeTransactionReceipt = await publicClient!.waitForTransactionReceipt({
//             hash: stakeTransactionHash,
//           });
//
//           resolve(stakeTransactionReceipt);
//         } catch (error) {
//           reject(error);
//         }
//       }),
//   });
// };
