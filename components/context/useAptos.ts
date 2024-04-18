import { useMemo } from 'react';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

function useAptos() {
  const moduleAddress = "0xcfcdcdf5798fd485e834f4cdf657685a68746bad02f439880f6707b0ccc57220";
  
  const aptos = useMemo(() => {
    const aptosConfig = new AptosConfig({ network: Network.DEVNET });
    return new Aptos(aptosConfig);
  }, []);

  return { aptos, moduleAddress };
}

export default useAptos;
