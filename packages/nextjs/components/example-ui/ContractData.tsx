import { Address } from "../scaffold-eth";
import humanizeDuration from "humanize-duration";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  useAccountBalance,
  useAnimationConfig,
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

export const ContractData = () => {
  const { address } = useAccount();

  const { data: rewardRatePerSecond } = useScaffoldContractRead({
    contractName: "Staker",
    functionName: "rewardRatePerSecond",
  });

  const { data: claimPeriodLeft } = useScaffoldContractRead({
    contractName: "Staker",
    functionName: "claimPeriodLeft",
    watch: true,
  });

  const { data: withdrawalTimeLeft } = useScaffoldContractRead({
    contractName: "Staker",
    functionName: "withdrawalTimeLeft",
    watch: true,
  });

  useScaffoldEventSubscriber({
    contractName: "Staker",
    eventName: "Stake",
    listener: logs => {
      logs.map(log => {
        const { sender, amount } = log.args;
        console.log("📡 Stake event", sender, amount);
      });
    },
  });

  const {
    data: myStakeEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "Staker",
    eventName: "Stake",
    fromBlock: process.env.NEXT_PUBLIC_DEPLOY_BLOCK ? BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) : 0n,
    filters: { sender: address },
    blockData: true,
  });

  console.log("Events:", isLoadingEvents, errorReadingEvents, myStakeEvents);

  const { data: stakerContract } = useScaffoldContract({ contractName: "Staker" });
  console.log("stakerContract: ", stakerContract);

  const { data: externalContract } = useScaffoldContract({ contractName: "ExampleExternalContract" });
  console.log("externalContract: ", externalContract);

  const { balance: stakedBalance } = useAccountBalance(stakerContract?.address);
  const { balance: lockedBalance } = useAccountBalance(externalContract?.address);

  const { showAnimation } = useAnimationConfig(rewardRatePerSecond);

  return (
    <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div
        className={`flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full ${
          showAnimation ? "animate-zoom" : ""
        }`}
      >
        <div className="flex justify-between w-full">
          <div className="bg-secondary border border-primary rounded-xl m-2 flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">Staker Contract </div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              <Address address={stakerContract?.address} size="sm" />
            </div>
          </div>
          <div className="bg-secondary border border-primary rounded-xl m-2 flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">APY Per Block </div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              {rewardRatePerSecond ? formatEther(rewardRatePerSecond) : "0"}
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div className="bg-secondary border border-primary rounded-xl m-2 flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">Claim Period Left </div>
            <div className="text-2xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              {claimPeriodLeft ? humanizeDuration(parseInt(claimPeriodLeft.toString()) * 1000) : "0 Sec Left"}
            </div>
          </div>
          <div className="bg-secondary border border-primary rounded-xl m-2 flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">Withdrawal Period Left </div>
            <div className="text-2xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              {withdrawalTimeLeft ? humanizeDuration(parseInt(withdrawalTimeLeft.toString()) * 1000) : "0 Sec Left"}
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div className="bg-secondary border border-primary rounded-xl m-2 flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">Total Available ETH in Contract </div>
            <div className="text-2xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              {stakedBalance}
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div className="bg-secondary border border-primary rounded-xl m-2 flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">ETH Locked 🔒 in Staker Contract </div>
            <div className="text-2xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              {lockedBalance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
