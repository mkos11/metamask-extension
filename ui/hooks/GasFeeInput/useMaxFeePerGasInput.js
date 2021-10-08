import { useState } from 'react';

import { getMaximumGasTotalInHexWei } from '../../../shared/modules/gas.utils';
import { SECONDARY } from '../../helpers/constants/common';
import { GAS_ESTIMATE_TYPES } from '../../../shared/constants/gas';
import {
  decGWEIToHexWEI,
  hexWEIToDecGWEI,
  decimalToHex,
} from '../../helpers/utils/conversions.util';

import { useCurrencyDisplay } from '../useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../useUserPreferencedCurrency';
import { getGasFeeEstimate } from './utils';

export function useMaxFeePerGasInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  gasLimit,
  gasPrice,
  supportsEIP1559,
  transaction,
}) {
  const {
    currency: fiatCurrency,
    numberOfDecimals: fiatNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY);

  const [initialMaxFeePerGas] = useState(
    supportsEIP1559 && !transaction?.txParams?.maxFeePerGas
      ? Number(hexWEIToDecGWEI(transaction?.txParams?.gasPrice))
      : Number(hexWEIToDecGWEI(transaction?.txParams?.maxFeePerGas)),
  );

  const [initialMatchingEstimateLevel] = useState(
    transaction?.userFeeLevel || null,
  );
  const initialFeeParamsAreCustom =
    initialMatchingEstimateLevel === 'custom' ||
    initialMatchingEstimateLevel === null;

  // This hook keeps track of a few pieces of transitional state. It is
  // transitional because it is only used to modify a transaction in the
  // metamask (background) state tree.
  const [maxFeePerGas, setMaxFeePerGas] = useState(
    initialMaxFeePerGas && initialFeeParamsAreCustom
      ? initialMaxFeePerGas
      : null,
  );

  const maximumCostInHexWei = getMaximumGasTotalInHexWei({
    gasLimit: decimalToHex(gasLimit),
    gasPrice:
      !supportsEIP1559 && gasEstimateType !== GAS_ESTIMATE_TYPES.NONE
        ? decGWEIToHexWEI(gasPrice)
        : undefined,
    maxFeePerGas: supportsEIP1559
      ? decGWEIToHexWEI(maxFeePerGas || gasPrice || '0')
      : undefined,
  });

  // We need to display thee estimated fiat currency impact of the maxFeePerGas
  // field to the user. This hook calculates that amount. This also works for
  // the gasPrice amount because in legacy transactions cost is always gasPrice
  // * gasLimit.
  const [, { value: maxFeePerGasFiat }] = useCurrencyDisplay(
    maximumCostInHexWei,
    {
      numberOfDecimals: fiatNumberOfDecimals,
      currency: fiatCurrency,
    },
  );

  // We specify whether to use the estimate value by checking if the state
  // value has been set. The state value is only set by user input and is wiped
  // when the user selects an estimate. Default here is '0' to avoid bignumber
  // errors in later calculations for nullish values.
  const maxFeePerGasToUse =
    maxFeePerGas ??
    getGasFeeEstimate(
      'suggestedMaxFeePerGas',
      gasFeeEstimates,
      gasEstimateType,
      estimateToUse,
      initialMaxFeePerGas,
    );

  return {
    maxFeePerGas: maxFeePerGasToUse,
    setMaxFeePerGas,
    maxFeePerGasFiat,
  };
}
