import { useState } from 'react';
import { useSelector } from 'react-redux';

import { addHexPrefix } from 'ethereumjs-util';

import { multiplyCurrencies } from '../../../shared/modules/conversion.utils';
import { hexWEIToDecGWEI } from '../../helpers/utils/conversions.util';
import { SECONDARY } from '../../helpers/constants/common';
import { getShouldShowFiat } from '../../selectors';

import { useCurrencyDisplay } from '../useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../useUserPreferencedCurrency';
import { getGasFeeEstimate } from './utils';

export function useMaxPriorityFeePerGasInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  gasLimit,
  supportsEIP1559,
  transaction,
}) {
  const {
    currency: fiatCurrency,
    numberOfDecimals: fiatNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY);

  const showFiat = useSelector(getShouldShowFiat);

  const [initialMaxFeePerGas] = useState(
    supportsEIP1559 && !transaction?.txParams?.maxFeePerGas
      ? Number(hexWEIToDecGWEI(transaction?.txParams?.gasPrice))
      : Number(hexWEIToDecGWEI(transaction?.txParams?.maxFeePerGas)),
  );

  // fix initialMaxFeePerGas
  const [initialMaxPriorityFeePerGas] = useState(
    supportsEIP1559 && !transaction?.txParams?.maxPriorityFeePerGas
      ? initialMaxFeePerGas
      : Number(hexWEIToDecGWEI(transaction?.txParams?.maxPriorityFeePerGas)),
  );

  const [initialMatchingEstimateLevel] = useState(
    transaction?.userFeeLevel || null,
  );
  const initialFeeParamsAreCustom =
    initialMatchingEstimateLevel === 'custom' ||
    initialMatchingEstimateLevel === null;

  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(
    initialMaxPriorityFeePerGas && initialFeeParamsAreCustom
      ? initialMaxPriorityFeePerGas
      : null,
  );

  const maxPriorityFeePerGasToUse =
    maxPriorityFeePerGas ??
    getGasFeeEstimate(
      'suggestedMaxPriorityFeePerGas',
      gasFeeEstimates,
      gasEstimateType,
      estimateToUse,
      initialMaxPriorityFeePerGas,
    );

  // We need to display the estimated fiat currency impact of the
  // maxPriorityFeePerGas field to the user. This hook calculates that amount.
  const [, { value: maxPriorityFeePerGasFiat }] = useCurrencyDisplay(
    addHexPrefix(
      multiplyCurrencies(maxPriorityFeePerGasToUse, gasLimit, {
        toNumericBase: 'hex',
        fromDenomination: 'GWEI',
        toDenomination: 'WEI',
        multiplicandBase: 10,
        multiplierBase: 10,
      }),
    ),
    {
      numberOfDecimals: fiatNumberOfDecimals,
      currency: fiatCurrency,
    },
  );

  return {
    maxPriorityFeePerGas: maxPriorityFeePerGasToUse,
    setMaxPriorityFeePerGas,
    maxPriorityFeePerGasFiat: showFiat ? maxPriorityFeePerGasFiat : '',
  };
}
