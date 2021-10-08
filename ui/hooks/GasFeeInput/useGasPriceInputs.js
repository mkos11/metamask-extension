import { useState } from 'react';
import { useSelector } from 'react-redux';
import { isEqual } from 'lodash';

import { GAS_ESTIMATE_TYPES } from '../../../shared/constants/gas';
import { getAdvancedInlineGasShown } from '../../selectors';
import { hexWEIToDecGWEI } from '../../helpers/utils/conversions.util';
import { isLegacyTransaction } from '../../helpers/utils/transactions.util';

import { useGasFeeEstimates } from '../useGasFeeEstimates';

function getGasPriceEstimate(gasFeeEstimates, gasEstimateType, estimateToUse) {
  if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
    return gasFeeEstimates?.[estimateToUse] ?? '0';
  } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
    return gasFeeEstimates?.gasPrice ?? '0';
  }
  return '0';
}

export function useGasPriceInputs(
  defaultEstimateToUse = 'medium',
  transaction,
) {
  // We need the gas estimates from the GasFeeController in the background.
  // Calling this hooks initiates polling for new gas estimates and returns the
  // current estimate.
  const { gasEstimateType, gasFeeEstimates } = useGasFeeEstimates();

  const [initialGasPrice] = useState(
    Number(hexWEIToDecGWEI(transaction?.txParams?.gasPrice)),
  );

  const initialFeeParamsAreCustom =
    transaction?.userFeeLevel === 'custom' || !transaction?.userFeeLevel;

  const [gasPriceHasBeenManuallySet, setGasPriceHasBeenManuallySet] = useState(
    transaction?.userFeeLevel === 'custom',
  );
  const [gasPrice, setGasPrice] = useState(
    initialGasPrice && initialFeeParamsAreCustom ? initialGasPrice : null,
  );

  const userPrefersAdvancedGas = useSelector(getAdvancedInlineGasShown);

  const [estimateToUse] = useState(() => {
    if (
      userPrefersAdvancedGas &&
      transaction?.txParams?.maxPriorityFeePerGas &&
      transaction?.txParams?.maxFeePerGas
    )
      return null;
    return transaction?.userFeeLevel || defaultEstimateToUse;
  });

  const [initialGasPriceEstimates] = useState(gasFeeEstimates);
  const gasPriceEstimatesHaveNotChanged = isEqual(
    initialGasPriceEstimates,
    gasFeeEstimates,
  );
  const gasPriceToUse =
    gasPrice !== null &&
    (gasPriceHasBeenManuallySet ||
      gasPriceEstimatesHaveNotChanged ||
      isLegacyTransaction(transaction?.txParams))
      ? gasPrice
      : getGasPriceEstimate(
          gasFeeEstimates,
          gasEstimateType,
          estimateToUse || defaultEstimateToUse,
        );

  return {
    gasPrice: gasPriceToUse,
    setGasPrice,
    setGasPriceHasBeenManuallySet,
  };
}
